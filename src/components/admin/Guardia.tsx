"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-primario">
            <Image src={icono} alt="" className="size-8" />
            Cena Mano Amiga
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1 text-sm">
            {SECCIONES.map((s) => {
              const activa = s.href === "/admin" ? ruta === s.href : ruta.startsWith(s.href);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`rounded-md px-3 py-1.5 ${activa ? "bg-primario-claro font-medium text-primario" : "hover:bg-primario-claro"}`}
                >
                  {s.nombre}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-foreground/60 md:inline">{email}</span>
            <Boton variante="texto" className="px-0" onClick={salir}>
              Salir
            </Boton>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
