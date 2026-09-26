import type { Metadata } from "next";
import { LectorQr } from "@/components/LectorQr";

export const metadata: Metadata = {
  title: "Registro de ingreso · Cena de Beneficio",
  robots: { index: false, follow: false },
};

export default function Ingreso() {
  return <LectorQr />;
}
