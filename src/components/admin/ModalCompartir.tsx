"use client";

import { doc, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase/cliente";
import { EVENTO_POR_DEFECTO, type Evento } from "@/lib/tipos";
import { armarMensajeWhatsapp } from "@/lib/utilidades";
import { Boton, Modal } from "./ui";

export function ModalCompartir({
  nombre,
  token,
  telefono,
  alCerrar,
}: {
  nombre: string;
  token: string;
  telefono?: string;
  alCerrar: () => void;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [plantilla, setPlantilla] = useState(EVENTO_POR_DEFECTO.mensajeWhatsapp);
  const link = `${window.location.origin}/invitacion/${token}`;
  const mensaje = armarMensajeWhatsapp(plantilla, nombre, link);

  useEffect(() => {
    getDoc(doc(db(), "evento", "principal"))
      .then((snap) => {
        const guardada = (snap.data() as Partial<Evento> | undefined)?.mensajeWhatsapp;
        if (guardada?.trim()) setPlantilla(guardada);
      })
      .catch(() => {});
  }, []);
  const numero = (telefono ?? "").replace(/\D/g, "");

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function descargarQr() {
    const a = document.createElement("a");
    a.href = lienzo.current!.toDataURL("image/png");
    a.download = `QR ${nombre}.png`;
    a.click();
  }

  return (
    <Modal titulo={`Invitación de ${nombre}`} alCerrar={alCerrar}>
      <div className="flex flex-col items-center gap-4">
        <QRCodeCanvas ref={lienzo} value={link} size={220} marginSize={2} level="M" />
        <p className="w-full break-all rounded-lg bg-background p-3 text-center font-mono text-sm">{link}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Boton onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar link"}</Boton>
          <Boton variante="secundario" onClick={descargarQr}>
            Descargar QR
          </Boton>
          <a
            href={`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-borde bg-superficie px-4 py-2 text-sm font-medium hover:bg-primario-claro"
          >
            Enviar por WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  );
}
