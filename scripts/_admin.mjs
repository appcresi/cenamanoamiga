// Inicializa Firebase Admin con las variables de .env.local.
import { cert, initializeApp } from "firebase-admin/app";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Faltan las variables FIREBASE_* en .env.local");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    // Igual que src/lib/firebase/admin.ts: tolera comillas alrededor y \n escritos.
    privateKey: FIREBASE_PRIVATE_KEY.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n"),
  }),
});
