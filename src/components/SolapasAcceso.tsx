"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type Solapa = "invitados" | "organizadores";

const SOLAPAS: { id: Solapa; nombre: string }[] = [
  { id: "invitados", nombre: "Invitados" },
  { id: "organizadores", nombre: "Organizadores" },
];

/** Dos solapas (invitados / organizadores) con un indicador que se desliza. */
export function SolapasAcceso({
  inicial,
  invitados,
  organizadores,
}: {
  inicial: Solapa;
  invitados: ReactNode;
  organizadores: ReactNode;
}) {
  const [activa, setActiva] = useState<Solapa>(inicial);
  const botones = useRef<Record<Solapa, HTMLButtonElement | null>>({ invitados: null, organizadores: null });

  // Flechas izquierda/derecha para moverse entre solapas (patrón de accesibilidad de tabs).
  function alTeclear(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const otra: Solapa = activa === "invitados" ? "organizadores" : "invitados";
    setActiva(otra);
    botones.current[otra]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tipo de acceso"
        onKeyDown={alTeclear}
        className="relative grid grid-cols-2 rounded-xl border border-borde bg-background p-1"
      >
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-primario-fondo shadow-md transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            activa === "organizadores" ? "translate-x-full" : ""
          }`}
        />
        {SOLAPAS.map((s) => (
          <button
            key={s.id}
            ref={(el) => {
              botones.current[s.id] = el;
            }}
            type="button"
            role="tab"
            id={`solapa-${s.id}`}
            aria-selected={activa === s.id}
            aria-controls={`panel-${s.id}`}
            tabIndex={activa === s.id ? 0 : -1}
            onClick={() => setActiva(s.id)}
            className={`relative z-10 rounded-lg py-2 text-sm font-medium transition-colors duration-300 ${
              activa === s.id ? "text-white" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      {/* key: al cambiar de solapa el panel se vuelve a montar y repite la animación. */}
      <div
        key={activa}
        role="tabpanel"
        id={`panel-${activa}`}
        aria-labelledby={`solapa-${activa}`}
        className="mt-4 animate-aparecer"
      >
        {activa === "invitados" ? invitados : organizadores}
      </div>
    </div>
  );
}
