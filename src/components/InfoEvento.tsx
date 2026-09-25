import type { Evento } from "@/lib/tipos";
import { formatearFecha } from "@/lib/utilidades";

export function InfoEvento({ evento }: { evento: Evento }) {
  const filas = [
    { etiqueta: "Cuándo", valor: formatearFecha(evento.fecha) },
    { etiqueta: "Dónde", valor: [evento.lugar, evento.direccion].filter(Boolean).join(" — ") },
    { etiqueta: "Vestimenta", valor: evento.vestimenta },
  ].filter((f) => f.valor);

  if (!filas.length && !evento.informacion) return null;

  return (
    <section className="w-full rounded-2xl border border-borde bg-superficie p-6 text-left">
      <dl className="grid gap-4">
        {filas.map((f) => (
          <div key={f.etiqueta}>
            <dt className="text-xs font-medium uppercase tracking-wider text-foreground/50">
              {f.etiqueta}
            </dt>
            <dd className="mt-1 first-letter:uppercase">{f.valor}</dd>
          </div>
        ))}
      </dl>
      {evento.informacion && (
        <p className="mt-4 whitespace-pre-line border-t border-borde pt-4 text-foreground/80">
          {evento.informacion}
        </p>
      )}
      {evento.direccion && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [evento.lugar, evento.direccion].filter(Boolean).join(", "),
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-medium text-primario underline underline-offset-4"
        >
          Ver en el mapa
        </a>
      )}
    </section>
  );
}
