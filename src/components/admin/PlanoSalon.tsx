"use client";

import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CLASE_PLANO, FondoPlano, MesaDibujo, type Silla } from "@/components/MesaDibujo";
import { db } from "@/lib/firebase/cliente";
import { limitar, ordenarSentados, posicionDe, posicionesEnGrilla, redondear, type Posicion } from "@/lib/plano";
import type { Grupo, Invitado, Mesa } from "@/lib/tipos";
import { nombreCompleto, nombreMesa } from "@/lib/utilidades";
import { Boton } from "./ui";

export function PlanoSalon({
  mesas,
  invitados,
  grupos,
  alEditar,
  alEliminar,
}: {
  mesas: Mesa[];
  invitados: Invitado[];
  grupos: Grupo[];
  alEditar: (m: Mesa) => void;
  alEliminar: (m: Mesa) => void;
}) {
  const plano = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; inicioX: number; inicioY: number; movio: boolean } | null>(null);
  const [moviendo, setMoviendo] = useState<{ id: string } & Posicion | null>(null);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  const grilla = useMemo(() => posicionesEnGrilla(mesas), [mesas]);

  const posicion = (m: Mesa): Posicion => (moviendo?.id === m.id ? moviendo : posicionDe(m, grilla));

  const sentadosPorMesa = useMemo(() => {
    const mapa = new Map<string, Invitado[]>();
    for (const i of invitados) if (i.mesaId) mapa.set(i.mesaId, [...(mapa.get(i.mesaId) ?? []), i]);
    for (const [id, lista] of mapa) mapa.set(id, ordenarSentados(lista));
    return mapa;
  }, [invitados]);

  const reservasPorMesa = useMemo(() => {
    const mapa = new Map<string, Grupo[]>();
    for (const g of grupos) for (const id of g.mesaIds) mapa.set(id, [...(mapa.get(id) ?? []), g]);
    return mapa;
  }, [grupos]);

  function guardarPosicion(id: string, p: Posicion) {
    void updateDoc(doc(db(), "mesas", id), { x: redondear(p.x), y: redondear(p.y) });
  }

  function puntoEnPlano(e: PointerEvent): Posicion {
    const r = plano.current!.getBoundingClientRect();
    return {
      x: limitar(((e.clientX - r.left) / r.width) * 100),
      y: limitar(((e.clientY - r.top) / r.height) * 100),
    };
  }

  function alPresionar(e: PointerEvent<HTMLButtonElement>, m: Mesa) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { id: m.id, inicioX: e.clientX, inicioY: e.clientY, movio: false };
  }

  function alMover(e: PointerEvent<HTMLButtonElement>) {
    const a = arrastre.current;
    if (!a) return;
    if (!a.movio && Math.hypot(e.clientX - a.inicioX, e.clientY - a.inicioY) < 4) return;
    a.movio = true;
    setMoviendo({ id: a.id, ...puntoEnPlano(e) });
  }

  function alSoltar(e: PointerEvent<HTMLButtonElement>) {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    if (a.movio) guardarPosicion(a.id, puntoEnPlano(e));
    else setSeleccionadaId((actual) => (actual === a.id ? null : a.id));
    setMoviendo(null);
  }

  // Flechas del teclado: mueven la mesa (Shift = pasos más grandes).
  function alTeclear(e: KeyboardEvent<HTMLButtonElement>, m: Mesa) {
    const paso = e.shiftKey ? 5 : 1;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-paso, 0],
      ArrowRight: [paso, 0],
      ArrowUp: [0, -paso],
      ArrowDown: [0, paso],
    };
    const d = deltas[e.key];
    if (!d) return;
    e.preventDefault();
    const p = posicion(m);
    guardarPosicion(m.id, { x: limitar(p.x + d[0]), y: limitar(p.y + d[1]) });
  }

  async function acomodarEnGrilla() {
    if (!confirm("¿Acomodar todas las mesas en una grilla? Se pierde la distribución actual.")) return;
    const lote = writeBatch(db());
    for (const [id, p] of grilla) lote.update(doc(db(), "mesas", id), p);
    await lote.commit();
  }

  const seleccionada = mesas.find((m) => m.id === seleccionadaId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
        <p>Arrastrá las mesas para ubicarlas. Tocá una mesa para ver quiénes están sentados.</p>
        <Boton variante="secundario" onClick={acomodarEnGrilla} disabled={!mesas.length}>
          Acomodar en grilla
        </Boton>
      </div>

      <div className="overflow-x-auto rounded-xl border border-borde bg-superficie">
        <div ref={plano} className={`${CLASE_PLANO} min-w-[640px]`}>
          <FondoPlano />

          {mesas.map((m) => {
            const p = posicion(m);
            return (
              <button
                key={m.id}
                type="button"
                aria-label={`${nombreMesa(m)}, ${sentadosPorMesa.get(m.id)?.length ?? 0} de ${m.capacidad} lugares`}
                onPointerDown={(e) => alPresionar(e, m)}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={() => {
                  arrastre.current = null;
                  setMoviendo(null);
                }}
                onKeyDown={(e) => alTeclear(e, m)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={`absolute aspect-square w-[12%] min-w-24 -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab rounded-full outline-none active:cursor-grabbing ${moviendo?.id === m.id ? "z-10 drop-shadow-lg" : ""}`}
              >
                <MesaAdmin
                  mesa={m}
                  sentados={sentadosPorMesa.get(m.id) ?? []}
                  reservada={reservasPorMesa.has(m.id)}
                  activa={seleccionadaId === m.id}
                />
              </button>
            );
          })}

          {!mesas.length && (
            <p className="absolute inset-0 flex items-center justify-center text-foreground/50">
              Todavía no hay mesas. Podés crear varias de una vez.
            </p>
          )}
        </div>
      </div>

      <ul className="flex flex-wrap gap-4 text-xs text-foreground/70">
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full border border-primario/40 bg-superficie" /> Lugar libre</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-primario" /> Lugar ocupado</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full border border-secundario bg-secundario/25" /> Reservado por organización / grupo</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-acento" /> Mesa completa</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-peligro" /> Excede la capacidad</li>
      </ul>

      {seleccionada && (
        <DetalleMesa
          mesa={seleccionada}
          sentados={sentadosPorMesa.get(seleccionada.id) ?? []}
          reservas={reservasPorMesa.get(seleccionada.id) ?? []}
          alEditar={() => alEditar(seleccionada)}
          alEliminar={() => alEliminar(seleccionada)}
          alCerrar={() => setSeleccionadaId(null)}
        />
      )}
    </div>
  );
}

/** Mesa del panel: muestra quién ocupa cada lugar y el estado de la mesa. */
function MesaAdmin({
  mesa,
  sentados,
  reservada,
  activa,
}: {
  mesa: Mesa;
  sentados: Invitado[];
  reservada: boolean;
  activa: boolean;
}) {
  const lugares = Math.max(mesa.capacidad, sentados.length);
  const sillas: Silla[] = Array.from({ length: lugares }, (_, i) => {
    const invitado = sentados[i];
    if (invitado) {
      return { estado: i >= mesa.capacidad ? "excedida" : "ocupada", titulo: nombreCompleto(invitado) };
    }
    return { estado: reservada ? "reservada" : "libre", titulo: "Lugar libre" };
  });
  const llena = sentados.length >= mesa.capacidad;

  return (
    <MesaDibujo
      numero={mesa.numero}
      nombre={mesa.nombre}
      detalle={`${sentados.length}/${mesa.capacidad}`}
      sillas={sillas}
      estado={llena ? "llena" : reservada ? "reservada" : "normal"}
      activa={activa}
    />
  );
}

function DetalleMesa({
  mesa,
  sentados,
  reservas,
  alEditar,
  alEliminar,
  alCerrar,
}: {
  mesa: Mesa;
  sentados: Invitado[];
  reservas: Grupo[];
  alEditar: () => void;
  alEliminar: () => void;
  alCerrar: () => void;
}) {
  const cambiarCapacidad = (delta: number) =>
    void updateDoc(doc(db(), "mesas", mesa.id), { capacidad: Math.max(1, mesa.capacidad + delta) });

  return (
    <section className="rounded-xl border border-borde bg-superficie p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{nombreMesa(mesa)}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foreground/60">{sentados.length} ocupados de</span>
          <Boton
            variante="secundario"
            className="size-8 px-0"
            aria-label="Quitar un lugar"
            disabled={mesa.capacidad <= 1}
            onClick={() => cambiarCapacidad(-1)}
          >
            −
          </Boton>
          <span className="w-6 text-center font-semibold">{mesa.capacidad}</span>
          <Boton variante="secundario" className="size-8 px-0" aria-label="Agregar un lugar" onClick={() => cambiarCapacidad(1)}>
            +
          </Boton>
          <span className="text-foreground/60">lugares</span>
        </div>
      </div>
      {reservas.length > 0 && (
        <p className="mt-1 text-sm text-secundario">Reservada por {reservas.map((g) => g.nombre).join(", ")}</p>
      )}
      {sentados.length ? (
        <ul className="mt-3 grid gap-1 text-sm text-foreground/80 sm:grid-cols-2">
          {sentados.map((i) => (
            <li key={i.id}>{nombreCompleto(i)}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-foreground/50">Sin invitados asignados directamente.</p>
      )}
      <div className="mt-4 flex gap-3">
        <Boton variante="texto" className="px-0" onClick={alEditar}>Editar</Boton>
        <Boton variante="texto" className="px-0 text-peligro" onClick={alEliminar}>Eliminar</Boton>
        <Boton variante="texto" className="ml-auto px-0 text-foreground/60" onClick={alCerrar}>Cerrar</Boton>
      </div>
    </section>
  );
}
