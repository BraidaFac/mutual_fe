/**
 * Hook para gestión de templates de importación
 */

import { useErrorHandler } from "@/hooks/useErrorHandler";
import { etlService } from "@/services/etlService";
import {
  Entity,
  FiltroTemplates,
  ImportTemplate,
  ImportTemplateFormData,
  PaginationMeta,
} from "@/types/index";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseImportTemplatesState {
  templates: ImportTemplate[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  entities: Entity[];
}

interface UseImportTemplatesReturn extends UseImportTemplatesState {
  fetchTemplates: (filtros?: FiltroTemplates) => Promise<void>;
  createTemplate: (data: ImportTemplateFormData) => Promise<ImportTemplate>;
  updateTemplate: (
    id: number,
    data: Partial<ImportTemplateFormData>
  ) => Promise<ImportTemplate>;
  deleteTemplate: (id: number) => Promise<void>;
  duplicateTemplate: (id: number, newName: string) => Promise<ImportTemplate>;
  refreshTemplates: () => Promise<void>;
}

export function useImportTemplates(
  initialFiltros?: FiltroTemplates
): UseImportTemplatesReturn {
  const [state, setState] = useState<UseImportTemplatesState>({
    templates: [],
    entities: [],
    loading: false,
    error: null,
    pagination: null,
  });

  // ✅ Usar useRef para evitar recreaciones del useCallback
  const filtrosRef = useRef<FiltroTemplates | undefined>(initialFiltros);
  const { handleError, showSuccess } = useErrorHandler();

  const fetchTemplates = useCallback(
    async (newFiltros?: FiltroTemplates) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // ✅ Usar ref y actualizar si vienen nuevos filtros
      const filtrosToUse = newFiltros ?? filtrosRef.current;
      if (newFiltros) {
        filtrosRef.current = newFiltros;
      }

      try {
        // Si hay paginación, usar endpoint paginado
        if (filtrosToUse?.page || filtrosToUse?.limit) {
          const response = await etlService.getTemplatesPaginated(filtrosToUse);
          setState((prev) => ({
            ...prev,
            templates: response.data,
            pagination: response.meta,
            loading: false,
          }));
        } else {
          // Sin paginación, obtener todos
          const templates = await etlService.getAllTemplates();
          setState((prev) => ({
            ...prev,
            templates,
            pagination: null,
            loading: false,
          }));
        }
      } catch (error) {
        handleError(error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Error al cargar templates",
          loading: false,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ Sin dependencias - usa ref que no cambia
  );

  const createTemplate = useCallback(
    async (data: ImportTemplateFormData): Promise<ImportTemplate> => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const newTemplate = await etlService.createTemplate(data);
        showSuccess("Template creado correctamente");

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          templates: [...prev.templates, newTemplate],
          loading: false,
        }));

        return newTemplate;
      } catch (error) {
        handleError(error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ handleError y showSuccess están memoizados
  );

  const updateTemplate = useCallback(
    async (
      id: number,
      data: Partial<ImportTemplateFormData>
    ): Promise<ImportTemplate> => {
      setState((prev) => ({ ...prev, loading: true }));
      
      try {
        const updatedTemplate = await etlService.updateTemplate(id, data);
        showSuccess("Template actualizado correctamente");

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          templates: prev.templates.map((t) =>
            t.id === id ? updatedTemplate : t
          ),
          loading: false,
        }));

        return updatedTemplate;
      } catch (error) {
        handleError(error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ handleError y showSuccess están memoizados
  );

  const deleteTemplate = useCallback(
    async (id: number): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        await etlService.deleteTemplate(id);
        showSuccess("Template eliminado correctamente");

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          templates: prev.templates.filter((t) => t.id !== id),
          loading: false,
        }));
      } catch (error) {
        handleError(error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ handleError y showSuccess están memoizados
  );

  const duplicateTemplate = useCallback(
    async (id: number, newName: string): Promise<ImportTemplate> => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const duplicated = await etlService.duplicateTemplate(id, newName);
        showSuccess("Template duplicado correctamente");

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          templates: [...prev.templates, duplicated],
          loading: false,
        }));

        return duplicated;
      } catch (error) {
        handleError(error);
        setState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ✅ handleError y showSuccess están memoizados
  );

  const refreshTemplates = useCallback(async () => {
    await fetchTemplates(filtrosRef.current); // ✅ Usar ref en lugar de state
  }, [fetchTemplates]);


  const fetchEntities = useCallback(async () => {
    const data = await etlService.getEntities();
    console.log(data);
    setState((prev) => ({ ...prev, entities: data }));
  }, []);

  // Cargar templates inicialmente (solo una vez)
  useEffect(() => {
    fetchTemplates();
    fetchEntities();
  }, [fetchTemplates, fetchEntities]); // ✅ Solo al montar

  return {
    ...state,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    refreshTemplates,
  };
}
