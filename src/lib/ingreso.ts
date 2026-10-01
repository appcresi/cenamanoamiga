export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

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
