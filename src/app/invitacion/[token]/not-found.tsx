import Link from "next/link";
import { Encabezado } from "@/components/Encabezado";

export default function InvitacionNoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <Encabezado titulo="Invitación no encontrada" />
      <p className="text-foreground/70">
        El link no es válido o la invitación fue eliminada. Revisá que esté completo o buscá tu
        mesa con tu DNI o el nombre de tu organización.
      </p>
      <Link href="/" className="rounded-lg bg-primario px-5 py-3 font-medium text-white">
        Buscar mi mesa
      </Link>
    </main>
  );
}
