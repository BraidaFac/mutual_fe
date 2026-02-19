import { DocumentoRequerido } from "@/types/index";
import { apiRequest } from "./api";

export const configuracionService = {
  // Obtener documentos requeridos por fuerza y estado
  getDocumentosRequeridos: async (
    fuerzaId?: number,
    estadoId?: number
  ): Promise<DocumentoRequerido[]> => {
    const queryParams = new URLSearchParams();
    if (fuerzaId) queryParams.append("fuerzaId", fuerzaId.toString());
    if (estadoId) queryParams.append("estadoId", estadoId.toString());

    const query = queryParams.toString();
    return apiRequest<DocumentoRequerido[]>(
      `/configuracion/documentos${query ? `?${query}` : ""}`
    );
  },

  // Crear configuración de documento requerido
  createDocumentoRequerido: async (
    configuracion: Omit<DocumentoRequerido, "documentoRequeridoId">
  ): Promise<DocumentoRequerido> => {
    return apiRequest<DocumentoRequerido>("/configuracion/documentos", {
      method: "POST",
      body: JSON.stringify(configuracion),
    });
  },

  // Actualizar configuración de documento requerido
  updateDocumentoRequerido: async (
    id: number,
    configuracion: Partial<Omit<DocumentoRequerido, "documentoRequeridoId">>
  ): Promise<DocumentoRequerido> => {
    return apiRequest<DocumentoRequerido>(`/configuracion/documentos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(configuracion),
    });
  },

  // Eliminar configuración de documento requerido
  deleteDocumentoRequerido: async (id: number): Promise<void> => {
    return apiRequest<void>(`/configuracion/documentos/${id}`, {
      method: "DELETE",
    });
  },

  // Configurar documentos para una fuerza y estado específicos
  configurarDocumentos: async (
    fuerzaId: number,
    estadoId: number,
    documentos: Array<{ documentoId: string; obligatorio: boolean }>
  ): Promise<void> => {
    return apiRequest<void>("/configuracion/documentos/configurar", {
      method: "POST",
      body: JSON.stringify({ fuerzaId, estadoId, documentos }),
    });
  },

  // Obtener configuración completa para una fuerza
  getConfiguracionFuerza: async (
    fuerzaId: number
  ): Promise<{
    [estadoId: number]: DocumentoRequerido[];
  }> => {
    return apiRequest<{ [estadoId: string]: DocumentoRequerido[] }>(
      `/configuracion/fuerza/${fuerzaId}`
    );
  },
};
