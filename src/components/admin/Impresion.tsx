"use client";

import { useEffect, useState } from "react";
import { Creditos } from "@/components/Creditos";
import { Boton } from "./ui";

/** Botón que abre el diálogo de impresión del navegador (no se imprime a sí mismo). */
export function BotonImprimir({ children = "Imprimir" }: { children?: string }) {
  return (
    <Boton variante="secundario" className="print:hidden" onClick={() => window.print()}>
      <span aria-hidden className="mr-1.5">🖨</span>
      {children}
    </Boton>
  );
}

/** Encabezado que solo aparece en la hoja impresa. */
export function EncabezadoImpresion({ titulo, detalle }: { titulo: string; detalle?: string }) {
  // Se actualiza justo antes de imprimir (la página puede quedar abierta mucho tiempo).
  const [momento, setMomento] = useState(() => new Date());
  useEffect(() => {
    const actualizar = () => setMomento(new Date());
    window.addEventListener("beforeprint", actualizar);
    return () => window.removeEventListener("beforeprint", actualizar);
  }, []);
  const fecha = momento.toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" });
  return (
    <div className="mb-4 hidden border-b border-borde pb-3 print:block">
      <p className="text-xs uppercase tracking-wider text-foreground/60">
        Cena de Beneficio · Fundación Mano Amiga
      </p>
      <h1 className="text-xl font-semibold text-primario">{titulo}</h1>
      <p className="text-xs text-foreground/60">
        {detalle ? `${detalle} · ` : ""}Impreso el {fecha}
      </p>
    </div>
  );
}

/** Pie de la hoja impresa. */
export function PieImpresion() {
  return <Creditos className="mt-6 hidden print:block" />;
}
