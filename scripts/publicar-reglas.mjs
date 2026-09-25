// Publica firestore.rules en el proyecto de Firebase.
// Uso: npm run publicar-reglas
import "./_admin.mjs";
import { readFileSync } from "node:fs";
import { getSecurityRules } from "firebase-admin/security-rules";

const fuente = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const ruleset = await getSecurityRules().releaseFirestoreRulesetFromSource(fuente);
console.log(`Reglas publicadas (${ruleset.name}).`);
