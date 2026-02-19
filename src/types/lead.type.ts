import { Representante } from "./cliente.types";
import { Provincia } from "./common.types";
import { Fuerza } from "./fuerza.types";

export interface Lead {
    id?: number;
    fullName?: string;
    email?: string;
    telefono?: string;
    provincia?: Provincia;
    representante?: Representante;
    fuerza?: Fuerza;
    estado?: EstadoLead;
}

export enum EstadoLead {
    PENDIENTE = 'PENDIENTE',
    CONTACTADO = 'CONTACTADO',
    NO_CONTACTADO = 'NO_CONTACTADO',
    CALIFICADO = 'CALIFICADO',
    NO_CALIFICADO = 'NO_CALIFICADO',
  }