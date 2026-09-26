import type { ReactNode } from "react";
import type { Evento } from "@/lib/tipos";
import { formatearFechaCorta } from "@/lib/utilidades";
import { CuentaRegresiva } from "./CuentaRegresiva";

// Íconos de línea simples (stroke = color del texto).
const ICONOS = {
  fecha: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  lugar: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  vestimenta: "M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z",
};

function Fila({ icono, children }: { icono: keyof typeof ICONOS; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-4 shrink-0 fill-none stroke-secundario stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
        <path d={ICONOS[icono]} />
      </svg>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Link a Google Maps: el pegado por los organizadores o, si no hay, una búsqueda del lugar. */
export function linkMapa(evento: Evento): string {
  if (evento.mapa?.trim()) return evento.mapa.trim();
  const consulta = [evento.lugar, evento.direccion].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

/** Datos del evento en pocas líneas; la información adicional se despliega al tocarla. */
export function InfoEvento({ evento }: { evento: Evento }) {
  const fecha = formatearFechaCorta(evento.fecha);
  const lugar = [evento.lugar, evento.direccion].filter(Boolean).join(" · ");

  if (!fecha && !lugar && !evento.vestimenta && !evento.informacion) return null;

  return (
    <section className="relative flex w-full flex-col gap-2.5 rounded-2xl border border-borde bg-superficie px-4 py-3 text-sm [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2">
      {/* Sticker en la esquina, al estilo de la cinta del flyer. */}
      <span className="absolute -right-2 -top-2.5 z-10 rotate-6 rounded-md bg-acento px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
        ¡Te esperamos!
      </span>
      {evento.fecha && <CuentaRegresiva fecha={evento.fecha} />}
      <ul className="grid gap-1.5">
        {fecha && (
          <Fila icono="fecha">
            <span className="first-letter:uppercase">{fecha}</span>
          </Fila>
        )}
        {lugar && (
          <Fila icono="lugar">
            <span className="flex items-start justify-between gap-2">
              <span>{lugar}</span>
              <a
                href={linkMapa(evento)}
                target="_blank"
                rel="noopener noreferrer"
                className="-my-0.5 shrink-0 whitespace-nowrap rounded-full bg-primario-fondo px-2.5 py-1 text-xs font-medium text-white transition hover:-translate-y-0.5 active:scale-95"
              >
                Cómo llegar ↗
              </a>
            </span>
          </Fila>
        )}
        {evento.vestimenta && <Fila icono="vestimenta">{evento.vestimenta}</Fila>}
      </ul>
      {evento.informacion && (
        <details className="group border-t border-borde pt-2">
          <summary className="cursor-pointer list-none font-medium text-primario">
            Más información <span className="inline-block transition-transform group-open:rotate-90">›</span>
          </summary>
          <p className="mt-2 whitespace-pre-line text-foreground/80">{evento.informacion}</p>
        </details>
      )}
    </section>
  );
}
