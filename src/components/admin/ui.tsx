"use client";

import type { ComponentProps, ReactNode } from "react";

const estiloCampo =
  "w-full rounded-lg border border-borde bg-superficie px-3 py-2 outline-none transition-shadow focus:border-primario focus:ring-4 focus:ring-primario/15";

export function Campo({
  etiqueta,
  className = "",
  ...props
}: ComponentProps<"input"> & { etiqueta: string }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium">{etiqueta}</span>
      <input className={estiloCampo} {...props} />
    </label>
  );
}

export function AreaTexto({
  etiqueta,
  className = "",
  ...props
}: ComponentProps<"textarea"> & { etiqueta: string }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium">{etiqueta}</span>
      <textarea className={estiloCampo} rows={3} {...props} />
    </label>
  );
}

export function Selector({
  etiqueta,
  className = "",
  children,
  ...props
}: ComponentProps<"select"> & { etiqueta: string }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium">{etiqueta}</span>
      <select className={estiloCampo} {...props}>
        {children}
      </select>
    </label>
  );
}

const variantes = {
  primario: "bg-primario-fondo text-white hover:bg-primario-fondo/90",
  secundario: "border border-borde bg-superficie hover:bg-primario-claro",
  peligro: "bg-peligro text-white hover:bg-peligro/90",
  texto: "text-primario hover:underline",
};

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: keyof typeof variantes }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[0.97] disabled:opacity-60 ${variantes[variante]} ${className}`}
      {...props}
    />
  );
}

export function Modal({
  titulo,
  alCerrar,
  children,
}: {
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fundido items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={alCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg animate-aparecer overflow-y-auto rounded-t-2xl bg-superficie p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className="text-2xl leading-none text-foreground/50">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Titulo({ children, acciones }: { children: ReactNode; acciones?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <h1 className="text-2xl font-semibold text-primario">{children}</h1>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

export function EstadoCarga({ cargando, error }: { cargando: boolean; error: string | null }) {
  if (error) return <p className="text-peligro">Error al cargar los datos: {error}</p>;
  if (cargando) return <p className="text-foreground/60">Cargando…</p>;
  return null;
}
