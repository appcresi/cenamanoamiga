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

/**
 * Altura de cada destello: la mayoría arriba (detrás del logo y el título, donde no hay
 * tarjetas que los tapen) y abajo (pie de página); unos pocos en el medio.
 */
function alturaVisible(i: number) {
  const franja = i % 7;
  if (franja < 4) return 2 + azar() * 34; // arriba
  if (franja < 6) return 80 + azar() * 17; // abajo
  return azar() * 100; // cualquier lugar (se ven a los costados en pantallas anchas)
}

const DESTELLOS = Array.from({ length: 28 }, (_, i) => {
  const color = COLORES[i % 7 === 0 ? 3 : i % 5 === 0 ? 2 : Math.floor(azar() * 2)];
  return {
    x: Math.round(azar() * 100),
    y: Math.round(alturaVisible(i)),
    tamano: Math.round(24 + azar() * 56),
    duracion: (3.5 + azar() * 5).toFixed(1),
    retraso: (-azar() * 9).toFixed(1),
    brillo: (0.8 + azar() * 0.2).toFixed(2),
    color,
    // Uno de cada tres es una estrella de cuatro puntas; el resto, círculos de luz.
    estrella: i % 3 === 0,
    // En el celular se muestran 20 de 28, para no recargar.
    soloGrande: i % 4 === 3,
  };
});

const circulo = (c: string) =>
  `radial-gradient(circle, rgb(255 255 255 / 0.95) 0%, rgb(${c} / 0.85) 22%, rgb(${c} / 0.3) 48%, transparent 70%)`;

// Núcleo brillante + dos rayos finos cruzados (horizontal y vertical).
const estrella = (c: string) =>
  [
    `radial-gradient(circle, rgb(255 255 255) 0 6%, rgb(${c} / 0.9) 12%, rgb(${c} / 0.3) 26%, transparent 45%)`,
    `linear-gradient(0deg, transparent 48.5%, rgb(255 255 255 / 0.9) 50%, transparent 51.5%)`,
    `linear-gradient(90deg, transparent 48.5%, rgb(255 255 255 / 0.9) 50%, transparent 51.5%)`,
  ].join(", ");

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
          className={`absolute -translate-x-1/2 -translate-y-1/2 animate-titilar rounded-full mix-blend-screen ${d.soloGrande ? "hidden sm:block" : ""}`}
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.estrella ? d.tamano * 1.4 : d.tamano,
              height: d.estrella ? d.tamano * 1.4 : d.tamano,
              background: d.estrella ? estrella(d.color) : circulo(d.color),
              // Los rayos de la estrella se desvanecen hacia las puntas.
              maskImage: d.estrella ? "radial-gradient(circle, #000 18%, transparent 70%)" : undefined,
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
