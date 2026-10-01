"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/** QR de la invitación (el mismo link que manda el panel) para mostrar en la entrada. */
export function QrEntrada({ token }: { token: string }) {
  // El origen solo se conoce en el navegador; en el servidor se reserva el lugar.
  const origen = useSyncExternalStore(sinSuscripcion, () => window.location.origin, () => null);

  return (
    <div className="mx-auto flex size-[232px] items-center justify-center rounded-2xl bg-white p-4 shadow-lg">
      {origen && (
        <QRCodeSVG value={`${origen}/invitacion/${token}`} size={200} marginSize={0} level="M" title="Código QR de tu invitación" />
      )}
    </div>
  );
}

/**
 * Mientras se espera el ingreso, vuelve a pedir la página cada pocos segundos: cuando
 * escanean el QR en la entrada, la mesa aparece sola sin recargar.
 */
export function ActualizarAlIngresar() {
  const router = useRouter();
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [router]);
  return null;
}
