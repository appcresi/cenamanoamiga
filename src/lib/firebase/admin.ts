import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Acepta la clave privada tal como suele pegarse en Vercel u otros paneles:
 * con o sin comillas alrededor, y con saltos de línea reales o escritos como \n.
 */
export function normalizarClavePrivada(clave: string): string {
  return clave
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
}

function app() {
  if (getApps().length) return getApp();
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  const faltantes = Object.entries({ FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY })
    .filter(([, valor]) => !valor?.trim())
    .map(([nombre]) => nombre);
  if (faltantes.length) {
    throw new Error(`Faltan variables de entorno del servidor: ${faltantes.join(", ")} (ver .env.example).`);
  }
  const privateKey = normalizarClavePrivada(FIREBASE_PRIVATE_KEY!);
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("FIREBASE_PRIVATE_KEY no tiene el formato esperado (debe empezar con -----BEGIN PRIVATE KEY-----).");
  }
  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID!.trim(),
      clientEmail: FIREBASE_CLIENT_EMAIL!.trim(),
      privateKey,
    }),
  });
}

export function adminDb() {
  return getFirestore(app());
}
