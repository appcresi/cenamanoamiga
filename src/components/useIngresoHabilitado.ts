"use client";

import { useSyncExternalStore } from "react";
import { ingresoHabilitado } from "@/lib/ingreso";

// Se revisa cada 30 segundos: el botón se habilita solo cuando llega la hora.
function suscribir(avisar: () => void) {
  const intervalo = setInterval(avisar, 30_000);
  return () => clearInterval(intervalo);
}

/** true dentro del horario del evento. En el servidor siempre false (se decide al hidratar). */
export function useIngresoHabilitado(): boolean {
  return useSyncExternalStore(suscribir, () => ingresoHabilitado(), () => false);
}
