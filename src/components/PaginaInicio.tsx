import Link from "next/link";
import { BotonIngreso } from "@/components/BotonIngreso";
import { BuscadorInvitacion } from "@/components/BuscadorInvitacion";
import { Creditos } from "@/components/Creditos";
import { Encabezado } from "@/components/Encabezado";
import { FondoFoto } from "@/components/FondoFoto";
import { InfoEvento } from "@/components/InfoEvento";
import { IngresoGoogle } from "@/components/IngresoGoogle";
import { SolapasAcceso, type Solapa } from "@/components/SolapasAcceso";
import type { Evento } from "@/lib/tipos";

// Tarjetas semitransparentes ("vidrio") sobre la foto de fondo.
const VIDRIO = "bg-superficie/85 backdrop-blur-md shadow-xl";
const VIDRIO_HIJA = "[&>section]:border-white/20 [&>section]:bg-superficie/85 [&>section]:shadow-xl [&>section]:backdrop-blur-md";

/** Inicio: foto de la cena de fondo, datos del evento y acceso con dos solapas. */
export function PaginaInicio({ evento, solapa = "invitados" }: { evento: Evento; solapa?: Solapa }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center gap-4 px-4 py-5 sm:gap-8 sm:py-12 [@media(max-height:760px)]:gap-3 [@media(max-height:760px)]:py-4">
      <FondoFoto />
      <Encabezado titulo={evento.nombre} sobreImagen />
      <div className={`w-full animate-aparecer ${VIDRIO_HIJA}`} style={{ animationDelay: "150ms" }}>
        <InfoEvento evento={evento} />
      </div>
      <section
        className={`w-full animate-aparecer rounded-2xl border border-white/20 p-4 sm:p-6 ${VIDRIO}`}
        style={{ animationDelay: "250ms" }}
      >
        <SolapasAcceso inicial={solapa} invitados={<BuscadorInvitacion />} organizadores={<IngresoGoogle />} />
      </section>
      <div className="w-full animate-aparecer" style={{ animationDelay: "300ms" }}>
        <BotonIngreso />
      </div>
      <footer className="mt-auto flex animate-aparecer flex-col items-center gap-1" style={{ animationDelay: "350ms" }}>
        <Link href="/terminos" className="text-sm text-white/75 hover:text-white">
          Términos y condiciones
        </Link>
        <Creditos className="text-white/60" />
      </footer>
    </main>
  );
}
