import {
  FiltroRepresentantes,
  PaginatedResponse,
  Representante,
} from "@/types/index";
import { apiRequest } from "./api";

export const representantesService = {
  // Obtener todos los representantes (sin paginación - para compatibilidad)
  getAll: async (): Promise<Representante[]> => {
    return apiRequest<Representante[]>("/representantes/all");
  },

  // Obtener representantes paginados
  getPaginated: async (
    filtros?: FiltroRepresentantes
  ): Promise<PaginatedResponse<Representante>> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.fullName) queryParams.append("fullName", filtros.fullName);
    if (filtros?.email) queryParams.append("email", filtros.email);
    if (filtros?.page) queryParams.append("page", filtros.page.toString());
    if (filtros?.limit) queryParams.append("limit", filtros.limit.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Representante>>(
      `/representantes${query ? `?${query}` : ""}`
    );
  },

  // Obtener representante por ID
  getById: async (id: number): Promise<Representante> => {
    return apiRequest<Representante>(`/representantes/${id}`);
  },

  // Crear nuevo representante
  create: async (
    representante: Omit<Representante, "representanteId">
  ): Promise<Representante> => {
    return apiRequest<Representante>("/representantes", {
      method: "POST",
      body: JSON.stringify(representante),
    });
  },

  // Actualizar representante
  update: async (
    id: number,
    representante: Partial<Omit<Representante, "representanteId">>
  ): Promise<Representante> => {
    return apiRequest<Representante>(`/representantes/${id}`, {
      method: "PATCH    ",
      body: JSON.stringify(representante),
    });
  },

  // Eliminar representante
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/representantes/${id}`, {
      method: "DELETE",
    });
  },

  // Buscar representantes por nombre
  buscarPorNombre: async (nombre: string): Promise<Representante[]> => {
    return apiRequest<Representante[]>(
      `/representantes/buscar?nombre=${encodeURIComponent(nombre)}`
    );
  },
};
