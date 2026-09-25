// Dibujo de una mesa redonda con un circulito por lugar. Sin estado: se usa tanto
// en el panel (cliente) como en la página del invitado (servidor).

export type EstadoSilla = "libre" | "ocupada" | "reservada" | "excedida" | "neutra" | "destacada";
export type EstadoMesa = "normal" | "reservada" | "llena" | "apagada" | "destacada";

export interface Silla {
  estado: EstadoSilla;
  titulo?: string;
}

// Medidas en % del lado del cuadrado que ocupa la mesa con sus sillas.
const RADIO_SILLAS = 41;
const DIAMETRO_MESA = 58;

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
}: {
  numero: number;
  nombre?: string;
  /** Texto chico debajo del número (p. ej. "7/10"). */
  detalle?: string;
  sillas: Silla[];
  estado: EstadoMesa;
  activa?: boolean;
}) {
  // Las sillas se achican si hay muchas, para que no se superpongan.
  const diametroSilla = Math.min(15, ((2 * Math.PI * RADIO_SILLAS) / Math.max(1, sillas.length)) * 0.8);

  return (
    <span className="absolute inset-0">
      {sillas.map((silla, i) => {
        const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / sillas.length;
        return (
          <span
            key={i}
            title={silla.titulo}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${COLOR_SILLA[silla.estado]}`}
            style={{
              // Redondeado para que el HTML del servidor coincida con el del navegador.
              left: `${(50 + RADIO_SILLAS * Math.cos(angulo)).toFixed(2)}%`,
              top: `${(50 + RADIO_SILLAS * Math.sin(angulo)).toFixed(2)}%`,
              width: `${diametroSilla.toFixed(2)}%`,
              height: `${diametroSilla.toFixed(2)}%`,
            }}
          />
        );
      })}
      <span
        title={nombre ? `Mesa ${numero} · ${nombre}` : `Mesa ${numero}`}
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 leading-tight shadow-sm ${COLOR_MESA[estado]} ${activa ? "ring-4 ring-primario/40" : ""}`}
        style={{ width: `${DIAMETRO_MESA}%`, height: `${DIAMETRO_MESA}%` }}
      >
        {/* cqw: relativo al ancho del plano (que es un @container). */}
        <span className="font-bold" style={{ fontSize: "max(11px, 1.7cqw)" }}>
          {numero}
        </span>
        {detalle && (
          <span className="opacity-80" style={{ fontSize: "max(8px, 0.9cqw)" }}>
            {detalle}
          </span>
        )}
      </span>
    </span>
  );
}

/** Fondo punteado del salón con la franja del escenario. */
export function FondoPlano() {
  return (
    <div className="absolute inset-x-[30%] top-0 rounded-b-lg bg-primario/10 py-1 text-center text-[10px] font-medium uppercase tracking-wider text-primario/70 sm:text-xs">
      Frente / escenario
    </div>
  );
}

export const CLASE_PLANO =
  "@container relative aspect-[16/10] select-none bg-[radial-gradient(circle,var(--borde)_1px,transparent_1px)] bg-[size:24px_24px]";
