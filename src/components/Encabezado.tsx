import Image from "next/image";
import logo from "../../public/manoamiga-santa-maria.svg";

export function Encabezado({ titulo }: { titulo: string }) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <Image src={logo} alt="Mano Amiga Santa María" priority className="h-auto w-40 sm:w-48" />
      <h1 className="text-3xl font-semibold tracking-tight text-primario sm:text-4xl">{titulo}</h1>
      <p className="text-sm text-foreground/70">Fundación Mano Amiga</p>
    </header>
  );
}
