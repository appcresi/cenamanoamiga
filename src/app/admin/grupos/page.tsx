"use client";

import { addDoc, collection, doc, updateDoc, writeBatch } from "firebase/firestore";
import { useMemo, useState, type FormEvent } from "react";
import { ModalCompartir } from "@/components/admin/ModalCompartir";
import { AreaTexto, Boton, Campo, EstadoCarga, Modal, Selector, Titulo } from "@/components/admin/ui";
import { db } from "@/lib/firebase/cliente";
import { useColeccion } from "@/lib/firebase/useColeccion";
import { ETIQUETAS_TIPO_GRUPO, type Grupo, type Invitado, type Mesa, type TipoGrupo } from "@/lib/tipos";
import { generarToken, nombreMesa } from "@/lib/utilidades";

type Borrador = Omit<Grupo, "id" | "token">;

const VACIO: Borrador = {
  nombre: "",
  tipo: "empresa",
  contacto: "",
  telefono: "",
  email: "",
  mesaIds: [],
  lugares: 0,
  notas: "",
};

export default function PaginaGrupos() {
  const grupos = useColeccion<Grupo>("grupos");
  const { datos: invitados } = useColeccion<Invitado>("invitados");
  const { datos: mesas } = useColeccion<Mesa>("mesas");

  const [editando, setEditando] = useState<Grupo | "nuevo" | null>(null);
  const [compartiendo, setCompartiendo] = useState<Grupo | null>(null);

  const mesaPorId = useMemo(() => new Map(mesas.map((m) => [m.id, m])), [mesas]);
  const mesasOrdenadas = useMemo(() => [...mesas].sort((a, b) => a.numero - b.numero), [mesas]);
  const ordenados = useMemo(
    () => [...grupos.datos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [grupos.datos],
  );

  async function eliminar(g: Grupo) {
    const integrantes = invitados.filter((i) => i.grupoId === g.id);
    const aviso = integrantes.length
      ? ` Sus ${integrantes.length} invitados quedarán sin grupo (no se borran).`
      : "";
    if (!confirm(`¿Eliminar "${g.nombre}"?${aviso}`)) return;
    const lote = writeBatch(db());
    for (const i of integrantes) lote.update(doc(db(), "invitados", i.id), { grupoId: null });
    lote.delete(doc(db(), "grupos", g.id));
    await lote.commit();
  }

  return (
    <>
      <Titulo acciones={<Boton onClick={() => setEditando("nuevo")}>+ Nueva organización / grupo</Boton>}>
        Organizaciones y grupos ({grupos.datos.length})
      </Titulo>
      <p className="mb-6 max-w-2xl text-sm text-foreground/70">
        Usá los grupos para empresas, fundaciones, asociaciones, bancos u otras instituciones que compran una mesa, o para familias que vienen juntas. El link
        del grupo muestra sus mesas aunque no hayas cargado a cada integrante.
      </p>

      <EstadoCarga cargando={grupos.cargando} error={grupos.error} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ordenados.map((g) => {
          const cargados = invitados.filter((i) => i.grupoId === g.id).length;
          const nombresMesas = g.mesaIds
            .map((id) => mesaPorId.get(id))
            .filter((m): m is Mesa => !!m)
            .sort((a, b) => a.numero - b.numero)
            .map(nombreMesa);
          return (
            <article key={g.id} className="flex flex-col gap-2 rounded-xl border border-borde bg-superficie p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{g.nombre}</h2>
                <span className="rounded-full bg-primario-claro px-2 py-0.5 text-xs text-primario">
                  {ETIQUETAS_TIPO_GRUPO[g.tipo] ?? g.tipo}
                </span>
              </div>
              {g.contacto && (
                <p className="text-sm text-foreground/70">
                  Contacto: {g.contacto}
                  {g.telefono && ` · ${g.telefono}`}
                </p>
              )}
              <p className="text-sm">
                {nombresMesas.length ? nombresMesas.join(", ") : <span className="text-foreground/50">Sin mesa asignada</span>}
              </p>
              <p className="text-sm text-foreground/70">
                {cargados} invitados cargados{g.lugares ? ` de ${g.lugares} lugares` : ""}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-3 pt-2">
                <Boton variante="texto" className="px-0" onClick={() => setCompartiendo(g)}>Link/QR</Boton>
                <Boton variante="texto" className="px-0" onClick={() => setEditando(g)}>Editar</Boton>
                <Boton variante="texto" className="px-0 text-peligro" onClick={() => eliminar(g)}>Eliminar</Boton>
              </div>
            </article>
          );
        })}
      </div>
      {!grupos.cargando && !grupos.datos.length && (
        <p className="py-8 text-center text-foreground/50">Todavía no hay organizaciones ni grupos.</p>
      )}

      {editando && (
        <FormularioGrupo
          grupo={editando === "nuevo" ? null : editando}
          grupos={grupos.datos}
          mesas={mesasOrdenadas}
          alCerrar={() => setEditando(null)}
        />
      )}
      {compartiendo && (
        <ModalCompartir
          nombre={compartiendo.nombre}
          token={compartiendo.token}
          telefono={compartiendo.telefono}
          alCerrar={() => setCompartiendo(null)}
        />
      )}
    </>
  );
}

function FormularioGrupo({
  grupo,
  grupos,
  mesas,
  alCerrar,
}: {
  grupo: Grupo | null;
  grupos: Grupo[];
  mesas: Mesa[];
  alCerrar: () => void;
}) {
  const [datos, setDatos] = useState<Borrador>(() => {
    if (!grupo) return VACIO;
    const { id: _id, token: _token, ...resto } = grupo;
    return { ...VACIO, ...resto };
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = <K extends keyof Borrador>(campo: K, valor: Borrador[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const alternarMesa = (id: string) =>
    cambiar("mesaIds", datos.mesaIds.includes(id) ? datos.mesaIds.filter((m) => m !== id) : [...datos.mesaIds, id]);

  // Qué otro grupo ya reservó cada mesa (solo informativo).
  const reservadaPor = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const g of grupos) if (g.id !== grupo?.id) for (const id of g.mesaIds) mapa.set(id, g.nombre);
    return mapa;
  }, [grupos, grupo]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const registro = { ...datos, nombre: datos.nombre.trim(), lugares: Number(datos.lugares) || 0 };
    try {
      if (grupo) {
        await updateDoc(doc(db(), "grupos", grupo.id), registro);
      } else {
        await addDoc(collection(db(), "grupos"), { ...registro, token: generarToken() });
      }
      alCerrar();
    } catch (e) {
      setError(`No se pudo guardar: ${(e as Error).message}`);
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={grupo ? "Editar organización / grupo" : "Nueva organización / grupo"} alCerrar={alCerrar}>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre *" required className="sm:col-span-2" value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        <Selector etiqueta="Tipo" value={datos.tipo} onChange={(e) => cambiar("tipo", e.target.value as TipoGrupo)}>
          {Object.entries(ETIQUETAS_TIPO_GRUPO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Selector>
        <Campo etiqueta="Lugares comprados" type="number" min={0} value={datos.lugares || ""} onChange={(e) => cambiar("lugares", Number(e.target.value))} />
        <Campo etiqueta="Persona de contacto" value={datos.contacto} onChange={(e) => cambiar("contacto", e.target.value)} />
        <Campo etiqueta="Teléfono" type="tel" value={datos.telefono} onChange={(e) => cambiar("telefono", e.target.value)} />
        <Campo etiqueta="Email" type="email" className="sm:col-span-2" value={datos.email} onChange={(e) => cambiar("email", e.target.value)} />
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-medium">Mesas</legend>
          {mesas.length ? (
            <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-borde p-2 text-sm">
              {mesas.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-primario-claro">
                  <input type="checkbox" checked={datos.mesaIds.includes(m.id)} onChange={() => alternarMesa(m.id)} />
                  <span>
                    {nombreMesa(m)}
                    {reservadaPor.has(m.id) && <span className="text-foreground/50"> · {reservadaPor.get(m.id)}</span>}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/50">Primero creá las mesas en la sección Mesas.</p>
          )}
        </fieldset>
        <AreaTexto etiqueta="Notas internas" className="sm:col-span-2" value={datos.notas} onChange={(e) => cambiar("notas", e.target.value)} />
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
