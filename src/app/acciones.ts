"use server";

import { redirect } from "next/navigation";
import { buscarInvitados, buscarOrganizaciones } from "@/lib/consultas";

export interface EstadoBusqueda {
  error: string | null;
  /** Varias personas u organizaciones coinciden: el invitado elige la suya. */
  opciones: { href: string; nombre: string; tipo: "invitado" | "organizacion" }[];
}

const ERROR_TECNICO: EstadoBusqueda = {
  error: "No pudimos hacer la búsqueda. Probá de nuevo en unos minutos.",
  opciones: [],
};

/** Busca por nombre de invitado o de organización. */
export async function buscarInvitacion(
  _anterior: EstadoBusqueda,
  formData: FormData,
): Promise<EstadoBusqueda> {
  const consulta = String(formData.get("consulta") ?? "").trim();

  if (consulta.length < 3) {
    return { error: "Escribí al menos 3 letras de tu nombre o de la organización.", opciones: [] };
  }

  let opciones: EstadoBusqueda["opciones"];
  try {
    const [organizaciones, invitados] = await Promise.all([
      buscarOrganizaciones(consulta),
      buscarInvitados(consulta),
    ]);
    opciones = [
      ...invitados.map((i) => ({ href: `/invitacion/${i.token}`, nombre: i.nombre, tipo: "invitado" as const })),
      ...organizaciones.map((o) => ({ href: `/organizacion/${o.id}`, nombre: o.nombre, tipo: "organizacion" as const })),
    ];
  } catch (error) {
    console.error("Error buscando por nombre:", error);
    return ERROR_TECNICO;
  }
  if (!opciones.length) {
    return {
      error:
        "No encontramos ese nombre. Probá con tu nombre, tu apellido o el nombre de tu organización.",
      opciones: [],
    };
  }
  if (opciones.length === 1) redirect(opciones[0].href);
  return { error: null, opciones };
}
