import type { Metadata } from "next";
import { Guardia } from "@/components/admin/Guardia";

export const metadata: Metadata = {
  title: "Organizadores · Cena Mano Amiga",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <Guardia>{children}</Guardia>;
}
