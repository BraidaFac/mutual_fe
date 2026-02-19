// Evitamos importar Cliente directamente para prevenir dependencia circular
import { Cliente } from "./cliente.types";
import { TipoPrestamo } from "./common.types";
import { Documento } from "./documento.types";
import { FlujoTramite, PasoTramite } from "./flujo.types";

export interface Tramite {
  id: number;
  cliente: Cliente; // Referencia a Cliente para evitar dependencia circular
  flujo: FlujoTramite;
  pasoActual: PasoTramite;
  tipoPrestamo: TipoPrestamo;
  numeroTramite?: number;
  montoSolicitado?: number;
  fechaUltimoContacto?: Date;
  documentos: TramiteDocumento[];
  observaciones?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TramiteDocumento {
  id?: number;
  tramite?: Tramite;
  documento?: Documento;
  fechaSubida?: Date;
  archivoNombre?: string;
  file?: File;
  archivoTipo?: DocumentoTipo;
  estado: EstadoDocumento;
}

export interface TramiteDocumentoFormData {
  documentoId?: number;
  file?: File;
  tipo?: string;
  fechaSubida?: Date;
  estado: EstadoDocumento;
}

export interface HistorialPaso {
  id: number;
  tramite: Tramite;
  paso: PasoTramite;
  fechaInicio: Date;
  fechaFin?: Date;
  observaciones?: string;
  usuarioResponsable?: string;
}

// Interfaces para formularios
export interface TramiteFormData {
  clienteId?: number;
  cliente?: Partial<Cliente>;
  flujoId?: number;
  tipoPrestamo?: TipoPrestamo;
  montoSolicitado?: number;
  fechaUltimoContacto?: Date | string;
  observaciones?: string;
  documentos: TramiteDocumento[];
}

// Interfaces para filtros
export interface FiltroTramites {
  page?: number;
  limit?: number;
  pasoId?: number;
  tipoPrestamo?: TipoPrestamo;
  clienteId?: number;
  provinciaId?: number;
  fuerzaId?: number;
  fechaDesde?: Date | null;
  fechaHasta?: Date | null;
  search?: string;
}

export enum EstadoDocumento {
  PENDIENTE = "Pendiente",
  RECIBIDO = "Recibido",
  RECHAZADO = "Rechazado",
  ACEPTADO = "Aceptado",
}

export enum DocumentoTipo {
  pdf = "application/pdf",
  jpeg = "image/jpeg",
  png = "image/png",
  jpg = "image/jpg",
  msword = "application/msword",
  wordprocessingml = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

export const tipoPrestamoOptions = [
  { value: TipoPrestamo.EXTRAORDINARIO, label: "Extraordinario" },
  { value: TipoPrestamo.PORCAJA, label: "Por Caja" },
  { value: TipoPrestamo.PORHABERES, label: "Por Haberes" },
  {
    value: TipoPrestamo.PORHABERES_CON_CANCELACION_SMSV,
    label: "Por Haberes con Cancelación SMSV",
  },
  {
    value: TipoPrestamo.PORHABERES_CON_CANCELACION_OTROS,
    label: "Por Haberes con Cancelación Otros",
  },
  { value: TipoPrestamo.TARJETA_DE_CREDITO, label: "Tarjeta de Crédito" },
  { value: TipoPrestamo.OTROS, label: "Otros" },
];

// Interfaces para estadísticas del dashboard
export interface EstadisticasPorPaso {
  pasoId: number;
  pasoNombre: string;
  pasoColor: string;
  cantidad: number;
  tramites: Tramite[];
}

export interface EstadisticasPorFuerza {
  fuerzaId: number;
  fuerzaNombre: string;
  cantidad: number;
  porPaso: EstadisticasPorPaso[];
}

export interface EstadisticasPorTipoPrestamo {
  tipoPrestamo: TipoPrestamo;
  cantidad: number;
  tramites: Tramite[];
}

export interface EstadisticasDashboard {
  totalTramites: number;
  tramitesActivos: number;
  tramitesConRetraso: number;
  tramitesUltimaSemana: number;
  porPaso: EstadisticasPorPaso[];
  porFuerza: EstadisticasPorFuerza[];
  porTipoPrestamo: EstadisticasPorTipoPrestamo[];
  tramitesRecientes: Tramite[];
}
