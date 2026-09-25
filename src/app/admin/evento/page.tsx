"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState, type FormEvent } from "react";
import { AreaTexto, Boton, Campo, Titulo } from "@/components/admin/ui";
import { db } from "@/lib/firebase/cliente";
import { EVENTO_POR_DEFECTO, type Evento } from "@/lib/tipos";

export default function PaginaEvento() {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [estado, setEstado] = useState<"" | "guardando" | "guardado" | "error">("");

  useEffect(() => {
    getDoc(doc(db(), "evento", "principal"))
      .then((snap) => setEvento({ ...EVENTO_POR_DEFECTO, ...(snap.data() as Partial<Evento> | undefined) }))
      .catch(() => setEvento(EVENTO_POR_DEFECTO));
  }, []);

  if (!evento) return <p className="text-foreground/60">Cargando…</p>;

  const cambiar = (campo: keyof Evento, valor: string) => {
    setEvento({ ...evento, [campo]: valor });
    setEstado("");
  };

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEstado("guardando");
    try {
      await setDoc(doc(db(), "evento", "principal"), evento);
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <>
      <Titulo>Datos del evento</Titulo>
      <p className="mb-6 max-w-2xl text-sm text-foreground/70">
        Esta información se muestra en la página de inicio y en la invitación de cada invitado.
      </p>
      <form onSubmit={guardar} className="grid max-w-2xl gap-4 rounded-xl border border-borde bg-superficie p-6 sm:grid-cols-2">
        <Campo etiqueta="Nombre del evento" required className="sm:col-span-2" value={evento.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        <Campo etiqueta="Fecha y hora" type="datetime-local" value={evento.fecha} onChange={(e) => cambiar("fecha", e.target.value)} />
        <Campo etiqueta="Vestimenta" placeholder="Ej: Elegante sport" value={evento.vestimenta} onChange={(e) => cambiar("vestimenta", e.target.value)} />
        <Campo etiqueta="Lugar" placeholder="Ej: Salón ..." value={evento.lugar} onChange={(e) => cambiar("lugar", e.target.value)} />
        <Campo etiqueta="Dirección" value={evento.direccion} onChange={(e) => cambiar("direccion", e.target.value)} />
        <AreaTexto etiqueta="Información adicional" rows={5} className="sm:col-span-2" placeholder="Programa, estacionamiento, contacto, etc." value={evento.informacion} onChange={(e) => cambiar("informacion", e.target.value)} />
        <div className="flex items-center justify-end gap-3 sm:col-span-2">
          {estado === "guardado" && <span className="text-sm text-green-700 dark:text-green-400">Guardado ✓</span>}
          {estado === "error" && <span className="text-sm text-peligro">No se pudo guardar</span>}
          <Boton type="submit" disabled={estado === "guardando"}>
            {estado === "guardando" ? "Guardando…" : "Guardar"}
          </Boton>
        </div>
      </form>
    </>
  );
}
