export type Asistencia = "pendiente" | "confirmado" | "no_asiste";

export type TipoGrupo = "empresa" | "fundacion" | "asociacion" | "banco" | "institucion" | "particular";

/** Documento único `evento/principal`. */
export interface Evento {
  nombre: string;
  /** Fecha y hora en formato `YYYY-MM-DDTHH:mm` (hora local). */
  fecha: string;
  lugar: string;
  direccion: string;
  vestimenta: string;
  informacion: string;
}

export interface Mesa {
  id: string;
  numero: number;
  nombre: string;
  capacidad: number;
  /** Posición en el plano del salón, en % del ancho y alto. Sin valor = ubicación automática. */
  x?: number;
  y?: number;
}

/** Organización (empresa, fundación, banco…) o familia que compra una o más mesas / lugares. */
export interface Grupo {
  id: string;
  nombre: string;
  tipo: TipoGrupo;
  contacto: string;
  telefono: string;
  email: string;
  mesaIds: string[];
  lugares: number;
  notas: string;
  token: string;
  /** Personas que ingresaron el día del evento escaneando el QR de la organización. */
  ingresados?: number;
}

export interface Invitado {
  id: string;
  nombre: string;
  apellido: string;
  /** Solo dígitos (ver `normalizarDni`). Puede estar vacío. */
  dni: string;
  email: string;
  telefono: string;
  grupoId: string | null;
  /** Mesa propia. Si es null se usan las mesas del grupo. */
  mesaId: string | null;
  asistencia: Asistencia;
  notas: string;
  token: string;
  /** Momento del ingreso al evento (ISO), o null si todavía no llegó. */
  ingreso?: string | null;
}

/** Lo que ve un invitado (o un grupo) al abrir su link. */
export interface VistaInvitacion {
  tipo: "invitado" | "grupo";
  titulo: string;
  grupo: string | null;
  mesas: { numero: number; nombre: string }[];
  lugares: number | null;
  integrantes: string[];
  plano: {
    mesas: { id: string; numero: number; nombre: string; capacidad: number; x?: number; y?: number }[];
    /** Mesas a resaltar (la del invitado o las de su organización). */
    destacadas: string[];
    /** Lugar exacto del invitado, si tiene mesa propia. */
    silla: { mesaId: string; indice: number } | null;
  };
}

export const EVENTO_POR_DEFECTO: Evento = {
  nombre: "Cena de Beneficio",
  fecha: "",
  lugar: "",
  direccion: "",
  vestimenta: "",
  informacion: "",
};

export const ETIQUETAS_TIPO_GRUPO: Record<TipoGrupo, string> = {
  empresa: "Empresa",
  fundacion: "Fundación",
  asociacion: "Asociación",
  banco: "Banco",
  institucion: "Otra institución",
  particular: "Particular / familia",
};

export const ETIQUETAS_ASISTENCIA: Record<Asistencia, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  no_asiste: "No asiste",
};
