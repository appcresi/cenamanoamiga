"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/cliente";

/** Suscripción en tiempo real a una colección completa de Firestore. */
export function useColeccion<T extends { id: string }>(nombre: string) {
  const [datos, setDatos] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      onSnapshot(
        collection(db(), nombre),
        (snap) => {
          setDatos(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T));
          setError(null);
          setCargando(false);
        },
        (e) => {
          setError(e.message);
          setCargando(false);
        },
      ),
    [nombre],
  );

  return { datos, cargando, error };
}
