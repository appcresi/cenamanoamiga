import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BotonTema } from "@/components/BotonTema";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cena de Beneficio · Mano Amiga",
  description: "Gestión de invitados de la Cena de Beneficio del Colegio Mano Amiga Santa María — Fundación Mano Amiga",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme lo pone SCRIPT_TEMA antes de hidratar: difiere del HTML del servidor a propósito.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <BotonTema flotante />
      </body>
    </html>
  );
}
