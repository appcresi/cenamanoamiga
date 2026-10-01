import type { Metadata } from "next";
import { connection } from "next/server";
import { LectorQr } from "@/components/LectorQr";
import { obtenerEvento } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "Registro de ingreso · Cena de Beneficio",
  robots: { index: false, follow: false },
};

export default async function Ingreso() {
  await connection();
  return <LectorQr habilitado={(await obtenerEvento()).ingresoHabilitado} />;
}
