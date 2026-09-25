"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buscarInvitacion, type EstadoBusqueda } from "@/app/acciones";

const inicial: EstadoBusqueda = { error: null, opciones: [] };

export function BuscadorInvitacion() {
  const [estado, accion, buscando] = useActionState(buscarInvitacion, inicial);

  return (
    <form action={accion} className="flex w-full flex-col gap-3">
      <label htmlFor="consulta" className="text-sm font-medium">
        Buscá tu mesa con tu DNI o el nombre de tu organización
      </label>
      <div className="flex gap-2">
        <input
          id="consulta"
          name="consulta"
          autoComplete="off"
          required
          placeholder="Ej: 30123456 o Banco Ejemplo"
          className="min-w-0 flex-1 rounded-lg border border-borde bg-superficie px-4 py-3 text-base outline-none focus:border-primario"
        />
        <button
          type="submit"
          disabled={buscando}
          className="rounded-lg bg-primario px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </div>
      <p className="text-xs text-foreground/60">
        Empresas, fundaciones, asociaciones, bancos y otras instituciones.
      </p>
      {estado.error && <p className="text-sm text-peligro">{estado.error}</p>}
      {estado.opciones.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Encontramos varias organizaciones. Elegí la tuya:</p>
          <ul className="flex flex-col gap-2">
            {estado.opciones.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/organizacion/${o.id}`}
                  className="block rounded-lg border border-borde px-4 py-3 hover:border-primario hover:bg-primario-claro"
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
