"use client";

import Link from "next/link";
import { EstadoCarga, Titulo } from "@/components/admin/ui";
import { useColeccion } from "@/lib/firebase/useColeccion";
import type { Grupo, Invitado, Mesa } from "@/lib/tipos";

export default function Resumen() {
  const invitados = useColeccion<Invitado>("invitados");
  const { datos: grupos } = useColeccion<Grupo>("grupos");
  const { datos: mesas } = useColeccion<Mesa>("mesas");

  const lista = invitados.datos;
  const gruposConMesa = new Set(grupos.filter((g) => g.mesaIds.length).map((g) => g.id));
  const sinMesa = lista.filter((i) => !i.mesaId && !gruposConMesa.has(i.grupoId ?? "")).length;
  const capacidad = mesas.reduce((total, m) => total + m.capacidad, 0);
  const lugaresGrupos = grupos.reduce((total, g) => total + (g.lugares || 0), 0);

  const tarjetas = [
    { titulo: "Invitados cargados", valor: lista.length, href: "/admin/invitados" },
    { titulo: "Confirmados", valor: lista.filter((i) => i.asistencia === "confirmado").length, href: "/admin/invitados" },
    { titulo: "Pendientes", valor: lista.filter((i) => i.asistencia === "pendiente").length, href: "/admin/invitados" },
    { titulo: "Sin mesa asignada", valor: sinMesa, href: "/admin/invitados" },
    { titulo: "Organizaciones y grupos", valor: grupos.length, href: "/admin/grupos" },
    { titulo: "Lugares vendidos a grupos", valor: lugaresGrupos, href: "/admin/grupos" },
    { titulo: "Mesas", valor: mesas.length, href: "/admin/mesas" },
    { titulo: "Capacidad total", valor: capacidad, href: "/admin/mesas" },
  ];

  return (
    <>
      <Titulo>Resumen</Titulo>
      <EstadoCarga cargando={invitados.cargando} error={invitados.error} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Link
            key={t.titulo}
            href={t.href}
            className="rounded-xl border border-borde bg-superficie p-5 transition-colors hover:border-primario"
          >
            <p className="text-sm text-foreground/60">{t.titulo}</p>
            <p className="mt-1 text-3xl font-semibold text-primario">{t.valor}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
