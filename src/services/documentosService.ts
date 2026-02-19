import { Documento } from "@/types/index";
import { apiRequest } from "./api";
export const documentosService = {
  // Obtener todos los documentos
  getAll: async (): Promise<Documento[]> => {
    return apiRequest<Documento[]>("/documentos");
  },

  // Obtener documento por ID
  getById: async (id: number): Promise<Documento> => {
    return apiRequest<Documento>(`/documentos/${id}`);
  },

  // Crear nuevo documento
  create: async (
    documento: Omit<Documento, "documentoId">
  ): Promise<Documento> => {
    return apiRequest<Documento>("/documentos", {
      method: "POST",
      body: JSON.stringify(documento),
    });
  },

  // Actualizar documento
  update: async (
    id: number,
    documento: Partial<Omit<Documento, "documentoId">>
  ): Promise<Documento> => {
    return apiRequest<Documento>(`/documentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(documento),
    });
  },

  // Eliminar documento
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/documentos/${id}`, {
      method: "DELETE",
    });
  },
};
