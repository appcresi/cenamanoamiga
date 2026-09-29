"use server";

import { redirect } from "next/navigation";
import { buscarInvitados, buscarOrganizaciones, tokenPorDni } from "@/lib/consultas";

export interface EstadoBusqueda {
  error: string | null;
  /** Varias personas u organizaciones coinciden: el invitado elige la suya. */
  opciones: { href: string; nombre: string; tipo: "invitado" | "organizacion" }[];
}

const ERROR_TECNICO: EstadoBusqueda = {
  error: "No pudimos hacer la búsqueda. Probá de nuevo en unos minutos.",
  opciones: [],
};

/** Si parece un DNI (solo números, puntos o espacios) busca por DNI; si no, por nombre de invitado u organización. */
export async function buscarInvitacion(
  _anterior: EstadoBusqueda,
  formData: FormData,
): Promise<EstadoBusqueda> {
  const consulta = String(formData.get("consulta") ?? "").trim();

  if (/^[\d.\s-]+$/.test(consulta)) {
    let token: string | null;
    try {
      token = await tokenPorDni(consulta);
    } catch (error) {
      console.error("Error buscando por DNI:", error);
      return ERROR_TECNICO;
    }
    if (!token) {
      return {
        error:
          "No encontramos una invitación con ese DNI. Si venís por una organización, buscá por su nombre.",
        opciones: [],
      };
    }
    redirect(`/invitacion/${token}`);
  }

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
        "No encontramos ese nombre. Probá con tu nombre y apellido, el nombre de tu organización o tu DNI.",
      opciones: [],
    };
  }
  if (opciones.length === 1) redirect(opciones[0].href);
  return { error: null, opciones };
}
