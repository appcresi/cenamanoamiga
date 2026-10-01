"use server";

import { FieldValue } from "firebase-admin/firestore";
import { buscarInvitados, obtenerEvento } from "@/lib/consultas";
import { adminDb } from "@/lib/firebase/admin";
import { horaArgentina, tokenDeQr } from "@/lib/ingreso";
import type { Grupo, Invitado, Mesa } from "@/lib/tipos";
import { nombreCompleto } from "@/lib/utilidades";

type DatosInvitado = { nombre: string; organizacion: string | null; mesas: number[]; hora: string };

export type ResultadoIngreso =
  | ({ estado: "ok" } & DatosInvitado)
  | ({ estado: "repetido" } & DatosInvitado)
  | { estado: "grupo"; nombre: string; mesas: number[]; ingresados: number; lugares: number | null }
  | { estado: "no_encontrado" | "deshabilitado" | "error"; mensaje: string };

async function numerosDeMesas(ids: string[]): Promise<number[]> {
  if (!ids.length) return [];
  const db = adminDb();
  const snaps = await db.getAll(...ids.map((id) => db.doc(`mesas/${id}`)));
  return snaps
    .filter((s) => s.exists)
    .map((s) => (s.data() as Mesa).numero)
    .sort((a, b) => a - b);
}

/** Para quien no trae el QR: invitados que coinciden con el nombre, para elegir y registrar. */
export async function buscarParaIngreso(texto: string): Promise<{ token: string; nombre: string }[]> {
  if (texto.trim().length < 3 || !(await obtenerEvento()).ingresoHabilitado) return [];
  return buscarInvitados(texto);
}

/**
 * Registra el ingreso a partir del texto de un QR (link de invitación) o del token de un invitado.
 * Solo funciona si está habilitado en los datos del evento (se valida acá, en el servidor).
 */
export async function registrarIngreso(qr: string): Promise<ResultadoIngreso> {
  if (!(await obtenerEvento()).ingresoHabilitado) {
    return { estado: "deshabilitado", mensaje: "El registro de ingreso no está habilitado." };
  }

  try {
    const db = adminDb();
    const token = tokenDeQr(qr);
    if (!token) return { estado: "no_encontrado", mensaje: "Este QR no es una invitación de la cena." };

    const invitados = await db.collection("invitados").where("token", "==", token).limit(1).get();

    if (!invitados.empty) {
      const ref = invitados.docs[0].ref;
      // Transacción: si dos celulares escanean el mismo QR a la vez, se registra una sola vez.
      const { invitado, previo, ahora } = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const datos = snap.data() as Invitado;
        const momento = new Date().toISOString();
        // Si ingresó, asistió: se confirma aunque no hubiera respondido antes.
        if (!datos.ingreso) tx.update(ref, { ingreso: momento, asistencia: "confirmado" });
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

    return { estado: "no_encontrado", mensaje: "No encontramos esta invitación. Puede haber sido eliminada." };
  } catch (error) {
    console.error("Error registrando ingreso:", error);
    return { estado: "error", mensaje: "No se pudo registrar. Probá de nuevo." };
  }
}
