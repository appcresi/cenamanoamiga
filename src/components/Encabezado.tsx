import Image from "next/image";
import icono from "../../public/manoamiga-icono.png";
import logo from "../../public/manoamiga-santa-maria.svg";

/**
 * Encabezado con el logo. La versión compacta (logo redondo al costado) deja lugar
 * para que la invitación entre en una sola pantalla del celular.
 */
export function Encabezado({
  titulo,
  compacto = false,
  sobreImagen = false,
}: {
  titulo: string;
  compacto?: boolean;
  /** Sobre la foto de fondo del inicio: textos en blanco y logo sobre tarjeta blanca. */
  sobreImagen?: boolean;
}) {
  if (compacto) {
    return (
      // pr-10: lugar para el botón flotante de modo nocturno.
      <header className="flex w-full animate-aparecer items-center gap-3 pr-10">
        <Image
          src={icono}
          alt="Mano Amiga Santa María"
          priority
          className={`size-11 shrink-0 rounded-full sm:size-14 [@media(max-height:700px)]:size-9 ${
            sobreImagen ? "bg-white p-0.5 shadow-lg" : "dark:bg-white dark:p-0.5"
          }`}
        />
        <div className="min-w-0">
          <h1
            className={`text-lg font-semibold leading-tight sm:text-2xl ${
              sobreImagen ? "text-white drop-shadow-[0_2px_8px_rgb(0_0_0/0.6)]" : "text-primario"
            }`}
          >
            {titulo}
          </h1>
          <p
            className={`text-xs sm:text-sm [@media(max-height:700px)]:hidden ${
              sobreImagen ? "text-white/80 drop-shadow-[0_1px_4px_rgb(0_0_0/0.6)]" : "text-foreground/60"
            }`}
          >
            Fundación Mano Amiga · Colegio Santa María
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="flex animate-aparecer flex-col items-center gap-2 text-center sm:gap-3">
      {/* En modo nocturno el logo va sobre una tarjeta blanca para que se vea la mano azul oscuro. */}
      <Image
        src={logo}
        alt="Mano Amiga Santa María"
        priority
        className={`h-auto w-28 animate-flotar sm:w-48 [@media(max-height:700px)]:w-20 ${
          sobreImagen ? "rounded-2xl bg-white p-2 shadow-lg" : "dark:rounded-2xl dark:bg-white dark:p-2"
        }`}
      />
      <h1
        className={`text-2xl font-semibold tracking-tight sm:text-4xl ${
          sobreImagen ? "text-white drop-shadow-[0_2px_8px_rgb(0_0_0/0.6)]" : "text-primario"
        }`}
      >
        {titulo}
      </h1>
      <p
        className={`text-sm [@media(max-height:700px)]:hidden ${
          sobreImagen ? "text-white/85 drop-shadow-[0_1px_4px_rgb(0_0_0/0.6)]" : "text-foreground/70"
        }`}
      >
        Fundación Mano Amiga
      </p>
    </header>
  );
}
