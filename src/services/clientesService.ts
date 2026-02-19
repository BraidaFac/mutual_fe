import {
  Cliente,
  ClienteFormData,
  FiltroClientes,
  PaginatedResponse,
} from "@/types/index";
import { apiRequest } from "./api";

export const clientesService = {
  // Obtener todos los clientes (sin paginación - para compatibilidad)
  getAll: async (filtros?: FiltroClientes): Promise<Cliente[]> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.fullName) queryParams.append("fullName", filtros.fullName);
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.estadoId)
      queryParams.append("estadoId", filtros.estadoId.toString());

    const query = queryParams.toString();
    return apiRequest<Cliente[]>(`/clientes/all${query ? `?${query}` : ""}`);
  },

  // Obtener clientes paginados
  getPaginated: async (
    filtros?: FiltroClientes
  ): Promise<PaginatedResponse<Cliente>> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.fullName) queryParams.append("fullName", filtros.fullName);
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.estadoId)
      queryParams.append("estadoId", filtros.estadoId.toString());
    if (filtros?.page) queryParams.append("page", filtros.page.toString());
    if (filtros?.limit) queryParams.append("limit", filtros.limit.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Cliente>>(
      `/clientes${query ? `?${query}` : ""}`
    );
  },

  // Obtener cliente por ID
  getById: async (id: number): Promise<Cliente> => {
    return apiRequest<Cliente>(`/clientes/${id}`);
  },

  // Crear nuevo cliente
  create: async (cliente: ClienteFormData): Promise<Cliente> => {
    return apiRequest<Cliente>("/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
  },

  createByLead: async (leadId: number, cliente: ClienteFormData): Promise<Cliente> => {
    return apiRequest<Cliente>(`/clientes/lead/${leadId}`, {
      method: "POST",
      body: JSON.stringify(cliente),
    });
  },

  // Actualizar cliente
  update: async (
    id: number,
    cliente: Partial<ClienteFormData>
  ): Promise<Cliente> => {
    return apiRequest<Cliente>(`/clientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(cliente),
    });
  },

  // Eliminar cliente
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/clientes/${id}`, {
      method: "DELETE",
    });
  },

  // Buscar clientes por nombre
  buscarPorNombre: async (nombre: string): Promise<Cliente[]> => {
    return apiRequest<Cliente[]>(
      `/clientes/buscar?nombre=${encodeURIComponent(nombre)}`
    );
  },

  // Obtener clientes por localidad
  getByLocalidad: async (localidadId: number): Promise<Cliente[]> => {
    return apiRequest<Cliente[]>(`/clientes/localidad/${localidadId}`);
  },

  // Obtener clientes por representante
  getByRepresentante: async (representanteId: number): Promise<Cliente[]> => {
    return apiRequest<Cliente[]>(`/clientes/representante/${representanteId}`);
  },
};
