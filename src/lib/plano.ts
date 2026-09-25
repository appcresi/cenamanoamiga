import type { Invitado, Mesa } from "@/lib/tipos";

export type Posicion = { x: number; y: number };

/** Datos mínimos de una mesa para dibujarla en el plano. */
export type MesaPlano = Pick<Mesa, "id" | "numero" | "nombre" | "capacidad" | "x" | "y">;

// Margen (en %) para que las mesas no queden cortadas en los bordes del plano.
export const MARGEN = 4;
export const limitar = (v: number) => Math.min(100 - MARGEN, Math.max(MARGEN, v));
export const redondear = (v: number) => Math.round(v * 10) / 10;

/**
 * Distribuye las mesas en una grilla pareja (se usa para las que todavía no tienen
 * posición). Las mesas deben venir ordenadas por número para que el panel y la
 * página del invitado calculen lo mismo.
 */
export function posicionesEnGrilla(mesas: MesaPlano[]): Map<string, Posicion> {
  const columnas = Math.max(1, Math.ceil(Math.sqrt(mesas.length * 1.6)));
  const filas = Math.max(1, Math.ceil(mesas.length / columnas));
  return new Map(
    mesas.map((m, i) => [
      m.id,
      {
        x: redondear(MARGEN + ((i % columnas) + 0.5) * ((100 - 2 * MARGEN) / columnas)),
        y: redondear(MARGEN + (Math.floor(i / columnas) + 0.5) * ((100 - 2 * MARGEN) / filas)),
      },
    ]),
  );
}

export function posicionDe(m: MesaPlano, grilla: Map<string, Posicion>): Posicion {
  if (m.x != null && m.y != null) return { x: m.x, y: m.y };
  return grilla.get(m.id) ?? { x: 50, y: 50 };
}

/** Orden en que se reparten los lugares de una mesa (define qué silla es de quién). */
export function ordenarSentados<T extends Pick<Invitado, "id" | "nombre" | "apellido">>(sentados: T[]): T[] {
  return [...sentados].sort(
    (a, b) =>
      a.apellido.localeCompare(b.apellido, "es") ||
      a.nombre.localeCompare(b.nombre, "es") ||
      a.id.localeCompare(b.id),
  );
}
