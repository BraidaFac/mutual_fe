/**
 * Schemas de validación para el sistema ETL usando Zod
 *
 * Para instalar Zod: npm install zod
 */

import { z } from "zod";

// ============================================
// Schemas base
// ============================================

export const fileTypeSchema = z.enum(["csv", "xlsx"]);



// ============================================
// Schema de transformaciones
// ============================================

export const columnTransformationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("trim") }),
  z.object({ type: z.literal("uppercase") }),
  z.object({ type: z.literal("lowercase") }),
  z.object({
    type: z.literal("replace"),
    search: z.string().min(1, "El texto a buscar es requerido"),
    replace: z.string(),
  }),
  z.object({
    type: z.literal("default"),
    value: z.string().min(1, "El valor por defecto es requerido"),
  }),
  z.object({
    type: z.literal("date_format"),
    format: z.string().min(1, "El formato de fecha es requerido"),
  }),
]);

// ============================================
// Schema de mapeo de columna
// ============================================

export const columnMappingSchema = z.object({
  sourceColumn: z.string().min(0, "La columna origen es requerida"),
  targetProperty: z.string().optional(),
  isRequired: z.boolean().default(false),
  transformation: columnTransformationSchema.optional(),
});

// ============================================
// Schema del template de importación
// ============================================

export const importTemplateFormSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  provinciaId: z
    .number()
    .positive("Selecciona una provincia válida")
    .optional(),
  fileType: fileTypeSchema,
  hasHeaders: z.boolean().default(true),
  dataStartRow: z
    .number()
    .int("Debe ser un número entero")
    .min(0, "La fila de inicio debe ser mayor o igual a 0")
    .default(1),
  columnMappings: z
    .array(columnMappingSchema)
    .min(1, "Debe configurar al menos un mapeo de columna"),
  csvDelimiter: z
    .string()
    .max(1, "El delimitador debe ser un solo carácter")
    .optional(),
  xlsxSheet: z.union([z.number(), z.string()]).optional(),
});

// ============================================
// ============================================

// ============================================
// Schema de ejecución de importación
// ============================================

export const executeImportSchema = z.object({
  templateId: z.number().positive("Debe seleccionar un template"),
  // El archivo se valida por separado
});

// ============================================
// Schema de validación de archivo
// ============================================

export const fileValidationSchema = z.object({
  file: z
    .custom<File>((file) => file instanceof File, "Debe seleccionar un archivo")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB máximo
      "El archivo no debe exceder 10MB"
    ),
  expectedType: fileTypeSchema.optional(),
});

/**
 * Valida que la extensión del archivo coincida con el tipo esperado
 */
export const createFileTypeValidationSchema = (
  expectedType: "csv" | "xlsx"
) => {
  const allowedExtensions =
    expectedType === "csv" ? [".csv", ".txt"] : [".xlsx", ".xls"];

 
  return z
    .custom<File>((file) => file instanceof File, "Debe seleccionar un archivo")
    .refine((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    }, `El archivo debe ser de tipo ${expectedType.toUpperCase()}`)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "El archivo no debe exceder 10MB"
    );
};


// ============================================
// Tipos inferidos de los schemas
// ============================================

export type ImportTemplateFormInput = z.infer<typeof importTemplateFormSchema>;

// ============================================
// Helpers de validación
// ============================================

/**
 * Valida un template y retorna errores formateados para la UI
 */
export function validateTemplateForm(
  data: unknown
):
  | { success: true; data: ImportTemplateFormInput }
  | { success: false; errors: Record<string, string> } {
  const result = importTemplateFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transformar errores de Zod a formato de UI
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });

  return { success: false, errors };
}

/**
 * Valida un archivo y retorna el resultado
 */
export function validateFile(
  file: File | null | undefined,
  expectedType?: 'csv' | 'xlsx'
): { success: true; file: File } | { success: false; error: string } {
  if (!file) {
    return { success: false, error: "Debe seleccionar un archivo" };
  }

  const defaultTypes = ['xlsx'];
  const ext = file.name.split('.').pop();
  if (ext !== expectedType && !defaultTypes.includes(ext??'')) {
    return { success: false, error: `El archivo debe ser de tipo ${expectedType?.toUpperCase() ?? 'CSV o XLSX'}` };
  }
  return { success: true, file: file };
}
