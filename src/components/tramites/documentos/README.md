# Componente Modular de Documentos para Trámites

Este módulo proporciona un sistema completo para la gestión de documentos en trámites, incluyendo carga, visualización y validación de archivos basados en los documentos requeridos del flujo del trámite.

## Componentes

### TramiteDocumentosManager

Componente principal que orquesta toda la funcionalidad de documentos.

```tsx
import { TramiteDocumentosManager } from "@/components/tramites/documentos";

<TramiteDocumentosManager
  flujo={flujoTramite}
  cliente={cliente}
  documentosCargados={documentos}
  onDocumentosChange={setDocumentos}
  readonly={false}
/>;
```

### DocumentoRequeridoItem

Componente individual para cada documento requerido, con funcionalidad de carga y validación.

### FileViewer

Visor de archivos con soporte para:

- PDFs (iframe)
- Imágenes (con zoom y rotación)
- Documentos de Word (descarga)

## Características

### Gestión Inteligente de Documentos

- Muestra solo los documentos requeridos según el flujo del trámite
- Filtra documentos según el estado del cliente (socio/no socio)
- Validación de tipos de archivo y tamaños

### Tipos de Archivo Soportados

- PDF (hasta 10MB)
- Imágenes: JPG, PNG, JPEG
- Documentos: DOC, DOCX

### Funcionalidades del Visor

- Vista previa de PDFs en iframe
- Zoom y rotación para imágenes
- Descarga de archivos
- Información detallada del archivo

### Validaciones

- Tipo de archivo permitido
- Tamaño máximo (10MB)
- Documentos obligatorios vs opcionales
- Estado del cliente (socio/no socio)

## Hook useDocumentosManager

Proporciona lógica de estado avanzada:

```tsx
import { useDocumentosManager } from "@/hooks/useDocumentosManager";

const {
  documentos,
  documentosRequeridosVisibles,
  estadisticas,
  validacion,
  actions,
} = useDocumentosManager({
  flujo,
  cliente,
  documentosIniciales,
});
```

### Estadísticas

- Total de documentos requeridos
- Documentos cargados vs pendientes
- Documentos obligatorios pendientes
- Porcentaje de completado

### Validación

- Verifica documentos obligatorios
- Valida archivos cargados
- Proporciona lista de errores

## Hook useFlujoSelection

Maneja la selección automática de flujos:

```tsx
import { useFlujoSelection } from "@/hooks/useFlujoSelection";

const { flujo, flujosDisponibles, loading, error, actions } = useFlujoSelection(
  {
    cliente,
    tipoPrestamo,
  }
);
```

## Integración con Formularios

El componente se integra perfectamente con el formulario de trámites:

```tsx
// En TramiteFormStepDocumentos.tsx
<TramiteDocumentosManager
  flujo={formData.flujo}
  cliente={formData.cliente}
  documentosCargados={formData.documentos}
  onDocumentosChange={(docs) => updateFormData("documentos", docs)}
/>
```

## Tipos de Datos

### DocumentoCargado

```typescript
interface DocumentoCargado {
  id: string;
  documentoRequeridoId: number;
  file: File;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaCarga: Date;
  preview?: string; // Para imágenes
}
```

### DocumentoRequerido (del flujo)

```typescript
interface DocumentoRequerido {
  id: number;
  flujo: FlujoTramite;
  documento: Documento;
  obligatorio: boolean;
  noNecesarioSiEsSocio: boolean;
}
```

## Estados y Feedback Visual

- **Documentos obligatorios**: Borde naranja, chip "Obligatorio"
- **Documentos cargados**: Borde verde, chip "Cargado"
- **Documentos opcionales**: Borde gris, chip "Opcional"
- **Loading states**: Spinners y progress bars
- **Error states**: Alertas descriptivas

## Personalización

### Colores y Estilos

Los componentes utilizan el tema de Material-UI y pueden personalizarse a través de:

- `sx` props
- Theme overrides
- CSS custom properties

### Validaciones Personalizadas

Las validaciones pueden extenderse modificando:

- `tiposPermitidos` array
- `maxFileSize` constant
- Lógica de validación en hooks

## Accesibilidad

- Navegación por teclado completa
- ARIA labels apropiados
- Contraste de colores conforme WCAG
- Screen reader friendly

## Performance

- Lazy loading de previews
- Cleanup automático de URLs de objeto
- Memoización de cálculos costosos
- Optimización de re-renders
