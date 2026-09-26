"use client";

import Link from "next/link";
import { TEXTO_INICIO_INGRESO } from "@/lib/ingreso";
import { useIngresoHabilitado } from "./useIngresoHabilitado";

const ICONO_QR =
  "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM16 16h2v2h-2z";

/** Botón del inicio para escanear QR y marcar presentes; solo activo el día del evento. */
export function BotonIngreso() {
  const habilitado = useIngresoHabilitado();
  const contenido = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0 fill-none stroke-current stroke-2 [stroke-linejoin:round]">
        <path d={ICONO_QR} />
      </svg>
      <span>Registrar ingreso con QR</span>
    </>
  );

  if (!habilitado) {
    return (
      <span
        aria-disabled="true"
        title={`Se habilita el ${TEXTO_INICIO_INGRESO}`}
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-md"
      >
        <span aria-hidden>🔒</span>
        <span>
          <span className="font-medium">Registro de ingreso:</span> {TEXTO_INICIO_INGRESO}
        </span>
      </span>
    );
  }

  return (
    <Link
      href="/ingreso"
      className="flex w-full animate-pop items-center justify-center gap-2 rounded-xl bg-acento px-4 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-[0.97] [@media(max-height:700px)]:py-2"
    >
      {contenido}
    </Link>
  );
}
