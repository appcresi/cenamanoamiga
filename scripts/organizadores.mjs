// Administra quién puede entrar al panel (con su cuenta de Google).
// Uso:
//   npm run organizadores -- agregar persona@gmail.com "Nombre Apellido"
//   npm run organizadores -- quitar persona@gmail.com
//   npm run organizadores -- listar
import "./_admin.mjs";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const [accion, emailCrudo = "", nombre = ""] = process.argv.slice(2);
const email = emailCrudo.trim().toLowerCase();
const coleccion = getFirestore().collection("organizadores");

if (accion === "listar") {
  const snap = await coleccion.get();
  if (snap.empty) console.log("No hay organizadores.");
  for (const d of snap.docs) console.log(`- ${d.id}${d.data().nombre ? ` (${d.data().nombre})` : ""}`);
} else if (accion === "agregar" && email.includes("@")) {
  await coleccion.doc(email).set({ nombre, creado: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`${email} ya puede ingresar con Google en /ingresar`);
} else if (accion === "quitar" && email.includes("@")) {
  await coleccion.doc(email).delete();
  console.log(`${email} ya no tiene acceso al panel.`);
} else {
  console.error('Uso: npm run organizadores -- agregar|quitar <email> ["Nombre"]  |  listar');
  process.exit(1);
}
