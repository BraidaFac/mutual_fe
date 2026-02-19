import { Representante } from "./cliente.types";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  representanteName: string;
  email: string;
  role: Role;
  password: string;
  representanteId?: number;
  telefono: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  representante: Representante
}

export enum Role {
  ADMIN = "ADMIN",
  REPRESENTANTE = "REPRESENTANTE",
  MANAGER = "MANAGER",
}
