"use client";

import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase/cliente";

const CANCELADO = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

/** Botón "Ingresar con Google" para organizadores. */
export function IngresoGoogle() {
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
    <div className="flex flex-col gap-3 text-center">
      <p className="text-sm text-foreground/70">Ingresá con tu cuenta de Google habilitada.</p>
      <button
        type="button"
        onClick={ingresar}
        disabled={enviando}
        className="group flex items-center justify-center gap-3 rounded-lg border border-borde bg-white px-4 py-3 font-medium text-[#1f1f1f] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
      >
        {/* Logo "G" de Google (uso permitido en botones de inicio de sesión). */}
        <svg viewBox="0 0 48 48" aria-hidden className={`size-5 ${enviando ? "animate-spin" : ""}`}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {enviando ? "Ingresando…" : "Ingresar con Google"}
      </button>
      {error && (
        <p key={error} className="animate-sacudir text-sm text-peligro">
          {error}
        </p>
      )}
      <p className="text-xs text-foreground/60">
        Al ingresar aceptás los{" "}
        <Link href="/terminos#organizadores" className="text-primario underline underline-offset-2">
          términos y condiciones
        </Link>
        , incluido el uso confidencial de los datos de los invitados.
      </p>
    </div>
  );
}
