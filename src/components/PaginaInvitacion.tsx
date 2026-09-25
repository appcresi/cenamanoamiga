import Link from "next/link";
import { Encabezado } from "@/components/Encabezado";
import { InfoEvento } from "@/components/InfoEvento";
import { PlanoInvitado } from "@/components/PlanoInvitado";
import type { Evento, VistaInvitacion } from "@/lib/tipos";
import { nombreMesa } from "@/lib/utilidades";

/** Contenido de la invitación: mesa(s), plano del salón y datos del evento. */
export function PaginaInvitacion({ vista, evento }: { vista: VistaInvitacion; evento: Evento }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-8 px-4 py-12">
      <Encabezado titulo={evento.nombre} />

      <section className="w-full rounded-2xl bg-primario p-6 text-center text-white">
        <p className="text-sm text-white/70">{vista.tipo === "grupo" ? "Mesa de" : "Bienvenido/a"}</p>
        <p className="mt-1 text-2xl font-semibold">{vista.titulo}</p>
        {vista.grupo && <p className="mt-1 text-white/70">{vista.grupo}</p>}

        <div className="mt-6 border-t border-white/20 pt-6">
          {vista.mesas.length ? (
            <>
              <p className="text-sm uppercase tracking-wider text-white/70">
                {vista.mesas.length === 1 ? "Tu mesa" : "Tus mesas"}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {vista.mesas.map((m) => (
                  <li key={m.numero} className="text-4xl font-bold text-acento">
                    {nombreMesa(m)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-white/80">
              Tu mesa todavía no fue asignada. Volvé a consultar más cerca del evento.
            </p>
          )}
          {vista.lugares && (
            <p className="mt-3 text-sm text-white/70">{vista.lugares} lugares reservados</p>
          )}
        </div>
      </section>

      {vista.mesas.length > 0 && <PlanoInvitado plano={vista.plano} />}

      {vista.integrantes.length > 0 && (
        <section className="w-full rounded-2xl border border-borde bg-superficie p-6">
          <h2 className="font-medium">Invitados registrados</h2>
          <ul className="mt-3 grid gap-1 text-foreground/80">
            {vista.integrantes.map((nombre, i) => (
              <li key={i}>{nombre}</li>
            ))}
          </ul>
        </section>
      )}

      <InfoEvento evento={evento} />

      <Link href="/" className="text-sm text-foreground/50 hover:text-primario">
        Volver al inicio
      </Link>
    </main>
  );
}
