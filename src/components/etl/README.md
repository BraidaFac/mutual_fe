# Sistema de Importación ETL

Este módulo implementa un sistema completo de importación ETL (Extract, Transform, Load) para el CRM, permitiendo importar datos desde archivos CSV y Excel con configuración dinámica de mapeos.

## Arquitectura

```
src/
├── app/importacion/             # Páginas del módulo
│   ├── page.tsx                 # Página principal de importación
│   ├── layout.tsx               # Layout con tabs de navegación
│   └── templates/
│       └── page.tsx             # Página de gestión de templates
│
├── components/etl/              # Componentes del módulo
│   ├── templates/               # Configuración de templates
│   │   ├── ColumnMappingRow.tsx      # Fila individual de mapeo
│   │   ├── ColumnMappingsEditor.tsx  # Editor de mapeos completo
│   │   ├── TemplateDetailDialog.tsx  # Vista detalle de template
│   │   ├── TemplateFormDialog.tsx    # Formulario de template (wizard)
│   │   ├── TemplatesList.tsx         # Lista de templates
│   │   └── TemplatesContent.tsx      # Contenido de la página
│   │
│   └── import/                  # Ejecución de importaciones
│       ├── FileUploader.tsx          # Componente de carga de archivos
│       ├── ImportContent.tsx         # Contenido principal
│       ├── ImportHistoryTable.tsx    # Historial de importaciones
│       ├── ImportResultPanel.tsx     # Panel de resultados
│       └── TemplateSelector.tsx      # Selector de templates
│
├── hooks/etl/                   # Hooks personalizados
│   ├── useImportTemplates.ts    # Gestión de templates (CRUD)
│   ├── useTemplateForm.ts       # Estado del formulario de template
│   └── useImportExecution.ts    # Ejecución y estado de importaciones
│
├── services/
│   └── etlService.ts            # Servicio de API para ETL
│
├── schemas/
│   └── etl.schemas.ts           # Schemas de validación con Zod
│
└── types/
    └── etl.types.ts             # Tipos TypeScript
```

## Flujos Principales

### 1. Configuración de Templates

1. **Crear Template**:

   - Wizard de 3 pasos (info básica → configuración archivo → mapeo columnas)
   - Validación en cada paso
   - Soporte para CSV y Excel

2. **Mapeo de Columnas**:

   - Origen: índice numérico o nombre de header
   - Destino: propiedades obtenidas dinámicamente del backend
   - Validación de propiedades requeridas
   - Prevención de mapeos duplicados

3. **Gestión**:
   - Listar, editar, eliminar, duplicar templates
   - Filtros por tipo de entidad, formato, provincia

### 2. Ejecución de Importación

1. **Seleccionar Template**: Autocomplete con info del template
2. **Cargar Archivo**: Drag & drop, validación de tipo y tamaño
3. **Ejecutar**:
   - Validación previa opcional
   - Feedback en tiempo real con polling
   - Estadísticas detalladas
   - Manejo de errores parciales

## Instalación de Dependencias

```bash
npm install zod
```

## Tipos Principales

### ImportTemplate

```typescript
interface ImportTemplate {
  id: number;
  name: string;
  description?: string;
  entityType: EntityType; // 'clientes' | 'productos' | 'tramites'
  provinciaId?: number;
  fileType: FileType; // 'csv' | 'xlsx'
  hasHeaders: boolean;
  dataStartRow: number;
  columnMappings: ColumnMapping[];
  csvDelimiter?: string;
  xlsxSheet?: number | string;
  createdAt: Date;
  updatedAt?: Date;
}
```

### ColumnMapping

```typescript
interface ColumnMapping {
  id: string;
  sourceColumn: string; // Índice o nombre de columna
  sourceType: "index" ;
  targetProperty: string; // Propiedad del modelo destino
  transformation?: ColumnTransformation;
}
```

### ImportExecution

```typescript
interface ImportExecution {
  id: number;
  templateId: number;
  templateName: string;
  fileName: string;
  status: ImportStatus;
  stats: ImportStats;
  errorDetails?: ImportRecordResult[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}
```

## Endpoints de API Esperados

El servicio espera los siguientes endpoints en el backend:

### Templates

- `GET /api/etl/templates` - Listar templates (paginado)
- `GET /api/etl/templates/all` - Listar todos los templates
- `GET /api/etl/templates/:id` - Obtener template por ID
- `POST /api/etl/templates` - Crear template
- `PATCH /api/etl/templates/:id` - Actualizar template
- `DELETE /api/etl/templates/:id` - Eliminar template
- `POST /api/etl/templates/:id/duplicate` - Duplicar template

### Entidades

- `GET /api/etl/entities` - Listar tipos de entidades disponibles
- `GET /api/etl/entities/:type/properties` - Obtener propiedades de una entidad

### Importación

- `POST /api/etl/validate` - Validar archivo (FormData)
- `POST /api/etl/preview` - Preview de archivo (FormData)
- `POST /api/etl/import` - Ejecutar importación (FormData)
- `GET /api/etl/imports` - Historial de importaciones
- `GET /api/etl/imports/:id` - Detalle de importación
- `GET /api/etl/imports/:id/status` - Estado de importación en progreso
- `POST /api/etl/imports/:id/cancel` - Cancelar importación
- `POST /api/etl/imports/:id/retry` - Reintentar registros fallidos
- `GET /api/etl/imports/:id/errors/download` - Descargar reporte de errores

## Uso

### Página de Importación

Accesible desde `/importacion`. Permite:

- Seleccionar un template configurado
- Cargar un archivo CSV/XLSX
- Validar el archivo antes de importar
- Ejecutar la importación con feedback en tiempo real
- Ver historial de importaciones anteriores

### Página de Templates

Accesible desde `/importacion/templates`. Permite:

- Ver lista de templates existentes
- Crear nuevos templates con wizard guiado
- Editar templates existentes
- Duplicar templates para crear variantes
- Eliminar templates no utilizados

## Extensibilidad

El sistema está diseñado para ser extensible:

1. **Nuevos tipos de entidad**: Agregar al enum `EntityType` y configurar en el backend
2. **Nuevas transformaciones**: Agregar al tipo `ColumnTransformation`
3. **Validaciones personalizadas**: Extender los schemas de Zod

## Buenas Prácticas Implementadas

- **Modularidad**: Componentes pequeños y reutilizables
- **Separación de responsabilidades**: Hooks, servicios, componentes separados
- **Validación robusta**: Schemas Zod con mensajes en español
- **UX**: Feedback visual inmediato, wizard guiado, drag & drop
- **Manejo de errores**: Errores parciales sin romper la UI
- **Polling optimizado**: Para importaciones largas
- **No hardcoding**: Propiedades obtenidas dinámicamente del backend
