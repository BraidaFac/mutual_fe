import {
  DocumentoRequerido,
  FlujoDto,
  FlujoTramite,
  PasoTramite,
  TipoPrestamo,
} from "@/types/index";
import { apiRequest } from "./api";

export const flujosService = {
  // Obtener todos los flujos
  getAll: async (): Promise<FlujoTramite[]> => {
    return apiRequest<FlujoTramite[]>("/flujos");
  },

  // Obtener flujo por ID
  getById: async (id: number): Promise<FlujoTramite> => {
    return apiRequest<FlujoTramite>(`/flujos/${id}`);
  },

  // Obtener flujos por fuerza
  getByFuerza: async (
    fuerzaId: number,
    tipoPrestamo?: TipoPrestamo
  ): Promise<FlujoTramite> => {
    const queryParams = new URLSearchParams();
    if (tipoPrestamo) {
      queryParams.append("tipoPrestamo", tipoPrestamo);
    }
    const query = queryParams.toString();
    return apiRequest<FlujoTramite>(
      `/flujos/by-fuerza/${fuerzaId}${query ? `?${query}` : ""}`
    );
  },

  // Crear nuevo flujo
  create: async (flujo: Partial<FlujoDto>): Promise<FlujoTramite> => {
    return apiRequest<FlujoTramite>("/flujos", {
      method: "POST",
      body: JSON.stringify(flujo),
    });
  },

  // Actualizar flujo
  update: async (
    id: number,
    flujo: Partial<FlujoDto>
  ): Promise<FlujoTramite> => {
    return apiRequest<FlujoTramite>(`/flujos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(flujo),
    });
  },

  // Eliminar flujo
  delete: async (id: number): Promise<FlujoTramite> => {
    return apiRequest<FlujoTramite>(`/flujos/${id}`, {
      method: "DELETE",
    });
  },

  // Obtener pasos de un flujo
  getPasos: async (flujoId: number): Promise<PasoTramite[]> => {
    return apiRequest<PasoTramite[]>(`/flujos/${flujoId}/pasos`);
  },

  // Crear nuevo paso
  /*   createPaso: async (paso: {
    nombre: string;
    descripcion?: string;
    flujoId: number;
    secuencia: number;
    diasMaximoSinAvance?: number;
    requiereIntervencionManual?: boolean;
    color: string;
    activo?: boolean;
  }): Promise<PasoTramite> => {
    return apiRequest<PasoTramite>("/flujos/pasos", {
      method: "POST",
      body: JSON.stringify(paso),
    });
  },
 */
  // Obtener documentos requeridos de un flujo
  getDocumentos: async (flujoId: number): Promise<DocumentoRequerido[]> => {
    return apiRequest<DocumentoRequerido[]>(`/flujos/${flujoId}/documentos`);
  },

  // Agregar documento requerido a un flujo
  addDocumento: async (
    flujoId: number,
    documentoId: number,
    obligatorio = true,
    noNecesarioSiEsSocio = false
  ): Promise<DocumentoRequerido> => {
    return apiRequest<DocumentoRequerido>(
      `/flujos/${flujoId}/documentos/${documentoId}`,
      {
        method: "POST",
        body: JSON.stringify({ obligatorio, noNecesarioSiEsSocio }),
      }
    );
  },
};
