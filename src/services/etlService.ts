/**
 * Servicio para gestión de importaciones ETL
 * Siguiendo el patrón de servicios existentes del proyecto
 */

import {
  BulkInsertResult,
  Entity,
  EntityProperty,
  ExecuteImportRequest,
  FiltroTemplates,
  ImportTemplate,
  ImportTemplateFormData,
  PaginatedResponse
} from "@/types/index";
import { apiRequest } from "./api";

const BASE_PATH = "/etl";

export const etlService = {
  // ============================================
  // Templates de Importación
  // ============================================

  /**
   * Obtener todos los templates (sin paginación)
   */
  getAllTemplates: async (
  ): Promise<ImportTemplate[]> => {
    return apiRequest<ImportTemplate[]>(
      `${BASE_PATH}/templates`
    );
  },

  /**
   * Obtener templates paginados
   */
  getTemplatesPaginated: async (
    filtros?: FiltroTemplates
  ): Promise<PaginatedResponse<ImportTemplate>> => {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.entityType)
      queryParams.append("entityType", filtros.entityType);
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fileType) queryParams.append("fileType", filtros.fileType);
    if (filtros?.page) queryParams.append("page", filtros.page.toString());
    if (filtros?.limit) queryParams.append("limit", filtros.limit.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<ImportTemplate>>(
      `${BASE_PATH}/templates${query ? `?${query}` : ""}`
    );
  },

  /**
   * Obtener template por ID
   */
  getTemplateById: async (id: number): Promise<ImportTemplate> => {
    return apiRequest<ImportTemplate>(`${BASE_PATH}/templates/${id}`);
  },

  /**
   * Crear nuevo template
   */
  createTemplate: async (
    template: ImportTemplateFormData
  ): Promise<ImportTemplate> => {
    return apiRequest<ImportTemplate>(`${BASE_PATH}/templates`, {
      method: "POST",
      body: JSON.stringify(template),
    });
  },

  /**
   * Actualizar template existente
   */
  updateTemplate: async (
    id: number,
    template: Partial<ImportTemplateFormData>
  ): Promise<ImportTemplate> => {
    return apiRequest<ImportTemplate>(`${BASE_PATH}/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(template),
    });
  },

  /**
   * Eliminar template
   */
  deleteTemplate: async (id: number): Promise<void> => {
    return apiRequest<void>(`${BASE_PATH}/templates/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Duplicar un template existente
   */
  duplicateTemplate: async (
    id: number,
    newName: string
  ): Promise<ImportTemplate> => {
    return apiRequest<ImportTemplate>(
      `${BASE_PATH}/templates/${id}/duplicate`,
      {
        method: "POST",
        body: JSON.stringify({ name: newName }),
      }
    );
  },

  // ============================================
  // Propiedades de Entidades
  // ============================================

  /**
   * Obtener propiedades válidas para una entidad
   * Esto se obtiene dinámicamente del backend
   */
   getEntityProperties: async (
    entityType: string
  ): Promise<EntityProperty[]> => {
    return apiRequest<EntityProperty[]>(
      `${BASE_PATH}/entities/${entityType}/properties`
    );
  }, 

  /**
   * Obtener tipos de entidades disponibles para importación
   */
  getEntities: async (): Promise<
    Entity[]
  > => {
    return apiRequest<Entity[]>(
      `${BASE_PATH}/entities`
    );
  },



  executeImport: async ({
    templateId,
    file,
  }: ExecuteImportRequest): Promise<BulkInsertResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("templateId", templateId.toString());

    return apiRequest<BulkInsertResult>(`${BASE_PATH}/import`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Obtener historial de importaciones
   */
  getImportHistory: async (
  ): Promise<PaginatedResponse<BulkInsertResult>> => {
    const queryParams = new URLSearchParams();

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<BulkInsertResult>>(
      `${BASE_PATH}/imports${query ? `?${query}` : ""}`
    );
  },

  /**
   * Obtener detalle de una importación
   */
  getImportById: async (id: number): Promise<BulkInsertResult> => {
    return apiRequest<BulkInsertResult>(`${BASE_PATH}/imports/${id}`);
  },


  /**
   * Cancelar una importación en progreso
   */
  cancelImport: async (id: number): Promise<void> => {
    return apiRequest<void>(`${BASE_PATH}/imports/${id}/cancel`, {
      method: "POST",
    });
  },


};
