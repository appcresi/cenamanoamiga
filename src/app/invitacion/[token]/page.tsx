import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaInvitacion } from "@/components/PaginaInvitacion";
import { buscarPorToken, obtenerEvento } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "Tu invitación · Cena de Beneficio",
  robots: { index: false, follow: false },
};

export default async function Invitacion(props: PageProps<"/invitacion/[token]">) {
  const { token } = await props.params;
  const [vista, evento] = await Promise.all([buscarPorToken(token), obtenerEvento()]);
  if (!vista) notFound();
  return <PaginaInvitacion vista={vista} evento={evento} />;
}
