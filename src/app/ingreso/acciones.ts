"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { horaArgentina, ingresoHabilitado, TEXTO_INICIO_INGRESO, tokenDeQr } from "@/lib/ingreso";
import type { Grupo, Invitado, Mesa } from "@/lib/tipos";
import { nombreCompleto, normalizarDni } from "@/lib/utilidades";

type DatosInvitado = { nombre: string; organizacion: string | null; mesas: number[]; hora: string };

export type ResultadoIngreso =
  | ({ estado: "ok" } & DatosInvitado)
  | ({ estado: "repetido" } & DatosInvitado)
  | { estado: "grupo"; nombre: string; mesas: number[]; ingresados: number; lugares: number | null }
  | { estado: "no_encontrado" | "fuera_de_horario" | "error"; mensaje: string };

async function numerosDeMesas(ids: string[]): Promise<number[]> {
  if (!ids.length) return [];
  const db = adminDb();
  const snaps = await db.getAll(...ids.map((id) => db.doc(`mesas/${id}`)));
  return snaps
    .filter((s) => s.exists)
    .map((s) => (s.data() as Mesa).numero)
    .sort((a, b) => a - b);
}

/**
 * Registra el ingreso a partir del texto de un QR (link de invitación) o de un DNI.
 * Solo funciona dentro del horario del evento (se valida acá, en el servidor).
 */
export async function registrarIngreso(entrada: { qr?: string; dni?: string }): Promise<ResultadoIngreso> {
  if (!ingresoHabilitado()) {
    return { estado: "fuera_de_horario", mensaje: `El registro de ingreso se habilita el ${TEXTO_INICIO_INGRESO}.` };
  }

  try {
    const db = adminDb();
    const token = entrada.qr ? tokenDeQr(entrada.qr) : null;
    const dni = entrada.dni ? normalizarDni(entrada.dni) : "";
    if (!token && dni.length < 6) {
      return {
        estado: "no_encontrado",
        mensaje: entrada.qr ? "Este QR no es una invitación de la cena." : "Ingresá un DNI válido.",
      };
    }

    const consulta = token
      ? db.collection("invitados").where("token", "==", token).limit(1)
      : db.collection("invitados").where("dni", "==", dni).limit(1);
    const invitados = await consulta.get();

    if (!invitados.empty) {
      const ref = invitados.docs[0].ref;
      // Transacción: si dos celulares escanean el mismo QR a la vez, se registra una sola vez.
      const { invitado, previo, ahora } = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const datos = snap.data() as Invitado;
        const momento = new Date().toISOString();
        if (!datos.ingreso) tx.update(ref, { ingreso: momento });
        return { invitado: datos, previo: datos.ingreso ?? null, ahora: momento };
      });
      const grupo = invitado.grupoId ? await db.doc(`grupos/${invitado.grupoId}`).get() : null;
      const datosGrupo = grupo?.exists ? (grupo.data() as Grupo) : null;
      const mesaIds = invitado.mesaId ? [invitado.mesaId] : (datosGrupo?.mesaIds ?? []);
      return {
        estado: previo ? "repetido" : "ok",
        nombre: nombreCompleto(invitado),
        organizacion: datosGrupo?.nombre ?? null,
        mesas: await numerosDeMesas(mesaIds),
        hora: horaArgentina(previo ?? ahora),
      };
    }

    if (token) {
      const grupos = await db.collection("grupos").where("token", "==", token).limit(1).get();
      if (!grupos.empty) {
        // QR de una organización: cada escaneo es una persona más que ingresa.
        const ref = grupos.docs[0].ref;
        await ref.update({ ingresados: FieldValue.increment(1) });
        const grupo = (await ref.get()).data() as Grupo;
        return {
          estado: "grupo",
          nombre: grupo.nombre,
          mesas: await numerosDeMesas(grupo.mesaIds ?? []),
          ingresados: grupo.ingresados ?? 1,
          lugares: grupo.lugares || null,
        };
      }
    }

    return {
      estado: "no_encontrado",
      mensaje: token ? "No encontramos esta invitación. Puede haber sido eliminada." : "No hay un invitado con ese DNI.",
    };
  } catch (error) {
    console.error("Error registrando ingreso:", error);
    return { estado: "error", mensaje: "No se pudo registrar. Probá de nuevo." };
  }
}
