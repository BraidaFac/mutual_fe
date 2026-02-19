import { AuthUser } from "./auth.types";

export interface Provincia {
  id: number;
  nombre: string;
}

export enum TipoPrestamo {
  EXTRAORDINARIO = "extraordinario",
  PORCAJA = "porcaja",
  PORHABERES = "porhaberes",
  PORHABERES_CON_CANCELACION_SMSV = "porhaberes_con_cancelacion_smsv",
  PORHABERES_CON_CANCELACION_OTROS = "porhaberes_con_cancelacion_otros",
  TARJETA_DE_CREDITO = "tarjeta_de_credito",
  OTROS = "otros",
}

// Interfaces para paginación
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}
