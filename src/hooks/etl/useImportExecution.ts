/**
 * Hook para gestión de ejecución de importaciones ETL
 * Maneja el flujo de selección de template, carga de archivo y ejecución
 */

import { useErrorHandler } from "@/hooks/useErrorHandler";
import { validateFile } from "@/schemas/etl.schemas";
import { etlService } from "@/services/etlService";
import { BulkInsertResult, ImportTemplate } from "@/types/etl.types";
import { useCallback, useEffect, useState } from "react";

interface UseImportExecutionState {
  // Template
  selectedTemplate: ImportTemplate | null;
  templates: ImportTemplate[];
  loadingTemplates: boolean;

  // Archivo
  selectedFile: File | null;
  fileError: string | null;

  // Ejecución
  executing: boolean;

  // Historial
  loadingHistory: boolean;
}

interface UseImportExecutionReturn extends UseImportExecutionState {
  // Selección de template
  selectTemplate: (template: ImportTemplate | null) => void;
  loadTemplates: () => Promise<void>;

  // Manejo de archivo
  setFile: (file: File | null) => void;
  validateSelectedFile: () => { success: true; file: File } | { success: false; error: string };
  clearFile: () => void;

  // Ejecución
  executeImport: () => Promise<{ success: true; data: BulkInsertResult } | { success: false; error: string }>;

  // Estado
  canExecute: boolean;
}

export function useImportExecution(): UseImportExecutionReturn {
  const [state, setState] = useState<UseImportExecutionState>({
    selectedTemplate: null,
    templates: [],
    loadingTemplates: false,
    selectedFile: null,
    fileError: null,
    executing: false,
    loadingHistory: false,
  });

  const { handleError, showSuccess } = useErrorHandler();


  // ============================================
  // Carga de templates
  // ============================================

  const loadTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, loadingTemplates: true }));

    try {
      const templates = await etlService.getAllTemplates();
      setState((prev) => ({ ...prev, templates, loadingTemplates: false }));
    } catch (error) {
      handleError(error);
      setState((prev) => ({ ...prev, loadingTemplates: false }));
    }
  }, [handleError]);

  // Cargar templates al montar
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // ============================================
  // Selección de template
  // ============================================

  const selectTemplate = useCallback((template: ImportTemplate | null) => {
    setState((prev) => ({
      ...prev,
      selectedTemplate: template,
      // Limpiar archivo al cambiar template
      selectedFile: null,
      fileError: null,
      fileValidation: null,
      currentExecution: null,
      executionStatus: null,
    }));
  }, []);

  // ============================================
  // Manejo de archivo
  // ============================================

  const setFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setState((prev) => ({
          ...prev,
          selectedFile: null,
          fileError: null,
          fileValidation: null,
        }));
        return;
      }
      // Validar tipo de archivo si hay template seleccionado
      const expectedType = state.selectedTemplate?.fileType;
      const validation = validateFile(file, expectedType as 'csv' | 'xlsx');

      if (!validation.success) {
        setState((prev) => ({
          ...prev,
          selectedFile: null,
          fileError: validation.error,
          fileValidation: null,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        selectedFile: file,
        fileError: null,
        fileValidation: null,
      }));
    },
    [state.selectedTemplate]
  );

  const validateSelectedFile = useCallback(() : { success: true; file: File } | { success: false; error: string } => {
    if (!state.selectedFile || !state.selectedTemplate) {
      setState((prev) => ({
        ...prev,
        fileError: "Selecciona un template y un archivo",
      }));
      return { success: false, error: "Selecciona un template y un archivo" };
    }
    setState((prev) => ({ ...prev, validatingFile: true, fileError: null }));

    const validation = validateFile(state.selectedFile, state.selectedTemplate.fileType);

    return validation;
  }, [state.selectedFile, state.selectedTemplate]);

  const clearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFile: null,
      fileError: null,
      fileValidation: null,
    }));
  }, []);



  const executeImport =
    useCallback(async (): Promise<{ success: true; data: BulkInsertResult } | { success: false; error: string }> => {
      if (!state.selectedTemplate || !state.selectedFile) {
        setState((prev) => ({
          ...prev,
          fileError: "Selecciona un template y un archivo",
        }));
        return { success: false, error: "Selecciona un template y un archivo" };
      }

      setState((prev) => ({ ...prev, executing: true }));

      try {
        const execution = await etlService.executeImport({
          templateId: state.selectedTemplate.id,
          file: state.selectedFile,
        });

        setState((prev) => ({
          ...prev,
          currentExecution: execution,
          executing: false,
        }));

        showSuccess("Importación completada exitosamente");

        return { success: true, data: execution };
      } catch (error) {
        handleError(error);
        setState((prev) => ({ ...prev, executing: false }));
        return { success: false, error: "Error al ejecutar la importación" };
      }
    }, [
      state.selectedTemplate,
      state.selectedFile,
      handleError,
      showSuccess,
    ]);

  

  // ============================================
  // Utilidades
  // ============================================

  const canExecute = Boolean(
    state.selectedTemplate &&
      state.selectedFile &&
      !state.fileError &&
      !state.executing
  );



  return {
    ...state,
    selectTemplate,
    loadTemplates,
    setFile,
    validateSelectedFile,
    clearFile,
    executeImport,
    canExecute,
  };
}
