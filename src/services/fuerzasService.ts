import { Fuerza } from "@/types/index";
import { apiRequest } from "./api";

export const fuerzasService = {
  // Obtener todas las fuerzas
  getAll: async (): Promise<Fuerza[]> => {
    return apiRequest<Fuerza[]>("/fuerzas");
  },

  // Obtener fuerza por ID
  getById: async (id: number): Promise<Fuerza> => {
    return apiRequest<Fuerza>(`/fuerzas/${id}`);
  },

  // Crear nueva fuerza
  create: async (fuerza: Omit<Fuerza, "id">): Promise<Fuerza> => {
    return apiRequest<Fuerza>("/fuerzas", {
      method: "POST",
      body: JSON.stringify(fuerza),
    });
  },

  // Actualizar fuerza
  update: async (
    id: number,
    fuerza: Partial<Omit<Fuerza, "fuerzaId">>
  ): Promise<Fuerza> => {
    return apiRequest<Fuerza>(`/fuerzas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(fuerza),
    });
  },

  // Eliminar fuerza
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/fuerzas/${id}`, {
      method: "DELETE",
    });
  },
};
