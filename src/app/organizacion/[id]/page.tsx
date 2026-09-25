import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaInvitacion } from "@/components/PaginaInvitacion";
import { buscarOrganizacion, obtenerEvento } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "Mesa de tu organización · Cena de Beneficio",
  robots: { index: false, follow: false },
};

export default async function Organizacion(props: PageProps<"/organizacion/[id]">) {
  const { id } = await props.params;
  const [vista, evento] = await Promise.all([buscarOrganizacion(id), obtenerEvento()]);
  if (!vista) notFound();
  return <PaginaInvitacion vista={vista} evento={evento} />;
}
