"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buscarInvitacion, type EstadoBusqueda } from "@/app/acciones";

const inicial: EstadoBusqueda = { error: null, opciones: [] };

export function BuscadorInvitacion() {
  const [estado, accion, buscando] = useActionState(buscarInvitacion, inicial);

  return (
    <form action={accion} className="flex w-full flex-col gap-2.5">
      <label htmlFor="consulta" className="sr-only">
        DNI o nombre de tu organización
      </label>
      <div className="flex gap-2">
        <input
          id="consulta"
          name="consulta"
          autoComplete="off"
          required
          placeholder="DNI u organización"
          className="min-w-0 flex-1 rounded-lg border border-borde bg-superficie px-4 py-3 text-base outline-none transition-shadow focus:border-primario focus:ring-4 focus:ring-primario/15"
        />
        <button
          type="submit"
          disabled={buscando}
          className="flex items-center gap-2 rounded-lg bg-primario-fondo px-5 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:opacity-60"
        >
          {buscando && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {buscando ? "Buscando" : "Buscar"}
        </button>
      </div>
      <p className="text-xs text-foreground/60">
        Buscá tu mesa con tu DNI o el nombre de tu empresa, fundación, asociación o banco. ¿Tenés
        un link o QR? Abrilo directamente.
      </p>
      {estado.error && (
        <p key={estado.error} className="animate-sacudir text-sm text-peligro">
          {estado.error}
        </p>
      )}
      {estado.opciones.length > 0 && (
        <div className="flex animate-aparecer flex-col gap-2">
          <p className="text-sm font-medium">Encontramos varias organizaciones. Elegí la tuya:</p>
          <ul className="flex flex-col gap-2">
            {estado.opciones.map((o, i) => (
              <li key={o.id} className="animate-aparecer" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  href={`/organizacion/${o.id}`}
                  className="block rounded-lg border border-borde px-4 py-3 transition hover:translate-x-1 hover:border-primario hover:bg-primario-claro"
                >
                  {o.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
