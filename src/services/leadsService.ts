import {
  Cliente,
  FiltroClientes,
  PaginatedResponse
} from "@/types/index";
import { Lead } from "@/types/lead.type";
import { apiRequest } from "./api";

export const leadsService = {
  // Obtener todos los leads (sin paginación - para compatibilidad)
  getAll: async (filtros?: FiltroClientes): Promise<Lead[]> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.fullName) queryParams.append("fullName", filtros.fullName);
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.estado)
      queryParams.append("estado", filtros.estado??'');

    const query = queryParams.toString();
    return apiRequest<Lead[]>(`/leads/all${query ? `?${query}` : ""}`);
  },

  // Obtener clientes paginados
  getPaginated: async (
    filtros?: FiltroClientes
  ): Promise<PaginatedResponse<Lead>> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.fullName) queryParams.append("fullName", filtros.fullName);
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.estado)
      queryParams.append("estado", filtros.estado??'');
    if (filtros?.page) queryParams.append("page", filtros.page.toString());
    if (filtros?.limit) queryParams.append("limit", filtros.limit.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Lead>>(
      `/leads${query ? `?${query}` : ""}`
    );
  },

  // Obtener cliente por ID
  getById: async (id: number): Promise<Cliente> => {
    return apiRequest<Cliente>(`/leads/${id}`);
  },

  // Crear nuevo cliente
/*   create: async (cliente: ClienteFormData): Promise<Cliente> => {
    return apiRequest<Cliente>("/leads", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
  }, */

  // Actualizar cliente
  updateLead: async (id: number, lead: Partial<Lead>): Promise<Lead> => {
    return apiRequest<Lead>(`/leads/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify(lead),
    });
  },

  // Eliminar cliente
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/leads/${id}`, {
      method: "DELETE",
    });
  },

  assignToRepresentante: async (payload: {
    leadIds: number[];
    representanteId: number;
  }): Promise<void> => {
    return apiRequest<void>("/leads/asignacion", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Buscar clientes por nombre
  buscarPorNombre: async (nombre: string): Promise<Lead[]> => {
    return apiRequest<Lead[]>(
      `/leads/buscar?nombre=${encodeURIComponent(nombre)}`
    );
  },

  // Obtener clientes por localidad
  getByLocalidad: async (localidadId: number): Promise<Lead[]> => {
    return apiRequest<Lead[]>(`/leads/localidad/${localidadId}`);
  },

  // Obtener clientes por representante
  getByRepresentante: async (representanteId: number): Promise<Lead[]> => {
    return apiRequest<Lead[]>(`/leads/representante/${representanteId}`);
  },
};
