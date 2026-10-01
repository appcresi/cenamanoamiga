const ALFABETO = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código aleatorio para los links de invitación (sin caracteres ambiguos). */
export function generarToken(largo = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(largo));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

/** Minúsculas, sin acentos ni espacios repetidos: "Fundación  X" → "fundacion x". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // quita los acentos que separó normalize
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** "viernes 20 de noviembre · 21:00 h" (sin año, para que entre en una línea). */
export function formatearFechaCorta(fecha: string): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  const dia = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const hora = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dia} · ${hora} h`;
}

export function nombreCompleto(i: { nombre: string; apellido: string }): string {
  return `${i.nombre} ${i.apellido}`.trim();
}

export function nombreMesa(m: { numero: number; nombre: string }): string {
  return m.nombre ? `Mesa ${m.numero} · ${m.nombre}` : `Mesa ${m.numero}`;
}

/** Completa {nombre} y {link} en la plantilla; si la plantilla no tiene {link}, lo agrega al final. */
export function armarMensajeWhatsapp(plantilla: string, nombre: string, link: string): string {
  const texto = plantilla.replaceAll("{nombre}", nombre).trim();
  return plantilla.includes("{link}") ? texto.replaceAll("{link}", link) : `${texto} ${link}`.trim();
}
