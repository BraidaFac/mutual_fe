import { AuthUser } from "./auth.types";
import { Provincia } from "./common.types";
import { Fuerza } from "./fuerza.types";
import { EstadoLead } from "./lead.type";

// Interface básica de Cliente para evitar dependencia circular
export interface ClienteBasico {
  id: number;
  fullName: string;
  email: string;
  telefono: string;
  dni: number;
  esSocio: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface básica de Tramite para evitar dependencia circular
export interface TramiteBasico {
  id: number;
  tipoPrestamo: string;
  montoSolicitado?: number;
  createdAt: Date;
}

export interface Representante {
  id: number;
  fullName: string;
  email: string;
  clientes: ClienteBasico[];
  telefono?: string;
  user?: AuthUser;
}

/** Payload para crear representante (incluye datos del usuario) */
export interface RepresentanteCreatePayload {
  fullName: string;
  email: string;
  telefono?: string;
  username: string;
  password: string;
}

export interface Cliente {
  id: number;
  fullName: string;
  email: string;
  telefono: string;
  dni: number;
  esSocio: boolean;
  provincia: Provincia;
  representante: Representante;
  fuerza: Fuerza;
  observaciones?: string;
  tramites: TramiteBasico[];
  createdAt: Date;
  updatedAt?: Date;
}

// Interfaces para formularios
export interface ClienteFormData {
  fullName: string;
  email: string;
  telefono: string;
  provinciaId?: number;
  representanteId?: number;
  fuerzaId?: number;
  observaciones?: string;
  matricula?: string;
  dni?: number;
  esSocio: boolean;
}

export interface ClienteFormDataErrors {
  fullName?: string;
  email?: string;
  telefono?: string;
  provinciaId?: string;
  representanteId?: string;
  fuerzaId?: string;
  observaciones?: string;
  matricula?: string;
  dni?: string;
  esSocio?: string;
}

// Interfaces para filtros
export interface FiltroClientes {
  page?: number;
  limit?: number;
  fullName?: string;
  provinciaId?: number;
  fuerzaId?: number;
  estado?: EstadoLead;
  telefono?: string;
  search?: string;
}

export interface FiltroRepresentantes {
  page?: number;
  limit?: number;
  fullName?: string;
  email?: string;
  search?: string;
}

export const validateForm = (
  formData: ClienteFormData,
): Partial<ClienteFormDataErrors> => {
  const newErrors: Partial<ClienteFormDataErrors> = {};

  if (!formData.fullName) {
    newErrors.fullName = "El nombre es requerido";
  }

  if (!formData.dni) {
    newErrors.dni = "El DNI es requerido";
  } else if (!/^[0-9]{7,8}$/.test(formData.dni.toString())) {
    newErrors.dni = "El DNI no es válido";
  }

  if (!formData.email.trim()) {
    newErrors.email = "El email es requerido";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "El email no es válido";
  }

  if (!formData.telefono.trim()) {
    newErrors.telefono = "El teléfono es requerido";

    if (!/^\+[0-9]+$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no es válido";
    }
  }

  if (!formData.provinciaId) {
    newErrors.provinciaId = "La provincia es requerida";
  }

  return newErrors;
};
