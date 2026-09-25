"use client";

import { addDoc, arrayRemove, collection, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useMemo, useState, type FormEvent } from "react";
import { PlanoSalon } from "@/components/admin/PlanoSalon";
import { Boton, Campo, EstadoCarga, Modal, Titulo } from "@/components/admin/ui";
import { db } from "@/lib/firebase/cliente";
import { useColeccion } from "@/lib/firebase/useColeccion";
import type { Grupo, Invitado, Mesa } from "@/lib/tipos";
import { nombreCompleto, nombreMesa } from "@/lib/utilidades";

export default function PaginaMesas() {
  const mesas = useColeccion<Mesa>("mesas");
  const { datos: invitados } = useColeccion<Invitado>("invitados");
  const { datos: grupos } = useColeccion<Grupo>("grupos");

  const [editando, setEditando] = useState<Mesa | "nuevo" | null>(null);
  const [creandoVarias, setCreandoVarias] = useState(false);
  const [vista, setVista] = useState<"plano" | "lista">("plano");

  const ordenadas = useMemo(() => [...mesas.datos].sort((a, b) => a.numero - b.numero), [mesas.datos]);
  const siguienteNumero = (ordenadas.at(-1)?.numero ?? 0) + 1;

  async function eliminar(m: Mesa) {
    const sentados = invitados.filter((i) => i.mesaId === m.id);
    const reservas = grupos.filter((g) => g.mesaIds.includes(m.id));
    const aviso = sentados.length || reservas.length
      ? ` ${sentados.length} invitados y ${reservas.length} grupos quedarán sin esta mesa.`
      : "";
    if (!confirm(`¿Eliminar ${nombreMesa(m)}?${aviso}`)) return;
    const lote = writeBatch(db());
    for (const i of sentados) lote.update(doc(db(), "invitados", i.id), { mesaId: null });
    for (const g of reservas) lote.update(doc(db(), "grupos", g.id), { mesaIds: arrayRemove(m.id) });
    lote.delete(doc(db(), "mesas", m.id));
    await lote.commit();
  }

  return (
    <>
      <Titulo
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setCreandoVarias(true)}>
              Crear varias
            </Boton>
            <Boton onClick={() => setEditando("nuevo")}>+ Nueva mesa</Boton>
          </>
        }
      >
        Mesas ({mesas.datos.length})
      </Titulo>

      <div role="tablist" className="mb-4 inline-flex rounded-lg border border-borde bg-superficie p-1 text-sm">
        {(["plano", "lista"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => setVista(v)}
            className={`rounded-md px-4 py-1.5 ${vista === v ? "bg-primario font-medium text-white" : "hover:bg-primario-claro"}`}
          >
            {v === "plano" ? "Plano del salón" : "Lista"}
          </button>
        ))}
      </div>

      <EstadoCarga cargando={mesas.cargando} error={mesas.error} />

      {!mesas.cargando && vista === "plano" && (
        <PlanoSalon
          mesas={ordenadas}
          invitados={invitados}
          grupos={grupos}
          alEditar={setEditando}
          alEliminar={eliminar}
        />
      )}

      {vista === "lista" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordenadas.map((m) => {
            const sentados = invitados.filter((i) => i.mesaId === m.id);
            const reservas = grupos.filter((g) => g.mesaIds.includes(m.id));
            const llena = sentados.length >= m.capacidad;
            return (
              <article key={m.id} className="flex flex-col gap-2 rounded-xl border border-borde bg-superficie p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">{nombreMesa(m)}</h2>
                  <span className={`text-sm ${llena ? "font-medium text-peligro" : "text-foreground/60"}`}>
                    {sentados.length}/{m.capacidad}
                  </span>
                </div>
                {reservas.length > 0 && (
                  <p className="text-sm text-acento">Reservada por {reservas.map((g) => g.nombre).join(", ")}</p>
                )}
                {sentados.length > 0 && (
                  <ul className="text-sm text-foreground/70">
                    {sentados.map((i) => (
                      <li key={i.id}>{nombreCompleto(i)}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex gap-3 pt-2">
                  <Boton variante="texto" className="px-0" onClick={() => setEditando(m)}>Editar</Boton>
                  <Boton variante="texto" className="px-0 text-peligro" onClick={() => eliminar(m)}>Eliminar</Boton>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {vista === "lista" && !mesas.cargando && !mesas.datos.length && (
        <p className="py-8 text-center text-foreground/50">Todavía no hay mesas. Podés crear varias de una vez.</p>
      )}

      {editando && (
        <FormularioMesa
          mesa={editando === "nuevo" ? null : editando}
          mesas={mesas.datos}
          siguienteNumero={siguienteNumero}
          alCerrar={() => setEditando(null)}
        />
      )}
      {creandoVarias && (
        <CrearVarias desde={siguienteNumero} alCerrar={() => setCreandoVarias(false)} />
      )}
    </>
  );
}

function FormularioMesa({
  mesa,
  mesas,
  siguienteNumero,
  alCerrar,
}: {
  mesa: Mesa | null;
  mesas: Mesa[];
  siguienteNumero: number;
  alCerrar: () => void;
}) {
  const [numero, setNumero] = useState(mesa?.numero ?? siguienteNumero);
  const [nombre, setNombre] = useState(mesa?.nombre ?? "");
  const [capacidad, setCapacidad] = useState(mesa?.capacidad ?? 10);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (mesas.some((m) => m.numero === numero && m.id !== mesa?.id)) {
      setError(`Ya existe la mesa ${numero}.`);
      return;
    }
    setGuardando(true);
    const registro = { numero, nombre: nombre.trim(), capacidad };
    try {
      if (mesa) await updateDoc(doc(db(), "mesas", mesa.id), registro);
      else await addDoc(collection(db(), "mesas"), registro);
      alCerrar();
    } catch (e) {
      setError(`No se pudo guardar: ${(e as Error).message}`);
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={mesa ? "Editar mesa" : "Nueva mesa"} alCerrar={alCerrar}>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Número *" type="number" min={1} required value={numero} onChange={(e) => setNumero(Number(e.target.value))} />
        <Campo etiqueta="Capacidad *" type="number" min={1} required value={capacidad} onChange={(e) => setCapacidad(Number(e.target.value))} />
        <Campo etiqueta="Nombre (opcional)" placeholder="Ej: Presidencia" className="sm:col-span-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        {error && <p className="text-sm text-peligro sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function CrearVarias({ desde, alCerrar }: { desde: number; alCerrar: () => void }) {
  const [cantidad, setCantidad] = useState(10);
  const [capacidad, setCapacidad] = useState(10);
  const [guardando, setGuardando] = useState(false);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const lote = writeBatch(db());
    for (let n = 0; n < cantidad; n++) {
      lote.set(doc(collection(db(), "mesas")), { numero: desde + n, nombre: "", capacidad });
    }
    await lote.commit();
    alCerrar();
  }

  return (
    <Modal titulo="Crear varias mesas" alCerrar={alCerrar}>
      <form onSubmit={crear} className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Cantidad de mesas" type="number" min={1} max={200} required value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
        <Campo etiqueta="Lugares por mesa" type="number" min={1} required value={capacidad} onChange={(e) => setCapacidad(Number(e.target.value))} />
        <p className="text-sm text-foreground/70 sm:col-span-2">
          Se crearán las mesas {desde} a {desde + cantidad - 1}.
        </p>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Creando…" : "Crear"}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
