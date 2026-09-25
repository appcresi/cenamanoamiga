"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

type Tema = "light" | "dark";

function suscribir(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observador.disconnect();
}

const temaActual = (): Tema => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Botón ☀/☾. `flotante` lo fija arriba a la derecha (páginas públicas). */
export function BotonTema({ flotante = false }: { flotante?: boolean }) {
  const ruta = usePathname();
  // En el servidor no se conoce el tema: se dibuja el botón sin ícono hasta hidratar.
  const tema = useSyncExternalStore(suscribir, temaActual, () => null);

  // El panel tiene su propio botón en la barra.
  if (flotante && ruta.startsWith("/admin")) return null;

  function alternar() {
    const nuevo: Tema = temaActual() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nuevo;
    try {
      localStorage.setItem("tema", nuevo === "dark" ? "oscuro" : "claro");
    } catch {
      // Sin almacenamiento (modo privado): el cambio vale solo para esta visita.
    }
  }

  const etiqueta = tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo nocturno";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-primario hover:bg-primario-claro print:hidden ${
        flotante ? "fixed right-3 top-3 z-30 border border-borde bg-superficie/80 backdrop-blur" : ""
      }`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
        {tema === "dark" ? (
          // Sol: volver a claro
          <path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6 19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        ) : tema === "light" ? (
          // Luna: pasar a nocturno
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        ) : null}
      </svg>
    </button>
  );
}
