import Link from "next/link";
import { connection } from "next/server";
import { BuscadorInvitacion } from "@/components/BuscadorInvitacion";
import { Encabezado } from "@/components/Encabezado";
import { InfoEvento } from "@/components/InfoEvento";
import { obtenerEvento } from "@/lib/consultas";

export default async function Home() {
  await connection();
  const evento = await obtenerEvento();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-8 px-4 py-12">
      <Encabezado titulo={evento.nombre} />
      <InfoEvento evento={evento} />
      <section className="w-full rounded-2xl border border-borde bg-superficie p-6">
        <BuscadorInvitacion />
        <p className="mt-4 text-sm text-foreground/60">
          ¿Recibiste un link o un código QR? Abrilo directamente para ver tu mesa.
        </p>
      </section>
      <Link href="/admin" className="mt-auto text-sm text-foreground/50 hover:text-primario">
        Acceso organizadores
      </Link>
    </main>
  );
}
