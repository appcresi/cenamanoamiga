// Ventana en la que se puede registrar el ingreso de invitados (hora de Argentina, UTC-3).
// Para cambiar la fecha del evento, modificar estas dos constantes.
export const INICIO_INGRESO = new Date("2026-10-07T20:00:00-03:00");
export const FIN_INGRESO = new Date("2026-10-08T06:00:00-03:00");

export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

/**
 * true dentro de la ventana del evento. Con NEXT_PUBLIC_INGRESO_SIEMPRE=1 queda
 * habilitado siempre (solo para probar antes del evento).
 */
export function ingresoHabilitado(ahora: number = Date.now()): boolean {
  if (process.env.NEXT_PUBLIC_INGRESO_SIEMPRE === "1") return true;
  return ahora >= INICIO_INGRESO.getTime() && ahora < FIN_INGRESO.getTime();
}

/** "7 de octubre a las 20 h" */
export const TEXTO_INICIO_INGRESO = `${INICIO_INGRESO.toLocaleDateString("es-AR", {
  day: "numeric",
  month: "long",
  timeZone: ZONA_HORARIA,
})} a las ${INICIO_INGRESO.toLocaleTimeString("es-AR", { hour: "numeric", hourCycle: "h23", timeZone: ZONA_HORARIA })} h`;

/** "20:14" en hora argentina (el servidor de Vercel está en UTC). */
export function horaArgentina(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA_HORARIA });
}

/** Saca el código de un QR de invitación ("https://…/invitacion/abc123") o lo toma tal cual. */
export function tokenDeQr(texto: string): string | null {
  const limpio = texto.trim();
  const enLink = limpio.match(/\/invitacion\/([A-Za-z0-9]{6,40})(?:[/?#]|$)/);
  if (enLink) return enLink[1];
  return /^[A-Za-z0-9]{6,40}$/.test(limpio) ? limpio : null;
}
