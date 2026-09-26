"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { registrarIngreso, type ResultadoIngreso } from "@/app/ingreso/acciones";
import { TEXTO_INICIO_INGRESO } from "@/lib/ingreso";
import { useIngresoHabilitado } from "./useIngresoHabilitado";

// API nativa de lectura de códigos (Chrome en Android). No está en los tipos de TypeScript.
interface Detector {
  detect(fuente: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: {
      new (opciones: { formats: string[] }): Detector;
      getSupportedFormats(): Promise<string[]>;
    };
  }
}

type Decodificador = (video: HTMLVideoElement) => Promise<string | null>;

/** Usa el lector nativo si existe; si no (iPhone, etc.), jsQR sobre un canvas. */
async function crearDecodificador(): Promise<Decodificador> {
  if (window.BarcodeDetector && (await window.BarcodeDetector.getSupportedFormats()).includes("qr_code")) {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
  }
  const { default: jsQR } = await import("jsqr");
  const lienzo = document.createElement("canvas");
  const contexto = lienzo.getContext("2d", { willReadFrequently: true })!;
  return async (video) => {
    const escala = Math.min(1, 640 / video.videoWidth);
    lienzo.width = Math.round(video.videoWidth * escala);
    lienzo.height = Math.round(video.videoHeight * escala);
    contexto.drawImage(video, 0, 0, lienzo.width, lienzo.height);
    const imagen = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    return jsQR(imagen.data, imagen.width, imagen.height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

const mesasTexto = (mesas: number[]) =>
  mesas.length ? `${mesas.length > 1 ? "Mesas" : "Mesa"} ${mesas.join(" y ").replace(/ y (?=.* y )/g, ", ")}` : "Mesa a confirmar";

export function LectorQr() {
  const habilitado = useIngresoHabilitado();
  const video = useRef<HTMLVideoElement>(null);
  const ocupado = useRef(false);
  const ultimo = useRef<{ texto: string; momento: number } | null>(null);
  const [camara, setCamara] = useState<"iniciando" | "activa" | "sin_permiso" | "no_disponible">("iniciando");
  const [resultado, setResultado] = useState<ResultadoIngreso | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [dni, setDni] = useState("");

  const procesar = useCallback(async (entrada: { qr?: string; dni?: string }) => {
    ocupado.current = true;
    setProcesando(true);
    const r = await registrarIngreso(entrada);
    setResultado(r);
    setProcesando(false);
    // El navegador solo permite vibrar después de que la persona tocó la pantalla.
    if (navigator.userActivation?.hasBeenActive) {
      navigator.vibrate?.(r.estado === "ok" || r.estado === "grupo" ? 120 : [60, 60, 60]);
    }
    // Pausa breve para que se lea el resultado antes de seguir escaneando.
    setTimeout(() => (ocupado.current = false), 1500);
  }, []);

  useEffect(() => {
    if (!habilitado) return;
    let cancelado = false;
    let flujo: MediaStream | null = null;
    let temporizador: ReturnType<typeof setTimeout>;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamara("no_disponible");
        return;
      }
      try {
        flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      } catch {
        if (!cancelado) setCamara("sin_permiso");
        return;
      }
      if (cancelado || !video.current) return flujo.getTracks().forEach((t) => t.stop());
      video.current.srcObject = flujo;
      await video.current.play().catch(() => {});
      setCamara("activa");
      const decodificar = await crearDecodificador();

      const ciclo = async () => {
        if (cancelado) return;
        const v = video.current;
        if (v && !ocupado.current && v.readyState >= 2) {
          const texto = await decodificar(v).catch(() => null);
          // Ignora el mismo QR durante 4 segundos (sigue frente a la cámara).
          const repetido = texto && ultimo.current?.texto === texto && Date.now() - ultimo.current.momento < 4000;
          if (texto && !repetido) {
            ultimo.current = { texto, momento: Date.now() };
            await procesar({ qr: texto });
          }
        }
        temporizador = setTimeout(ciclo, 200);
      };
      ciclo();
    })();

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
      flujo?.getTracks().forEach((t) => t.stop());
    };
  }, [habilitado, procesar]);

  function buscarDni(e: FormEvent) {
    e.preventDefault();
    if (!dni.trim()) return;
    procesar({ dni });
    setDni("");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 bg-[#0d1322] px-4 py-4 text-white">
      <header className="flex items-center justify-between gap-3 pr-10">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Inicio
        </Link>
        <h1 className="text-lg font-semibold">Registro de ingreso</h1>
      </header>

      {!habilitado ? (
        <p className="mt-10 animate-aparecer rounded-2xl bg-white/10 p-6 text-center">
          El registro de ingreso se habilita el <strong>{TEXTO_INICIO_INGRESO}</strong>.
        </p>
      ) : (
        <>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
            <video ref={video} muted playsInline className="size-full object-cover" />
            {/* Marco de enfoque */}
            <div className="pointer-events-none absolute inset-[15%] rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
            {camara !== "activa" && (
              <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
                {camara === "iniciando" && "Abriendo la cámara…"}
                {camara === "sin_permiso" && "No hay permiso para usar la cámara. Habilitalo en el navegador o ingresá el DNI abajo."}
                {camara === "no_disponible" && "Este navegador no permite usar la cámara. Ingresá el DNI abajo."}
              </p>
            )}
            {procesando && (
              <span className="absolute right-3 top-3 size-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
          </div>

          <p className="text-center text-sm text-white/70">Apuntá la cámara al QR de la invitación.</p>

          {resultado && <Resultado key={JSON.stringify(resultado)} r={resultado} />}

          <form onSubmit={buscarDni} className="mt-auto flex gap-2">
            <label htmlFor="dni-ingreso" className="sr-only">
              DNI del invitado
            </label>
            <input
              id="dni-ingreso"
              inputMode="numeric"
              autoComplete="off"
              placeholder="¿Sin QR? Ingresá el DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white/60"
            />
            <button
              type="submit"
              disabled={procesando}
              className="rounded-lg bg-acento px-5 py-3 font-medium text-white transition active:scale-[0.97] disabled:opacity-60"
            >
              Registrar
            </button>
          </form>
        </>
      )}
    </main>
  );
}

function Resultado({ r }: { r: ResultadoIngreso }) {
  if (r.estado === "ok" || r.estado === "repetido") {
    const ok = r.estado === "ok";
    return (
      <section
        role="status"
        className={`animate-pop rounded-2xl p-5 text-center ${ok ? "bg-green-600" : "bg-amber-500 text-[#1f1f1f]"}`}
      >
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">
          {ok ? "✓ Presente" : `Ya había ingresado a las ${r.hora}`}
        </p>
        <p className="mt-1 text-2xl font-bold">{r.nombre}</p>
        {r.organizacion && <p className="opacity-80">{r.organizacion}</p>}
        <p className="mt-2 text-4xl font-extrabold">{mesasTexto(r.mesas)}</p>
      </section>
    );
  }
  if (r.estado === "grupo") {
    return (
      <section role="status" className="animate-pop rounded-2xl bg-green-600 p-5 text-center">
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">✓ Ingresó 1 persona de</p>
        <p className="mt-1 text-2xl font-bold">{r.nombre}</p>
        <p className="mt-2 text-4xl font-extrabold">{mesasTexto(r.mesas)}</p>
        <p className="mt-1 opacity-90">
          Ingresaron {r.ingresados}
          {r.lugares ? ` de ${r.lugares}` : ""}
        </p>
      </section>
    );
  }
  return (
    <section role="alert" className="animate-sacudir rounded-2xl bg-red-600 p-5 text-center">
      <p className="text-lg font-semibold">{r.mensaje}</p>
    </section>
  );
}
