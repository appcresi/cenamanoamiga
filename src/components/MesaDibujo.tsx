// Dibujo de una mesa (redonda o rectangular) con un circulito por lugar. Sin estado:
// se usa tanto en el panel (cliente) como en la página del invitado (servidor).

import type { Forma } from "@/lib/plano";

export type EstadoSilla = "libre" | "ocupada" | "reservada" | "excedida" | "neutra" | "destacada";
export type EstadoMesa = "normal" | "reservada" | "llena" | "apagada" | "destacada";

export interface Silla {
  estado: EstadoSilla;
  titulo?: string;
}

// Medidas en % del lado del cuadrado que ocupa la mesa con sus sillas.
const RADIO_SILLAS = 41;
const DIAMETRO_MESA = 58;
// Mesa rectangular (medidas antes de girarla): lugares repartidos en los dos lados largos.
const ANCHO_RECT = 76;
const ALTO_RECT = 30;
const SEPARACION_SILLAS = 11;

/** Centro (en %) y diámetro de cada silla, en el sentido de las agujas del reloj desde arriba. */
function ubicarSillas(cantidad: number, forma: Forma): { x: number; y: number; d: number }[] {
  const n = Math.max(1, cantidad);
  if (forma === "rectangular") {
    const arriba = Math.ceil(n / 2);
    const abajo = n - arriba;
    const d = Math.min(14, (ANCHO_RECT / arriba) * 0.8);
    const x = (i: number, total: number) => 50 - ANCHO_RECT / 2 + ((i + 0.5) * ANCHO_RECT) / total;
    const yArriba = 50 - ALTO_RECT / 2 - SEPARACION_SILLAS;
    const yAbajo = 50 + ALTO_RECT / 2 + SEPARACION_SILLAS;
    return [
      ...Array.from({ length: arriba }, (_, i) => ({ x: x(i, arriba), y: yArriba, d })),
      ...Array.from({ length: abajo }, (_, i) => ({ x: x(abajo - 1 - i, abajo), y: yAbajo, d })),
    ]
      .slice(0, cantidad)
      // Como el plano, la mesa va girada 90° a la derecha: queda parada, con los lugares a los costados.
      .map((u) => ({ x: 100 - u.y, y: u.x, d: u.d }));
  }
  const d = Math.min(15, ((2 * Math.PI * RADIO_SILLAS) / n) * 0.8);
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: 50 + RADIO_SILLAS * Math.cos(angulo), y: 50 + RADIO_SILLAS * Math.sin(angulo), d };
  });
}

const COLOR_SILLA: Record<EstadoSilla, string> = {
  libre: "border border-primario/40 bg-superficie",
  ocupada: "bg-primario",
  reservada: "border border-secundario bg-secundario/25",
  excedida: "bg-peligro",
  neutra: "border border-primario/25 bg-superficie",
  destacada: "scale-150 bg-acento ring-4 ring-acento/35 animate-pulse",
};

const COLOR_MESA: Record<EstadoMesa, string> = {
  normal: "border-primario/40 bg-superficie text-primario",
  reservada: "border-secundario bg-primario-claro text-primario",
  llena: "border-acento bg-acento text-white",
  apagada: "border-primario/20 bg-superficie text-primario/50",
  destacada: "border-acento bg-acento text-white shadow-lg",
};

export function MesaDibujo({
  numero,
  nombre,
  detalle,
  sillas,
  estado,
  activa = false,
  forma = "redonda",
}: {
  numero: number;
  nombre?: string;
  /** Texto chico debajo del número (p. ej. "7/10"). */
  detalle?: string;
  sillas: Silla[];
  estado: EstadoMesa;
  activa?: boolean;
  forma?: Forma;
}) {
  // Las sillas se achican si hay muchas, para que no se superpongan.
  const ubicaciones = ubicarSillas(sillas.length, forma);
  const rectangular = forma === "rectangular";

  return (
    <span className="absolute inset-0">
      {sillas.map((silla, i) => {
        const u = ubicaciones[i];
        return (
          <span
            key={i}
            title={silla.titulo}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${COLOR_SILLA[silla.estado]}`}
            style={{
              // Redondeado para que el HTML del servidor coincida con el del navegador.
              left: `${u.x.toFixed(2)}%`,
              top: `${u.y.toFixed(2)}%`,
              width: `${u.d.toFixed(2)}%`,
              height: `${u.d.toFixed(2)}%`,
            }}
          />
        );
      })}
      <span
        title={nombre ? `Mesa ${numero} · ${nombre}` : `Mesa ${numero}`}
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-2 leading-tight shadow-sm ${rectangular ? "rounded-md" : "rounded-full"} ${COLOR_MESA[estado]} ${activa ? "ring-4 ring-primario/40" : ""}`}
        style={
          rectangular
            ? { width: `${ALTO_RECT}%`, height: `${ANCHO_RECT}%` }
            : { width: `${DIAMETRO_MESA}%`, height: `${DIAMETRO_MESA}%` }
        }
      >
        {/* cqw: relativo al ancho del plano (que es un @container). */}
        <span className="font-bold" style={{ fontSize: "max(11px, 1.6cqw)" }}>
          {numero}
        </span>
        {detalle && (
          <span className="opacity-80" style={{ fontSize: "max(8px, 0.85cqw)" }}>
            {detalle}
          </span>
        )}
      </span>
    </span>
  );
}

/** Pista y escenario, ubicados como en el plano del salón (ver PLANO_SALON). */
export function FondoPlano() {
  return (
    <>
      <div className="absolute left-[38%] top-[32%] flex h-[38%] w-[23.5%] items-center justify-center rounded-md border border-acento/40 bg-acento/10 text-[10px] font-medium uppercase tracking-wider text-acento sm:text-xs">
        Pista
      </div>
      <div className="absolute left-[42.5%] top-[4.5%] flex h-[13%] w-[15%] items-center justify-center rounded-md border border-secundario/50 bg-secundario/15 text-[10px] font-medium uppercase tracking-wider text-primario/80 sm:text-xs">
        Escenario · DJ
      </div>
    </>
  );
}

/** Ancho de cada mesa (con sus sillas) en % del ancho del plano. */
export const ANCHO_MESA = "w-[7.9%]";

export const CLASE_PLANO =
  "@container relative aspect-[24/10] select-none bg-[radial-gradient(circle,var(--borde)_1px,transparent_1px)] bg-[size:24px_24px]";
