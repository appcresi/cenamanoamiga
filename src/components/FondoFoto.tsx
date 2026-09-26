import Image from "next/image";
import type { CSSProperties } from "react";
import foto from "../../public/cena.webp";

// Colores de los destellos, parecidos a las luces de la foto (cálidos, algunos azules).
const COLORES = ["255 214 150", "255 240 210", "255 190 110", "160 190 255"];

/** Generador pseudoaleatorio con semilla: los destellos quedan siempre en el mismo lugar. */
function aleatorio(semilla: number) {
  let x = semilla;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

const azar = aleatorio(20261120);
const DESTELLOS = Array.from({ length: 28 }, (_, i) => {
  const color = COLORES[i % 7 === 0 ? 3 : i % 5 === 0 ? 2 : Math.floor(azar() * 2)];
  return {
    // Más destellos arriba, donde la foto tiene las luces.
    x: Math.round(azar() * 100),
    y: Math.round(Math.pow(azar(), 1.6) * 90),
    tamano: Math.round(14 + azar() * 46),
    duracion: (4 + azar() * 6).toFixed(1),
    retraso: (-azar() * 10).toFixed(1),
    brillo: (0.45 + azar() * 0.5).toFixed(2),
    color,
    // En el celular se muestra solo la mitad, para no recargar.
    soloGrande: i % 2 === 1,
  };
});

/** Foto de la cena a pantalla completa, con destellos de luz y un velo oscuro para leer el contenido. */
export function FondoFoto() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0d1322] print:hidden">
      <Image
        src={foto}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="animate-acercar object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1322]/70 via-[#0d1322]/35 to-[#0d1322]/85" />
      {DESTELLOS.map((d, i) => (
        <span
          key={i}
          className={`absolute animate-titilar rounded-full mix-blend-screen ${d.soloGrande ? "hidden sm:block" : ""}`}
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.tamano,
              height: d.tamano,
              background: `radial-gradient(circle, rgb(${d.color} / 0.95) 0%, rgb(${d.color} / 0.35) 40%, transparent 70%)`,
              animationDuration: `${d.duracion}s`,
              animationDelay: `${d.retraso}s`,
              "--brillo": d.brillo,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
