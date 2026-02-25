/**
 * Tipos para el sistema de importación ETL
 * Diseñado para ser extensible a otros tipos de importaciones (no solo clientes)
 */

import { Provincia } from "./common.types";

// ============================================
// Tipos base para propiedades de entidades
// ============================================

/**
 * Propiedad de un modelo obtenida dinámicamente del backend
 */
export interface EntityProperty {
  name: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  options?: { value: string; label: string }[];
}

export interface Entity {
  name: string;
  displayName: string;
  entityProperties: EntityProperty[];
}
// ============================================
// Tipos para Templates de Importación
// ============================================

export type FileType = "csv" | "xlsx";

export enum RelationProperty {
  PROVINCIA = "PROVINCIA",
  FUERZA = "FUERZA",
  REPRESENTANTE = "REPRESENTANTE",
}

/**
 * Configuración de mapeo de una columna
 */
export interface ColumnMapping {
  /** ID único del mapeo (para React keys) */
  id?: number;
  temporalId?: string;
  sourceColumn?: string;
  defaultValue?: string;
  isRequired: boolean;
  template?: ImportTemplate;
  targetProperty?: TargetProperty;
  relationProperty?: RelationProperty;
}

export enum TargetProperty {
  PROVINCIA = "provincia",
  FUERZA = "fuerza",
  REPRESENTANTE = "representante",
  FULL_NAME = "fullName",
  EMAIL = "email",
  TELEFONO = "telefono",
  ESTADO = "estado",
}

/**
 * Template de importación completo
 */
export interface ImportTemplate {
  id: number;
  /** Nombre descriptivo del template */
  nombre: string;
  /** Descripción opcional */
  descripcion?: string;
  /** Entidad destino (ej: 'clientes', 'productos', etc.) */
  entity: Entity;

  /** Provincia u organismo asociado */
  provinciaId?: number;

  provincia?: Provincia;
  /** Tipo de archivo esperado */
  fileType: FileType;

  headerRow: number;
  /** Fila donde empiezan los datos (0-based) */
  dataStartRow: number;
  /** Configuración de mapeos de columnas */
  columnMappings: ColumnMapping[];
  /** Delimitador para CSV (por defecto ',') */
  csvDelimiter?: string;
  /** Hoja de Excel para XLSX (por defecto 0) */
  xlsxSheet?: number | string;
  /** Metadatos */
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

/**
 * Datos para crear/editar un template
 */
export interface ImportTemplateFormData {
  nombre: string;
  descripcion?: string;
  entity: Entity;
  provinciaId?: number;
  fileType: FileType;
  headerRow: number;
  dataStartRow: number;
  columnMappings: ColumnMapping[];
  csvDelimiter?: string;
  xlsxSheet?: number | string;
}

/**
 * Resultado de una ejecución de importación
 */
export interface BulkInsertResult {
  insertedCount: number;
  failedCount: number;
  failures: Array<{
    rowNumber: number;
    error: string;
  }>;
  insertTimeMs: number;
  rowNumber: number;
}

/**
 * Request para ejecutar una importación
 */
export interface ExecuteImportRequest {
  templateId: number;
  file: File;
}

export interface FiltroTemplates {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  provinciaId?: number;
  fileType?: FileType;
}
