/**
 * Hook para gestión del formulario de template de importación
 * Maneja el estado del formulario, validaciones y mapeos de columnas
 */

import { validateTemplateForm } from "@/schemas/etl.schemas";
import {
  ColumnMapping,
  Entity,
  FileType,
  ImportTemplate,
  ImportTemplateFormData,
} from "@/types/index";
import { useCallback, useState } from "react";

// ID único para mapeos
const generateMappingId = () =>
  `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface UseTemplateFormState {
  formData: ImportTemplateFormData;
  errors: Record<string, string>;
  loading: boolean;
  isDirty: boolean;
}

interface UseTemplateFormReturn extends UseTemplateFormState {
  // Setters para campos individuales
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setEntity: (name: string) => void;
  setProvinciaId: (provinciaId: number | undefined) => void;
  setFileType: (fileType: FileType) => void;
  setHeaderRow: (row: number) => void;
  setDataStartRow: (row: number) => void;
  setCsvDelimiter: (delimiter: string) => void;
  setXlsxSheet: (sheet: number | string) => void;

  // Gestión de mapeos
  addMapping: () => void;
  updateMapping: (id: string, updates: Partial<ColumnMapping>) => void;
  removeMapping: (id: string) => void;
  clearMappings: () => void;

  // Validaciones
  validate: () => boolean;
  getFieldError: (field: string) => string | undefined;
  clearErrors: () => void;

  // Utilidades
  resetForm: () => void;
  loadTemplate: (template: ImportTemplate) => void;
}

const getInitialFormData = (): ImportTemplateFormData => ({
  nombre: "",
  descripcion: "",
  entity: { name: "", displayName: "", entityProperties: [] },
  provinciaId: undefined,
  headerRow: 1,
  fileType: "xlsx",
  dataStartRow: 1,
  columnMappings: [],
  csvDelimiter: ",",
  xlsxSheet: 0,
});

export function useTemplateForm(
  entities: Entity[],
  initialTemplate?: ImportTemplate,
): UseTemplateFormReturn {
  const [state, setState] = useState<UseTemplateFormState>({
    formData: initialTemplate
      ? templateToFormData(initialTemplate)
      : getInitialFormData(),
    errors: {},
    loading: false,
    isDirty: false,
  });

  // ============================================
  // Setters para campos individualesw
  // ============================================

  const updateFormData = useCallback(
    <K extends keyof ImportTemplateFormData>(
      key: K,
      value: ImportTemplateFormData[K],
    ) => {
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, [key]: value },
        isDirty: true,
        // Limpiar error del campo al modificarlo
        errors: { ...prev.errors, [key]: "" },
      }));
    },
    [],
  );

  const setName = useCallback(
    (name: string) => updateFormData("nombre", name),
    [updateFormData],
  );
  const setDescription = useCallback(
    (desc: string) => updateFormData("descripcion", desc),
    [updateFormData],
  );
  const setProvinciaId = useCallback(
    (id: number | undefined) => updateFormData("provinciaId", id),
    [updateFormData],
  );
  const setFileType = useCallback(
    (type: FileType) => updateFormData("fileType", type),
    [updateFormData],
  );
  const setHeaderRow = useCallback(
    (row: number) => updateFormData("headerRow", row),
    [updateFormData],
  );
  const setDataStartRow = useCallback(
    (row: number) => updateFormData("dataStartRow", row),
    [updateFormData],
  );
  const setCsvDelimiter = useCallback(
    (delim: string) => updateFormData("csvDelimiter", delim),
    [updateFormData],
  );
  const setXlsxSheet = useCallback(
    (sheet: number | string) => updateFormData("xlsxSheet", sheet),
    [updateFormData],
  );

  const setEntity = useCallback(
    (name: string) => {
      // Limpiar mapeos al cambiar tipo de entidad
      console.log(entities);
      console.log(name);
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          entity: entities.find((e) => e.name === name)!,
        },
        isDirty: true,
      }));
    },
    [entities],
  );

  // ============================================
  // Gestión de mapeos de columnas
  // ============================================

  const addMapping = useCallback(() => {
    const newMapping: ColumnMapping = {
      id: undefined,
      temporalId: generateMappingId(),
      sourceColumn: "Header de Columna",
      targetProperty: undefined,
      isRequired: false,
    };

    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        columnMappings: [...prev.formData.columnMappings, newMapping],
      },
      isDirty: true,
    }));
  }, []);

  const updateMapping = useCallback(
    (id: string, updates: Partial<ColumnMapping>) => {
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          columnMappings: prev.formData.columnMappings.map((m) =>
            m.temporalId == id || m.id?.toString() == id
              ? { ...m, ...updates }
              : m,
          ),
        },
        isDirty: true,
        // Limpiar errores de mapeos
        errors: { ...prev.errors, columnMappings: "" },
      }));
    },
    [],
  );

  const removeMapping = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        columnMappings: prev.formData.columnMappings.filter(
          (m) => m.temporalId !== id && m.id?.toString() !== id,
        ),
      },
      isDirty: true,
    }));
  }, []);

  const clearMappings = useCallback(() => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, columnMappings: [] },
      isDirty: true,
    }));
  }, []);

  // ============================================
  // Validaciones
  // ============================================

  const validate = useCallback((): boolean => {
    const result = validateTemplateForm(state.formData);
    console.log(result);
    if (result.success) {
      setState((prev) => ({ ...prev, errors: {} }));
      return true;
    }
    return false;
  }, [state.formData]);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return state.errors[field];
    },
    [state.errors],
  );

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: {} }));
  }, []);

  // ============================================
  // Utilidades
  // ============================================

  const resetForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      formData: getInitialFormData(),
      errors: {},
      isDirty: false,
    }));
  }, []);

  const loadTemplate = useCallback((template: ImportTemplate) => {
    setState((prev) => ({
      ...prev,
      formData: templateToFormData(template),
      errors: {},
      isDirty: false,
    }));
  }, []);

  return {
    ...state,
    setName,
    setDescription,
    setEntity,
    setProvinciaId,
    setFileType,
    setHeaderRow,
    setDataStartRow,
    setCsvDelimiter,
    setXlsxSheet,
    addMapping,
    updateMapping,
    removeMapping,
    clearMappings,
    validate,
    getFieldError,
    clearErrors,
    resetForm,
    loadTemplate,
  };
}

// Helper para convertir template a form data
function templateToFormData(template: ImportTemplate): ImportTemplateFormData {
  return {
    nombre: template.nombre,
    descripcion: template.descripcion,
    entity: template.entity,
    provinciaId: template.provincia?.id,
    fileType: template.fileType,
    headerRow: template.headerRow,
    dataStartRow: template.dataStartRow,
    columnMappings: template.columnMappings,
    csvDelimiter: template.csvDelimiter,
    xlsxSheet: template.xlsxSheet,
  };
}
