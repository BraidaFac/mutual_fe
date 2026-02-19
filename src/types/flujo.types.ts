import { TipoPrestamo } from "./common.types";
import { Documento } from "./documento.types";
import { Fuerza } from "./fuerza.types";

export enum TipoPaso {
  INICIAL = "inicial",
  INTERMEDIO = "intermedio",
  FINAL_EXITOSO = "final_exitoso",
  FINAL_RECHAZADO = "final_rechazado",
}

export interface FlujoTramite {
  id: number | undefined;
  nombre: string;
  descripcion?: string;
  fuerza: Fuerza;
  tipoPrestamo?: TipoPrestamo;
  activo: boolean;
  pasos: PasoTramite[];
  documentosRequeridos: DocumentoRequerido[];
}

export interface PasoTramite {
  id: number | undefined;
  temporalId: string;
  nombre: string;
  descripcion?: string;
  flujo: FlujoTramite;
  orden: number;
  diasMaximoSinAvance?: number;
  tipoPaso: TipoPaso;
  transicionesOrigen: ReglaTransicion[];
  transicionesDestino: ReglaTransicion[];
  color: string;
}

export interface DocumentoRequerido {
  id: number | undefined;
  temporalId: string;
  flujo: FlujoTramite;
  documento: Documento;
  obligatorio: boolean;
  noNecesarioSiEsSocio: boolean;
}

export interface ReglaTransicion {
  id: number | undefined;
  pasoOrigen: PasoTramite;
  pasoDestino: PasoTramite;
  esAutomatico: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condicionDocumentos?: any;
  descripcion?: string;
}

export interface FlujoDto {
  id?: number | undefined;
  nombre?: string;
  descripcion?: string;
  fuerza?: { id: number };
  tipoPrestamo?: TipoPrestamo;
  activo?: boolean;
  pasos: PasoTramite[];
  documentosRequeridos: DocumentoRequerido[];
}
