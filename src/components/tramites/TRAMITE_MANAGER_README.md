# TramiteManager - Documentación

## Descripción

`TramiteManager` es el nuevo componente principal para gestionar trámites ya creados. Reemplaza completamente a `TramiteDetailDialog` con una interfaz más completa y funcional.

## Características Implementadas ✅

### 1. Encabezado Completo

- **ID del trámite**
- **Nombre del cliente**
- **Tipo de préstamo** (label amigable)
- **Nombre del flujo**
- **Monto solicitado**
- **Fecha de último contacto**
- **Botones de acción**: Refrescar y Cerrar

### 2. Stepper Horizontal

- Muestra todos los pasos del flujo ordenados por secuencia
- Resalta el paso actual con:
  - Color personalizado del paso
  - Badge "Actual"
  - Tooltip con descripción
- Estados visuales: completado, actual, pendiente

### 3. Sistema de Tabs

#### Tab 1: Documentos

- **Tabla completa** con las siguientes columnas:

  - Nombre del documento
  - Estado (Pendiente/Recibido/Rechazado/Aceptado) - editable con dropdown
  - Fecha de subida
  - Nombre del archivo
  - Campo de observaciones editable
  - Acciones: Subir archivo, Ver archivo

- **Alertas de documentos faltantes**:

  - Compara documentos requeridos por el flujo vs documentos cargados
  - Muestra badge en el tab con cantidad de documentos faltantes
  - Alert destacado listando documentos faltantes

- **Funcionalidades**:
  - Cambiar estado de documento (actualiza en BD)
  - Agregar observaciones a cada documento
  - Subir archivos (pendiente implementar UI)
  - Ver archivos (pendiente implementar visor)

#### Tab 2: Historial

- **Timeline visual** con todos los pasos del trámite
- Muestra para cada paso:
  - Fecha de inicio
  - Fecha de fin (si existe)
  - Nombre del paso
  - Usuario responsable
  - Observaciones
- Indicadores visuales: paso actual vs pasos completados

#### Tab 3: Observaciones

- **Campo de texto multilínea** editable
- Botón "Guardar Observaciones"
- Se deshabilita el botón si no hay cambios
- Actualiza el trámite en la BD al guardar

### 4. Panel de Acciones Contextual (Lateral Derecho)

#### Flujo de Trámite

- **Botón "Avanzar Trámite"**:

  - Modal con selector de transiciones disponibles
  - Muestra descripción de cada transición
  - Badge para transiciones automáticas
  - Campo de observaciones
  - Validado con transiciones disponibles del hook
  - Se deshabilita si no hay transiciones disponibles

- **Botón "Retroceder Trámite"**:
  - Modal de confirmación con campo de motivo obligatorio
  - Alert de advertencia
  - Validación de motivo antes de permitir retroceso

#### Comunicación

- **Botón "Registrar Contacto"**:

  - Modal con:
    - Selector de tipo (WhatsApp, Teléfono, Email, Presencial)
    - Fecha automática
    - Campo de nota/observación
  - Actualiza `fechaUltimoContacto` en el trámite

- **Botones de acceso rápido**:
  - WhatsApp (abre chat con número del cliente)
  - Llamar (inicia llamada telefónica)
  - Email (abre cliente de correo)
  - Solo se muestran si el cliente tiene los datos correspondientes

#### Acciones Críticas

- **Botón "Cancelar Trámite"**:
  - Diseñado con color de advertencia
  - Pendiente implementar lógica de cancelación

#### Información Adicional (Footer del Panel)

- Chip con paso actual y su color
- Días máximos sin avance (si está configurado)

## Validaciones Implementadas

### Validación de Documentos

- ✅ Detección de documentos faltantes
- ✅ Comparación con `flujo.documentosRequeridos`
- ✅ Validación de estados (Pendiente/Recibido/Rechazado/Aceptado)
- ⚠️ Validación de tipo de archivo (pendiente)
- ⚠️ Validación de tamaño (10MB límite - pendiente)

### Validación de Transiciones

- ✅ Usa el hook `useTramiteManagement` para calcular transiciones disponibles
- ✅ Valida `canAdvance` y `canGoBack`
- ✅ Filtra transiciones activas
- ✅ Distingue transiciones automáticas vs manuales
- ⚠️ Validación de condiciones de documentos (pendiente backend)

### Validación de Pasos

- ✅ No permite avanzar si no hay transiciones disponibles
- ✅ Solicita motivo obligatorio para retroceder
- ✅ Valida que exista paso destino

## Pendientes / TODOs

### Funcionalidades Backend Requeridas

1. **Endpoint de Retroceso de Trámite**

   ```typescript
   POST /api/tramites/:id/retroceder
   Body: { motivo: string }
   ```

2. **Endpoint de Cancelación de Trámite**

   ```typescript
   POST /api/tramites/:id/cancelar
   Body: { motivo: string }
   ```

3. **Endpoint para Observaciones de Documentos**

   ```typescript
   PUT /api/tramites/:tramiteId/documentos/:docId/observaciones
   Body: { observaciones: string }
   ```

4. **Endpoint para Subir Archivos**

   ```typescript
   POST /api/tramites/:tramiteId/documentos/:docId/upload
   Body: FormData with file
   ```

5. **Endpoint para Descargar/Ver Archivos**

   ```typescript
   GET /api/tramites/:tramiteId/documentos/:docId/file
   Returns: File stream or URL
   ```

6. **Endpoint para Guardar Detalles de Contacto**

   ```typescript
   POST /api/tramites/:tramiteId/contactos
   Body: { tipo: string, fecha: Date, nota: string }
   ```

7. **Validación de Condiciones de Documentos en Transiciones**
   - Backend debe validar `condicionDocumentos` en `ReglaTransicion`
   - Debe retornar error si faltan documentos obligatorios

### Funcionalidades Frontend a Completar

1. **Visor de Archivos**

   - Crear componente o modal para visualizar PDFs, imágenes, etc.
   - Integrar con librería de visualización (react-pdf, etc.)

2. **Subida de Archivos**

   - Implementar input file y drag & drop
   - Validar tipo y tamaño de archivo
   - Mostrar preview de imágenes
   - Progress bar de subida

3. **Validación de Tipos de Archivo**

   ```typescript
   const TIPOS_PERMITIDOS = {
     pdf: "application/pdf",
     jpg: "image/jpeg",
     png: "image/png",
     // etc
   };
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   ```

4. **Modo Offline**

   - Detectar estado de conexión
   - Mostrar banner cuando esté offline
   - Almacenar cambios pendientes en localStorage
   - Sincronizar cuando vuelva la conexión

5. **Autenticación de Usuario**

   - Integrar con `AuthContext` para obtener usuario actual
   - Usar en `usuarioResponsable` al avanzar pasos

6. **Notificaciones/Toast**

   - Mostrar mensajes de éxito al guardar
   - Mostrar errores de manera más elegante
   - Usar snackbar de Material-UI

7. **Exportar/Imprimir**
   - Botón para exportar historial a PDF
   - Vista de impresión optimizada

## Estructura de Componentes

```
TramiteManager (Dialog Principal)
├── Header (DialogTitle)
│   ├── Información del trámite
│   └── Botones de acción (Refresh, Close)
├── Content (DialogContent)
│   ├── Stepper Horizontal (Pasos del flujo)
│   ├── Tabs
│   │   ├── Tab Documentos
│   │   │   ├── Alert de documentos faltantes
│   │   │   └── Tabla de documentos
│   │   ├── Tab Historial
│   │   │   └── Timeline
│   │   └── Tab Observaciones
│   │       ├── TextField multilínea
│   │       └── Botón Guardar
│   └── Panel Lateral de Acciones
│       ├── Sección Flujo
│       │   ├── Avanzar Trámite
│       │   └── Retroceder Trámite
│       ├── Sección Comunicación
│       │   ├── Registrar Contacto
│       │   └── Accesos rápidos (WhatsApp, Call, Email)
│       ├── Sección Crítica
│       │   └── Cancelar Trámite
│       └── Info Adicional
│           └── Paso actual con color
├── Footer (DialogActions)
│   └── Botón Cerrar
└── Modales
    ├── ContactoModal
    ├── AvanzarTramiteModal
    └── RetrocederModal
```

## Uso

```tsx
import { TramiteManager } from "@/components/tramites/TramiteManager";

function MiComponente() {
  const [open, setOpen] = useState(false);
  const [tramiteId, setTramiteId] = useState<number | null>(null);

  return (
    <TramiteManager
      open={open}
      tramiteId={tramiteId}
      onClose={() => {
        setOpen(false);
        setTramiteId(null);
      }}
      onTramiteUpdated={(tramite) => {
        console.log("Trámite actualizado:", tramite);
        // Actualizar lista, etc.
      }}
    />
  );
}
```

## Integración con el Sistema

- ✅ Reemplaza completamente a `TramiteDetailDialog`
- ✅ Se usa desde `TramitesContent` al hacer clic en "Editar"
- ✅ Integrado con `useTramiteManagement` hook
- ✅ Usa servicios de `tramitesService`
- ✅ Compatible con el flujo de trabajo existente

## Mejoras Futuras Sugeridas

1. **Performance**

   - Implementar React.memo para subcomponentes
   - Virtualización de lista de documentos si hay muchos
   - Lazy loading de tabs

2. **UX**

   - Animaciones de transición entre pasos
   - Drag & drop para reordenar documentos
   - Búsqueda/filtrado en tabla de documentos
   - Atajos de teclado

3. **Reportes**

   - Exportar timeline a PDF
   - Generar reporte completo del trámite
   - Historial de cambios de estado de documentos

4. **Colaboración**
   - Ver quién está viendo el trámite
   - Comentarios en tiempo real
   - Notificaciones push

## Consideraciones Técnicas

- **Responsive**: El panel lateral se podría colapsar en móviles
- **Accesibilidad**: Usa componentes de MUI con ARIA labels
- **Tipado**: Fully typed con TypeScript
- **Error Handling**: Usa ErrorAlert y LoadingSpinner centralizados
- **State Management**: Usa hook personalizado para lógica de negocio

## Changelog

### v1.0.0 (2024-11-21)

- ✅ Creación inicial del componente
- ✅ Implementación de stepper horizontal
- ✅ Sistema de tabs (Documentos, Historial, Observaciones)
- ✅ Panel de acciones contextual
- ✅ Modales para avanzar, retroceder y registrar contacto
- ✅ Integración con useTramiteManagement
- ✅ Validaciones básicas de documentos y transiciones
- ✅ Reemplazo de TramiteDetailDialog en TramitesContent
