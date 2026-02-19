import { Provincia } from "@/types/index";
import { apiRequest } from "./api";
export const provinciasService = {
  // Obtener todas las provincias
  getAll: async (): Promise<Provincia[]> => {
    return apiRequest<Provincia[]>("/provincias");
  },

  // Obtener localidad por ID
  getById: async (id: number): Promise<Provincia> => {
    return apiRequest<Provincia>(`/provincias/${id}`);
  },

  // Crear nueva localidad
  create: async (localidad: Omit<Provincia, "id">): Promise<Provincia> => {
    return apiRequest<Provincia>("/provincias", {
      method: "POST",
      body: JSON.stringify(localidad),
    });
  },

  // Actualizar localidad
  update: async (
    id: number,
    localidad: Partial<Omit<Provincia, "provinciaId">>
  ): Promise<Provincia> => {
    return apiRequest<Provincia>(`/provincias/${id}`, {
      method: "PATCH",
      body: JSON.stringify(localidad),
    });
  },

  // Eliminar localidad
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/provincias/${id}`, {
      method: "DELETE",
    });
  },

  // Obtener provincias por provincia
  getByProvincia: async (provincia: number): Promise<Provincia[]> => {
    return apiRequest<Provincia[]>(`/provincias/provincia/${provincia}`);
  },
};
