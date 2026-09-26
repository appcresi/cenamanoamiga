import Link from "next/link";
import { Creditos } from "@/components/Creditos";
import { Encabezado } from "@/components/Encabezado";
import { FondoFoto } from "@/components/FondoFoto";
import { InfoEvento } from "@/components/InfoEvento";
import { PlanoInvitado } from "@/components/PlanoInvitado";
import type { Evento, VistaInvitacion } from "@/lib/tipos";

// Tarjetas semitransparentes ("vidrio") sobre la foto de fondo.
const VIDRIO = "[&>section]:border-white/20 [&>section]:bg-superficie/90 [&>section]:shadow-xl [&>section]:backdrop-blur-md";

/** Mesa(s), plano del salón y datos del evento; pensado para entrar en una pantalla del celular. */
export function PaginaInvitacion({ vista, evento }: { vista: VistaInvitacion; evento: Evento }) {
  const numeros = vista.mesas.map((m) => m.numero);
  const nombresMesas = vista.mesas.map((m) => m.nombre).filter(Boolean);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-2.5 px-4 py-3 sm:gap-6 sm:py-10 [@media(max-height:700px)]:gap-2">
      <FondoFoto />
      <Encabezado titulo={evento.nombre} compacto sobreImagen />

      <section
        className="animate-aparecer rounded-2xl bg-gradient-to-br from-primario-fondo to-[color-mix(in_oklab,var(--primario-fondo),var(--secundario)_35%)] px-5 py-4 text-white shadow-lg [@media(max-height:700px)]:py-3"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-white/70">
              {vista.tipo === "grupo" ? "Mesa de" : "Bienvenido/a"}
              {vista.lugares && ` · ${vista.lugares} lugares`}
            </p>
            <p className="text-lg font-semibold leading-snug">{vista.titulo}</p>
            {vista.grupo && <p className="text-sm text-white/70">{vista.grupo}</p>}
          </div>
          <div className="shrink-0 text-right">
            {numeros.length ? (
              <>
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {numeros.length === 1 ? "Tu mesa" : "Tus mesas"}
                </p>
                <p
                className={`animate-pop font-bold leading-none text-acento ${numeros.length > 2 ? "text-3xl" : "text-5xl"}`}
                style={{ animationDelay: "350ms" }}
              >
                  {numeros.join(" y ").replace(/ y (?=.* y )/g, ", ")}
                </p>
                {nombresMesas.length > 0 && <p className="mt-1 text-xs text-white/70">{nombresMesas.join(", ")}</p>}
              </>
            ) : (
              <p className="max-w-32 text-sm text-white/80">Mesa a confirmar</p>
            )}
          </div>
        </div>
        {vista.integrantes.length > 0 && (
          <details className="group mt-3 border-t border-white/20 pt-2 text-sm">
            <summary className="cursor-pointer list-none text-white/80">
              Invitados registrados ({vista.integrantes.length}){" "}
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
            </summary>
            <ul className="mt-2 grid gap-1 text-white/90 sm:grid-cols-2">
              {vista.integrantes.map((nombre, i) => (
                <li key={i}>{nombre}</li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {numeros.length > 0 ? (
        <div className={`animate-aparecer ${VIDRIO} [&>section]:bg-superficie/95`} style={{ animationDelay: "200ms" }}>
          <PlanoInvitado plano={vista.plano} />
        </div>
      ) : (
        <p className="text-center text-sm text-white/85 drop-shadow-[0_1px_4px_rgb(0_0_0/0.6)]">
          Todavía no tenés mesa asignada. Volvé a consultar más cerca del evento.
        </p>
      )}

      <div className={`animate-aparecer ${VIDRIO}`} style={{ animationDelay: "300ms" }}>
        <InfoEvento evento={evento} />
      </div>

      <footer className="mt-auto flex flex-col items-center gap-1 [@media(max-height:700px)]:gap-0">
        <div className="flex gap-4 text-sm text-white/75">
          <Link href="/" className="hover:text-white">
            Volver al inicio
          </Link>
          <Link href="/terminos" className="hover:text-white">
            Términos y condiciones
          </Link>
        </div>
        <Creditos className="text-white/60" />
      </footer>
    </main>
  );
}
