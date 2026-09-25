const ALFABETO = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código aleatorio para los links de invitación (sin caracteres ambiguos). */
export function generarToken(largo = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(largo));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

/** Deja solo los dígitos: "30.123.456" → "30123456". */
export function normalizarDni(dni: string): string {
  return dni.replace(/\D/g, "");
}

/** Minúsculas, sin acentos ni espacios repetidos: "Fundación  X" → "fundacion x". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function formatearFecha(fecha: string): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function nombreCompleto(i: { nombre: string; apellido: string }): string {
  return `${i.nombre} ${i.apellido}`.trim();
}

export function nombreMesa(m: { numero: number; nombre: string }): string {
  return m.nombre ? `Mesa ${m.numero} · ${m.nombre}` : `Mesa ${m.numero}`;
}
