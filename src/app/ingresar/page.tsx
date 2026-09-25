import type { Metadata } from "next";
import { connection } from "next/server";
import { PaginaInicio } from "@/components/PaginaInicio";
import { obtenerEvento } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "Ingreso de organizadores · Cena de Beneficio",
  robots: { index: false, follow: false },
};

/** Mismo inicio, con la solapa de organizadores abierta (el panel redirige acá sin sesión). */
export default async function Ingresar() {
  await connection();
  return <PaginaInicio evento={await obtenerEvento()} solapa="organizadores" />;
}
