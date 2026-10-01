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

  const cambiar = <K extends keyof Evento>(campo: K, valor: Evento[K]) => {
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
        <Campo etiqueta="Fecha y hora (Argentina)" type="datetime-local" value={evento.fecha} onChange={(e) => cambiar("fecha", e.target.value)} />
        <Campo etiqueta="Vestimenta" placeholder="Ej: Elegante sport" value={evento.vestimenta} onChange={(e) => cambiar("vestimenta", e.target.value)} />
        <Campo etiqueta="Lugar" placeholder="Ej: Salón ..." value={evento.lugar} onChange={(e) => cambiar("lugar", e.target.value)} />
        <Campo etiqueta="Dirección" value={evento.direccion} onChange={(e) => cambiar("direccion", e.target.value)} />
        <Campo
          etiqueta="Link de Google Maps (opcional)"
          type="url"
          className="sm:col-span-2"
          placeholder="Pegá el link de «Compartir» de Google Maps para marcar el lugar exacto"
          value={evento.mapa}
          onChange={(e) => cambiar("mapa", e.target.value)}
        />
        <AreaTexto etiqueta="Información adicional" rows={5} className="sm:col-span-2" placeholder="Programa, estacionamiento, contacto, etc." value={evento.informacion} onChange={(e) => cambiar("informacion", e.target.value)} />
        <div className="sm:col-span-2">
          <AreaTexto
            etiqueta="Mensaje de WhatsApp"
            rows={4}
            placeholder={EVENTO_POR_DEFECTO.mensajeWhatsapp}
            value={evento.mensajeWhatsapp}
            onChange={(e) => cambiar("mensajeWhatsapp", e.target.value)}
          />
          <p className="mt-1.5 text-xs text-foreground/60">
            Es el texto que se envía con el botón «Enviar por WhatsApp». Usá {"{nombre}"} para el nombre del invitado
            u organización y {"{link}"} para su invitación (si no lo ponés, el link se agrega al final). Si lo dejás
            vacío se usa el mensaje original.
          </p>
        </div>
        <Campo
          etiqueta="Asunto del mail"
          className="sm:col-span-2"
          placeholder={EVENTO_POR_DEFECTO.asuntoMail}
          value={evento.asuntoMail}
          onChange={(e) => cambiar("asuntoMail", e.target.value)}
        />
        <div className="sm:col-span-2">
          <AreaTexto
            etiqueta="Mensaje del mail"
            rows={7}
            placeholder={EVENTO_POR_DEFECTO.mensajeMail}
            value={evento.mensajeMail}
            onChange={(e) => cambiar("mensajeMail", e.target.value)}
          />
          <p className="mt-1.5 text-xs text-foreground/60">
            Es el texto del botón «Enviar por mail», que abre el programa de correo con el mail listo para enviar.
            Funciona igual que el de WhatsApp: {"{nombre}"}, {"{link}"} y, si lo dejás vacío, el mensaje original.
          </p>
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-borde p-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5 size-4"
            checked={evento.ingresoHabilitado}
            onChange={(e) => cambiar("ingresoHabilitado", e.target.checked)}
          />
          <span>
            <span className="font-medium">Habilitar registro de ingreso con QR</span>
            <span className="block text-xs text-foreground/60">
              Activa el botón «Registrar ingreso con QR» del inicio para escanear invitaciones y marcar presentes. Dejalo
              desactivado hasta el día del evento.
            </span>
          </span>
        </label>
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
