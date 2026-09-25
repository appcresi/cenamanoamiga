"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BotonTema } from "@/components/BotonTema";
import { Creditos } from "@/components/Creditos";
import { auth, db } from "@/lib/firebase/cliente";
import icono from "../../../public/manoamiga-icono.png";
import { Boton } from "./ui";

const SECCIONES = [
  { href: "/admin", nombre: "Resumen" },
  { href: "/admin/invitados", nombre: "Invitados" },
  { href: "/admin/grupos", nombre: "Organizaciones" },
  { href: "/admin/mesas", nombre: "Mesas" },
  { href: "/admin/evento", nombre: "Evento" },
];

type Estado = "cargando" | "sin_permiso" | "ok";

/** Solo deja pasar a usuarios de Google cuyo email figure en la colección `organizadores`. */
export function Guardia({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [email, setEmail] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth(), async (usuario) => {
        if (!usuario) {
          router.replace("/ingresar");
          return;
        }
        const correo = (usuario.email ?? "").toLowerCase();
        setEmail(correo);
        try {
          const snap = await getDoc(doc(db(), "organizadores", correo));
          setEstado(snap.exists() ? "ok" : "sin_permiso");
        } catch {
          setEstado("sin_permiso");
        }
      }),
    [router],
  );

  const salir = () => signOut(auth());

  if (estado === "cargando") {
    return <p className="p-8 text-center text-foreground/60">Cargando…</p>;
  }

  if (estado === "sin_permiso") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p>
          La cuenta <strong>{email}</strong> no tiene permisos de organizador. Pedile a un
          administrador que te habilite.
        </p>
        <Boton variante="secundario" onClick={salir}>
          Cerrar sesión
        </Boton>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <BarraAdmin email={email} ruta={ruta} alSalir={salir} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:p-0">{children}</main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-6 text-xs text-foreground/50 print:hidden">
        <Link href="/terminos" className="hover:text-primario">
          Términos y condiciones
        </Link>
        <Creditos />
      </footer>
    </div>
  );
}

function esActiva(href: string, ruta: string) {
  return href === "/admin" ? ruta === href : ruta.startsWith(href);
}

/** Barra del panel: en computadora muestra todas las secciones; en celular, un menú ☰. */
function BarraAdmin({ email, ruta, alSalir }: { email: string; ruta: string; alSalir: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const actual = SECCIONES.find((s) => esActiva(s.href, ruta));

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  return (
    <header className="relative z-40 border-b border-borde bg-superficie print:hidden">
      {/* La barra queda por encima del fondo oscuro del menú. */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center gap-x-6 bg-superficie px-4 py-3">
        <Link href="/admin" onClick={cerrar} className="flex min-w-0 items-center gap-2 font-semibold text-primario">
          <Image src={icono} alt="" className="size-8 shrink-0 rounded-full dark:bg-white dark:p-px" />
          <span className="truncate">Cena Mano Amiga</span>
        </Link>

        {/* Computadora */}
        <nav className="hidden flex-1 flex-wrap gap-1 text-sm md:flex">
          {SECCIONES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={esActiva(s.href, ruta) ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 ${esActiva(s.href, ruta) ? "bg-primario-claro font-medium text-primario" : "hover:bg-primario-claro"}`}
            >
              {s.nombre}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 text-sm md:flex">
          <BotonTema />
          <span className="text-foreground/60">{email}</span>
          <Boton variante="texto" className="px-0" onClick={alSalir}>
            Salir
          </Boton>
        </div>

        {/* Celular */}
        <span className="ml-auto truncate text-sm text-foreground/60 md:hidden">{actual?.nombre}</span>
        <span className="md:hidden">
          <BotonTema />
        </span>
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-controls="menu-admin"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-primario hover:bg-primario-claro md:hidden"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current stroke-2 [stroke-linecap:round]">
            {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {abierto && (
        <>
          <div className="fixed inset-0 animate-fundido bg-black/30 md:hidden" onClick={cerrar} aria-hidden />
          <nav
            id="menu-admin"
            className="absolute inset-x-0 top-full z-10 animate-aparecer border-b border-borde bg-superficie px-4 pb-4 pt-2 shadow-lg md:hidden"
          >
            <ul className="flex flex-col">
              {SECCIONES.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={cerrar}
                    aria-current={esActiva(s.href, ruta) ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 text-base ${esActiva(s.href, ruta) ? "bg-primario-claro font-medium text-primario" : "hover:bg-primario-claro"}`}
                  >
                    {s.nombre}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-borde px-3 pt-3 text-sm">
              <span className="min-w-0 truncate text-foreground/60">{email}</span>
              <Boton variante="secundario" onClick={alSalir}>
                Salir
              </Boton>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
