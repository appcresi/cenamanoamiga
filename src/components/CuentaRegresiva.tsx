"use client";

import { useSyncExternalStore } from "react";

function suscribir(avisar: () => void) {
  const intervalo = setInterval(avisar, 1000);
  return () => clearInterval(intervalo);
}

// Segundos enteros: el valor no cambia dentro del mismo segundo (evita renders de más).
const segundoActual = () => Math.floor(Date.now() / 1000);

/** La fecha del evento se carga sin zona horaria ("2026-10-07T20:30"): es hora de Argentina. */
function inicioDelEvento(fecha: string): number {
  const conSegundos = fecha.length === 16 ? `${fecha}:00` : fecha;
  return Date.parse(`${conSegundos}-03:00`);
}

const dos = (n: number) => String(n).padStart(2, "0");

/** Cuenta regresiva hasta el evento. "¡Es hoy!" durante la noche del evento; después, nada. */
export function CuentaRegresiva({ fecha }: { fecha: string }) {
  // En el servidor no se conoce la hora del visitante: se dibujan los casilleros vacíos.
  const ahora = useSyncExternalStore(suscribir, segundoActual, () => null);
  const inicio = inicioDelEvento(fecha);
  if (!fecha || Number.isNaN(inicio)) return null;

  const faltan = ahora === null ? null : Math.floor(inicio / 1000) - ahora;

  if (faltan !== null && faltan <= 0) {
    // Durante la noche del evento (8 horas desde el inicio) se muestra el saludo; después, nada.
    if (faltan > -8 * 3600) {
      return (
        <p className="animate-pop rounded-xl bg-acento/15 px-3 py-2 text-center font-semibold text-acento">
          ¡Es hoy! Te esperamos 🎉
        </p>
      );
    }
    return null;
  }

  const partes = [
    { valor: faltan === null ? null : Math.floor(faltan / 86400), nombre: "días" },
    { valor: faltan === null ? null : Math.floor((faltan % 86400) / 3600), nombre: "horas" },
    { valor: faltan === null ? null : Math.floor((faltan % 3600) / 60), nombre: "min" },
    { valor: faltan === null ? null : faltan % 60, nombre: "seg" },
  ];

  return (
    <div role="timer" aria-label="Tiempo que falta para el evento" className="grid grid-cols-4 gap-2">
      {partes.map((p) => (
        <div key={p.nombre} className="flex flex-col items-center rounded-lg bg-primario-claro py-1">
          <span className="text-lg font-bold leading-tight tabular-nums text-primario">
            {p.valor === null ? "--" : p.nombre === "días" ? p.valor : dos(p.valor)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-foreground/60">{p.nombre}</span>
        </div>
      ))}
    </div>
  );
}
