"use server";

import { redirect } from "next/navigation";
import { buscarOrganizaciones, tokenPorDni } from "@/lib/consultas";

export interface EstadoBusqueda {
  error: string | null;
  /** Varias organizaciones coinciden: el invitado elige la suya. */
  opciones: { id: string; nombre: string }[];
}

const ERROR_TECNICO: EstadoBusqueda = {
  error: "No pudimos hacer la búsqueda. Probá de nuevo en unos minutos.",
  opciones: [],
};

/** Si parece un DNI (solo números, puntos o espacios) busca por DNI; si no, por organización. */
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
    return { error: "Escribí al menos 3 letras del nombre de la organización.", opciones: [] };
  }

  let opciones: EstadoBusqueda["opciones"];
  try {
    opciones = await buscarOrganizaciones(consulta);
  } catch (error) {
    console.error("Error buscando organizaciones:", error);
    return ERROR_TECNICO;
  }
  if (!opciones.length) {
    return {
      error: "No encontramos una organización con ese nombre. Probá con otra parte del nombre o con tu DNI.",
      opciones: [],
    };
  }
  if (opciones.length === 1) redirect(`/organizacion/${opciones[0].id}`);
  return { error: null, opciones };
}
