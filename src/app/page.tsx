import { connection } from "next/server";
import { PaginaInicio } from "@/components/PaginaInicio";
import { obtenerEvento } from "@/lib/consultas";

export default async function Home() {
  await connection();
  return <PaginaInicio evento={await obtenerEvento()} />;
}
