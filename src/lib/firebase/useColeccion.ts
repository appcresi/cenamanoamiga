"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useCallback, useSyncExternalStore } from "react";
import { db } from "@/lib/firebase/cliente";

interface Estado<T> {
  datos: T[];
  cargando: boolean;
  error: string | null;
}

interface Suscripcion {
  estado: Estado<unknown>;
  oyentes: Set<() => void>;
  cortar: () => void;
  cierre?: ReturnType<typeof setTimeout>;
}

const INICIAL: Estado<never> = { datos: [], cargando: true, error: null };

// Una sola suscripción por colección para todo el panel. Antes cada página abría la
// suya y cambiar de solapa volvía a leer la colección entera (y Firestore cobra cada
// documento). Al salir de la última página que la usa se mantiene unos minutos por si
// se vuelve enseguida.
const ESPERA_CIERRE = 5 * 60_000;
const suscripciones = new Map<string, Suscripcion>();

function suscribir(nombre: string, avisar: () => void): () => void {
  let s = suscripciones.get(nombre);
  // Si la anterior terminó con error (Firestore ya la cortó, p. ej. sin permiso), se abre otra.
  if (!s || s.estado.error) {
    const nueva: Suscripcion = { estado: INICIAL, oyentes: new Set(), cortar: () => {} };
    const publicar = (estado: Estado<unknown>) => {
      nueva.estado = estado;
      nueva.oyentes.forEach((f) => f());
    };
    nueva.cortar = onSnapshot(
      collection(db(), nombre),
      (snap) => publicar({ datos: snap.docs.map((d) => ({ ...d.data(), id: d.id })), cargando: false, error: null }),
      (e) => {
        publicar({ ...nueva.estado, cargando: false, error: e.message });
      },
    );
    suscripciones.set(nombre, nueva);
    s = nueva;
  }
  const actual = s;
  clearTimeout(actual.cierre);
  actual.oyentes.add(avisar);
  return () => {
    actual.oyentes.delete(avisar);
    if (actual.oyentes.size) return;
    actual.cierre = setTimeout(() => {
      actual.cortar();
      if (suscripciones.get(nombre) === actual) suscripciones.delete(nombre);
    }, ESPERA_CIERRE);
  };
}

/** Colección completa de Firestore en tiempo real, compartida entre las páginas del panel. */
export function useColeccion<T extends { id: string }>(nombre: string): Estado<T> {
  const suscribirse = useCallback((avisar: () => void) => suscribir(nombre, avisar), [nombre]);
  return useSyncExternalStore(
    suscribirse,
    () => (suscripciones.get(nombre)?.estado ?? INICIAL) as Estado<T>,
    () => INICIAL,
  );
}
