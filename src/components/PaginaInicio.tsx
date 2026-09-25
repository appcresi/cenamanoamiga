import Link from "next/link";
import { BuscadorInvitacion } from "@/components/BuscadorInvitacion";
import { Creditos } from "@/components/Creditos";
import { Encabezado } from "@/components/Encabezado";
import { FondoAnimado } from "@/components/FondoAnimado";
import { InfoEvento } from "@/components/InfoEvento";
import { IngresoGoogle } from "@/components/IngresoGoogle";
import { SolapasAcceso, type Solapa } from "@/components/SolapasAcceso";
import type { Evento } from "@/lib/tipos";

/** Inicio: datos del evento y acceso con dos solapas (invitados / organizadores). */
export function PaginaInicio({ evento, solapa = "invitados" }: { evento: Evento; solapa?: Solapa }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center gap-4 px-4 py-5 sm:gap-8 sm:py-12">
      <FondoAnimado />
      <Encabezado titulo={evento.nombre} />
      <div className="w-full animate-aparecer" style={{ animationDelay: "150ms" }}>
        <InfoEvento evento={evento} />
      </div>
      <section
        className="w-full animate-aparecer rounded-2xl border border-borde bg-superficie p-4 shadow-sm sm:p-6"
        style={{ animationDelay: "250ms" }}
      >
        <SolapasAcceso inicial={solapa} invitados={<BuscadorInvitacion />} organizadores={<IngresoGoogle />} />
      </section>
      <footer className="mt-auto flex animate-aparecer flex-col items-center gap-1" style={{ animationDelay: "350ms" }}>
        <Link href="/terminos" className="text-sm text-foreground/50 hover:text-primario">
          Términos y condiciones
        </Link>
        <Creditos />
      </footer>
    </main>
  );
}
