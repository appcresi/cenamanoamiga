"use client";

import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton } from "@/components/admin/ui";
import { Encabezado } from "@/components/Encabezado";
import { auth } from "@/lib/firebase/cliente";

const CANCELADO = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export default function Ingresar() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function ingresar() {
    setEnviando(true);
    setError(null);
    try {
      const proveedor = new GoogleAuthProvider();
      proveedor.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth(), proveedor);
      router.replace("/admin");
    } catch (e) {
      const codigo = e instanceof FirebaseError ? e.code : "";
      if (!CANCELADO.includes(codigo)) {
        setError(
          codigo === "auth/popup-blocked"
            ? "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes y probá de nuevo."
            : "No se pudo ingresar con Google. Probá de nuevo.",
        );
      }
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-12">
      <Encabezado titulo="Organizadores" />
      <div className="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6 text-center">
        <p className="text-sm text-foreground/70">
          Ingresá con la cuenta de Google que te habilitaron como organizador.
        </p>
        <Boton onClick={ingresar} disabled={enviando} className="py-3">
          {enviando ? "Ingresando…" : "Ingresar con Google"}
        </Boton>
        {error && <p className="text-sm text-peligro">{error}</p>}
      </div>
    </main>
  );
}
