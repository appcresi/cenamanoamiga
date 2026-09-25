"use client";

import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useMemo, useState, type FormEvent } from "react";
import { ModalCompartir } from "@/components/admin/ModalCompartir";
import { AreaTexto, Boton, Campo, EstadoCarga, Modal, Selector, Titulo } from "@/components/admin/ui";
import { db } from "@/lib/firebase/cliente";
import { useColeccion } from "@/lib/firebase/useColeccion";
import { ETIQUETAS_ASISTENCIA, type Asistencia, type Grupo, type Invitado, type Mesa } from "@/lib/tipos";
import { generarToken, nombreCompleto, nombreMesa, normalizarDni } from "@/lib/utilidades";

type Borrador = Omit<Invitado, "id" | "token">;

const VACIO: Borrador = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  grupoId: null,
  mesaId: null,
  asistencia: "pendiente",
  notas: "",
};

const COLOR_ASISTENCIA: Record<Asistencia, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmado: "bg-green-100 text-green-800",
  no_asiste: "bg-gray-200 text-gray-700",
};

export default function PaginaInvitados() {
  const invitados = useColeccion<Invitado>("invitados");
  const { datos: grupos } = useColeccion<Grupo>("grupos");
  const { datos: mesas } = useColeccion<Mesa>("mesas");

  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroAsistencia, setFiltroAsistencia] = useState("");
  const [editando, setEditando] = useState<Invitado | "nuevo" | null>(null);
  const [compartiendo, setCompartiendo] = useState<Invitado | null>(null);

  const grupoPorId = useMemo(() => new Map(grupos.map((g) => [g.id, g])), [grupos]);
  const mesaPorId = useMemo(() => new Map(mesas.map((m) => [m.id, m])), [mesas]);
  const mesasOrdenadas = useMemo(() => [...mesas].sort((a, b) => a.numero - b.numero), [mesas]);

  function mesasDe(i: Invitado): string {
    const ids = i.mesaId ? [i.mesaId] : (grupoPorId.get(i.grupoId ?? "")?.mesaIds ?? []);
    const nombres = ids.map((id) => mesaPorId.get(id)).filter((m): m is Mesa => !!m).map(nombreMesa);
    return nombres.join(", ");
  }

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return invitados.datos
      .filter((i) => !filtroGrupo || (filtroGrupo === "ninguno" ? !i.grupoId : i.grupoId === filtroGrupo))
      .filter((i) => !filtroAsistencia || i.asistencia === filtroAsistencia)
      .filter(
        (i) =>
          !q ||
          nombreCompleto(i).toLowerCase().includes(q) ||
          i.dni.includes(normalizarDni(q) || "∅") ||
          (grupoPorId.get(i.grupoId ?? "")?.nombre.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre));
  }, [invitados.datos, busqueda, filtroGrupo, filtroAsistencia, grupoPorId]);

  async function eliminar(i: Invitado) {
    if (!confirm(`¿Eliminar a ${nombreCompleto(i)}? Su link dejará de funcionar.`)) return;
    await deleteDoc(doc(db(), "invitados", i.id));
  }

  return (
    <>
      <Titulo acciones={<Boton onClick={() => setEditando("nuevo")}>+ Nuevo invitado</Boton>}>
        Invitados ({invitados.datos.length})
      </Titulo>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Campo etiqueta="Buscar" placeholder="Nombre, DNI u organización" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <Selector etiqueta="Organización / grupo" value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
          <option value="">Todos</option>
          <option value="ninguno">Sin grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </Selector>
        <Selector etiqueta="Asistencia" value={filtroAsistencia} onChange={(e) => setFiltroAsistencia(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(ETIQUETAS_ASISTENCIA).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Selector>
      </div>

      <EstadoCarga cargando={invitados.cargando} error={invitados.error} />

      {!invitados.cargando && (
        <div className="overflow-x-auto rounded-xl border border-borde bg-superficie">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-borde bg-background text-foreground/60">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">DNI</th>
                <th className="px-4 py-3 font-medium">Organización / grupo</th>
                <th className="px-4 py-3 font-medium">Mesa</th>
                <th className="px-4 py-3 font-medium">Asistencia</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((i) => (
                <tr key={i.id} className="border-b border-borde last:border-0">
                  <td className="px-4 py-3 font-medium">{nombreCompleto(i)}</td>
                  <td className="px-4 py-3 text-foreground/70">{i.dni || "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{grupoPorId.get(i.grupoId ?? "")?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">{mesasDe(i) || <span className="text-foreground/40">Sin asignar</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ASISTENCIA[i.asistencia]}`}>
                      {ETIQUETAS_ASISTENCIA[i.asistencia]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Boton variante="texto" onClick={() => setCompartiendo(i)}>Link/QR</Boton>
                    <Boton variante="texto" onClick={() => setEditando(i)}>Editar</Boton>
                    <Boton variante="texto" className="text-peligro" onClick={() => eliminar(i)}>Eliminar</Boton>
                  </td>
                </tr>
              ))}
              {!visibles.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                    No hay invitados que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <FormularioInvitado
          invitado={editando === "nuevo" ? null : editando}
          invitados={invitados.datos}
          grupos={grupos}
          mesas={mesasOrdenadas}
          alCerrar={() => setEditando(null)}
        />
      )}
      {compartiendo && (
        <ModalCompartir
          nombre={nombreCompleto(compartiendo)}
          token={compartiendo.token}
          telefono={compartiendo.telefono}
          alCerrar={() => setCompartiendo(null)}
        />
      )}
    </>
  );
}

function FormularioInvitado({
  invitado,
  invitados,
  grupos,
  mesas,
  alCerrar,
}: {
  invitado: Invitado | null;
  invitados: Invitado[];
  grupos: Grupo[];
  mesas: Mesa[];
  alCerrar: () => void;
}) {
  const [datos, setDatos] = useState<Borrador>(() => {
    if (!invitado) return VACIO;
    const { id: _id, token: _token, ...resto } = invitado;
    return { ...VACIO, ...resto };
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = <K extends keyof Borrador>(campo: K, valor: Borrador[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  const ocupacion = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const i of invitados) if (i.mesaId) cuenta.set(i.mesaId, (cuenta.get(i.mesaId) ?? 0) + 1);
    return cuenta;
  }, [invitados]);

  const grupo = grupos.find((g) => g.id === datos.grupoId);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const dni = normalizarDni(datos.dni);
    const repetido = dni && invitados.find((i) => i.dni === dni && i.id !== invitado?.id);
    if (repetido) {
      setError(`Ya existe un invitado con ese DNI: ${nombreCompleto(repetido)}.`);
      return;
    }
    setGuardando(true);
    const registro = { ...datos, nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), dni };
    try {
      if (invitado) {
        await updateDoc(doc(db(), "invitados", invitado.id), registro);
      } else {
        await addDoc(collection(db(), "invitados"), { ...registro, token: generarToken() });
      }
      alCerrar();
    } catch (e) {
      setError(`No se pudo guardar: ${(e as Error).message}`);
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={invitado ? "Editar invitado" : "Nuevo invitado"} alCerrar={alCerrar}>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre *" required value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        <Campo etiqueta="Apellido" value={datos.apellido} onChange={(e) => cambiar("apellido", e.target.value)} />
        <Campo etiqueta="DNI" inputMode="numeric" value={datos.dni} onChange={(e) => cambiar("dni", e.target.value)} />
        <Campo etiqueta="Teléfono" type="tel" value={datos.telefono} onChange={(e) => cambiar("telefono", e.target.value)} />
        <Campo etiqueta="Email" type="email" className="sm:col-span-2" value={datos.email} onChange={(e) => cambiar("email", e.target.value)} />
        <Selector etiqueta="Organización / grupo" value={datos.grupoId ?? ""} onChange={(e) => cambiar("grupoId", e.target.value || null)}>
          <option value="">Ninguno</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </Selector>
        <Selector etiqueta="Mesa" value={datos.mesaId ?? ""} onChange={(e) => cambiar("mesaId", e.target.value || null)}>
          <option value="">{grupo?.mesaIds.length ? "La del grupo" : "Sin asignar"}</option>
          {mesas.map((m) => (
            <option key={m.id} value={m.id}>
              {nombreMesa(m)} ({ocupacion.get(m.id) ?? 0}/{m.capacidad})
            </option>
          ))}
        </Selector>
        <Selector etiqueta="Asistencia" value={datos.asistencia} onChange={(e) => cambiar("asistencia", e.target.value as Asistencia)}>
          {Object.entries(ETIQUETAS_ASISTENCIA).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Selector>
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
