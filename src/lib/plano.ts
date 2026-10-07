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

export type Forma = "redonda" | "rectangular";

// Distribución del salón (plano del lugar): posición y forma de cada mesa según su número.
// Las filas siguen el plano original (vertical): impares arriba de la pista y pares abajo.
// En pantalla se muestra girado 90° a la derecha: el escenario queda arriba.
const COLUMNAS = [14.5, 38.5, 61.5, 84.5];
const CENTRO = [27, 51, 75];
const R = "rectangular";
const O = "redonda";
const FILAS: [y: number, numeros: number[], xs: number[], formas: Forma[]][] = [
  [5, [23, 25, 27, 29], COLUMNAS, [R, R, R, R]],
  [14, [15, 17, 19, 21], COLUMNAS, [O, R, R, O]],
  [23, [7, 9, 11, 13], COLUMNAS, [O, R, R, O]],
  [32, [1, 3, 5], CENTRO, [R, O, R]],
  [68, [2, 4, 6], CENTRO, [R, O, R]],
  [77, [8, 10, 12, 14], COLUMNAS, [O, R, R, O]],
  [86, [16, 18, 20, 22], COLUMNAS, [O, R, R, O]],
  [95, [24, 26, 28, 30], COLUMNAS, [R, R, R, R]],
];
export const PLANO_SALON = new Map<number, Posicion & { forma: Forma }>(
  FILAS.flatMap(([y, numeros, xs, formas]) =>
    numeros.map((n, i) => [n, { x: 100 - y, y: xs[i], forma: formas[i] }] as const),
  ),
);

export const formaDe = (numero: number): Forma => PLANO_SALON.get(numero)?.forma ?? "redonda";

/** Posición guardada; si no tiene, la del plano del salón; si no figura ahí, la de la grilla. */
export function posicionDe(m: MesaPlano, grilla: Map<string, Posicion>): Posicion {
  if (m.x != null && m.y != null) return { x: m.x, y: m.y };
  const enPlano = PLANO_SALON.get(m.numero);
  if (enPlano) return { x: enPlano.x, y: enPlano.y };
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
