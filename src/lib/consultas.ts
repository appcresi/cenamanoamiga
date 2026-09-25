import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { ordenarSentados } from "@/lib/plano";
import {
  EVENTO_POR_DEFECTO,
  type Evento,
  type Grupo,
  type Invitado,
  type Mesa,
  type VistaInvitacion,
} from "@/lib/tipos";
import { nombreCompleto, normalizarDni, normalizarTexto } from "@/lib/utilidades";

export async function obtenerEvento(): Promise<Evento> {
  try {
    const snap = await adminDb().doc("evento/principal").get();
    return { ...EVENTO_POR_DEFECTO, ...(snap.data() as Partial<Evento> | undefined) };
  } catch (error) {
    console.error("No se pudo leer el evento:", error);
    return EVENTO_POR_DEFECTO;
  }
}

/** Todas las mesas ordenadas por número, con lo justo para dibujar el plano. */
async function obtenerMesas(): Promise<VistaInvitacion["plano"]["mesas"]> {
  const snap = await adminDb().collection("mesas").get();
  return snap.docs
    .map((d) => {
      const m = d.data() as Mesa;
      return {
        id: d.id,
        numero: m.numero,
        nombre: m.nombre ?? "",
        capacidad: m.capacidad,
        ...(m.x != null && m.y != null ? { x: m.x, y: m.y } : {}),
      };
    })
    .sort((a, b) => a.numero - b.numero);
}

function armarVista(
  base: Omit<VistaInvitacion, "mesas" | "plano">,
  mesas: VistaInvitacion["plano"]["mesas"],
  mesaIds: string[],
  silla: VistaInvitacion["plano"]["silla"],
): VistaInvitacion {
  const destacadas = mesas.filter((m) => mesaIds.includes(m.id));
  return {
    ...base,
    mesas: destacadas.map((m) => ({ numero: m.numero, nombre: m.nombre })),
    plano: { mesas, destacadas: destacadas.map((m) => m.id), silla },
  };
}

/** Qué lugar de la mesa le toca al invitado (mismo orden que el plano del panel). */
async function indiceSilla(invitadoId: string, mesaId: string): Promise<number> {
  const snap = await adminDb().collection("invitados").where("mesaId", "==", mesaId).get();
  const sentados = ordenarSentados(snap.docs.map((d) => ({ ...(d.data() as Invitado), id: d.id })));
  return sentados.findIndex((i) => i.id === invitadoId);
}

async function vistaDeGrupo(id: string, grupo: Grupo, conIntegrantes: boolean): Promise<VistaInvitacion> {
  const [mesas, integrantes] = await Promise.all([
    obtenerMesas(),
    conIntegrantes
      ? adminDb().collection("invitados").where("grupoId", "==", id).get()
      : Promise.resolve(null),
  ]);
  return armarVista(
    {
      tipo: "grupo",
      titulo: grupo.nombre,
      grupo: null,
      lugares: conIntegrantes ? grupo.lugares || null : null,
      integrantes: integrantes?.docs.map((d) => nombreCompleto(d.data() as Invitado)).sort() ?? [],
    },
    mesas,
    grupo.mesaIds ?? [],
    null,
  );
}

export async function buscarPorToken(token: string): Promise<VistaInvitacion | null> {
  if (!/^[A-Za-z0-9]{6,40}$/.test(token)) return null;
  const db = adminDb();

  const invitados = await db.collection("invitados").where("token", "==", token).limit(1).get();
  if (!invitados.empty) {
    const doc = invitados.docs[0];
    const invitado = doc.data() as Invitado;
    const grupoSnap = invitado.grupoId ? await db.doc(`grupos/${invitado.grupoId}`).get() : null;
    const grupo = grupoSnap?.exists ? (grupoSnap.data() as Grupo) : null;
    const mesaIds = invitado.mesaId ? [invitado.mesaId] : (grupo?.mesaIds ?? []);
    const [mesas, indice] = await Promise.all([
      obtenerMesas(),
      invitado.mesaId ? indiceSilla(doc.id, invitado.mesaId) : Promise.resolve(-1),
    ]);
    return armarVista(
      { tipo: "invitado", titulo: nombreCompleto(invitado), grupo: grupo?.nombre ?? null, lugares: null, integrantes: [] },
      mesas,
      mesaIds,
      invitado.mesaId && indice >= 0 ? { mesaId: invitado.mesaId, indice } : null,
    );
  }

  const grupos = await db.collection("grupos").where("token", "==", token).limit(1).get();
  if (!grupos.empty) {
    const doc = grupos.docs[0];
    return vistaDeGrupo(doc.id, doc.data() as Grupo, true);
  }

  return null;
}

/** Vista pública de una organización (desde la búsqueda): sin nombres de invitados. */
export async function buscarOrganizacion(id: string): Promise<VistaInvitacion | null> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return null;
  const snap = await adminDb().doc(`grupos/${id}`).get();
  if (!snap.exists) return null;
  const grupo = snap.data() as Grupo;
  if (grupo.tipo === "particular") return null;
  return vistaDeGrupo(id, grupo, false);
}

/** Organizaciones (no particulares) cuyo nombre contiene el texto buscado. */
export async function buscarOrganizaciones(texto: string): Promise<{ id: string; nombre: string }[]> {
  const buscado = normalizarTexto(texto);
  if (buscado.length < 3) return [];
  const snap = await adminDb().collection("grupos").get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Grupo), id: d.id }))
    .filter((g) => g.tipo !== "particular" && normalizarTexto(g.nombre).includes(buscado))
    .map((g) => ({ id: g.id, nombre: g.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .slice(0, 8);
}

/** Devuelve el token del invitado con ese DNI, o null. */
export async function tokenPorDni(dni: string): Promise<string | null> {
  const limpio = normalizarDni(dni);
  if (limpio.length < 6) return null;
  const snap = await adminDb().collection("invitados").where("dni", "==", limpio).limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as Invitado).token;
}
