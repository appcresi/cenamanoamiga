import Link from "next/link";
import { Encabezado } from "@/components/Encabezado";

export default function OrganizacionNoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <Encabezado titulo="Organización no encontrada" />
      <p className="text-foreground/70">
        No encontramos esa organización. Volvé a buscarla por su nombre o buscá tu mesa con tu
        DNI.
      </p>
      <Link href="/" className="rounded-lg bg-primario px-5 py-3 font-medium text-white">
        Volver a buscar
      </Link>
    </main>
  );
}
