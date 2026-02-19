# Editor Visual de Flujos con React Flow

## Descripción

El **Editor Visual de Flujos** es una interfaz interactiva que permite visualizar y gestionar los pasos de un flujo de trámite y sus transiciones de forma gráfica usando React Flow.

## Características Principales

### 1. Visualización de Pasos

- **Nodos Personalizados**: Cada paso se representa como un nodo visual con:
  - Nombre del paso
  - Número de secuencia
  - Color identificador
  - Iconos informativos:
    - ⚡ Transiciones automáticas
    - 👤 Requiere intervención manual
    - ⏰ Límite de días configurado
  - Estado (Activo/Inactivo)

### 2. Transiciones Entre Pasos

- **Conexiones Visuales**: Flechas que representan las transiciones entre pasos
- **Tipos de Transición**:
  - **Automáticas**: Líneas verdes animadas que se ejecutan automáticamente
  - **Manuales**: Líneas azules que requieren intervención del usuario
- **Edición de Transiciones**: Click en una flecha para configurar:
  - Descripción
  - Tipo (Automático/Manual)
  - Estado (Activo/Inactivo)

### 3. Controles de Navegación

- **Zoom**: Controles +/- para acercar/alejar
- **Pan**: Arrastrar el canvas para navegar
- **Fit to View**: Ajustar vista para ver todos los nodos
- **Mini Mapa**: Vista general del flujo en la esquina

### 4. Gestión de Elementos

- **Crear Conexión**: Arrastrar desde el handle derecho de un nodo al handle izquierdo de otro
- **Editar Paso**: Click en un nodo para abrir el diálogo de edición
- **Eliminar Transición**: Seleccionar una flecha y presionar el botón "Eliminar"
- **Nuevo Paso**: Botón "Nuevo Paso" en la barra de herramientas

## Uso

### Acceder al Editor Visual

1. Ir a **Gestión de Flujos**
2. Crear o editar un flujo
3. Navegar al tab **"Editor Visual"**

### Crear una Transición

1. Hacer click en el círculo del lado derecho de un paso (nodo origen)
2. Arrastrar hasta el círculo del lado izquierdo de otro paso (nodo destino)
3. Configurar las propiedades de la transición en el diálogo que aparece
4. Guardar

### Editar una Transición

1. Hacer click en la flecha (edge) que deseas editar
2. Modificar las propiedades en el diálogo
3. Guardar

### Eliminar una Transición

1. Hacer click en la flecha para seleccionarla
2. Presionar el botón "Eliminar" en la barra de herramientas

### Editar un Paso

1. Hacer click en el nodo del paso
2. Se abrirá el diálogo de edición de paso
3. Modificar las propiedades
4. Guardar

## Estructura de Componentes

```
flujos/
├── FlujoVisualEditor.tsx    # Componente principal del editor
├── PasoNode.tsx             # Nodo personalizado para representar pasos
├── FlujoDialog.tsx          # Diálogo principal que contiene el editor (tab 3)
└── PasoDialog.tsx           # Diálogo para crear/editar pasos
```

## Tipos de Datos

### PasoTramite

```typescript
interface PasoTramite {
  id: number | undefined;
  nombre: string;
  descripcion?: string;
  secuencia: number;
  diasMaximoSinAvance?: number;
  requiereIntervencionManual: boolean;
  color: string;
  activo: boolean;
  transicionesOrigen: ReglaTransicion[];
  transicionesDestino: ReglaTransicion[];
}
```

### ReglaTransicion

```typescript
interface ReglaTransicion {
  id: number | undefined;
  pasoOrigen: PasoTramite;
  pasoDestino: PasoTramite;
  esAutomatico: boolean;
  condicionDocumentos?: any;
  descripcion?: string;
  activo: boolean;
}
```

## Props del Componente

### FlujoVisualEditor

```typescript
interface FlujoVisualEditorProps {
  pasos: PasoTramite[]; // Array de pasos del flujo
  onPasosChange?: (pasos: PasoTramite[]) => void; // Callback al cambiar pasos
  onEditarPaso?: (paso: PasoTramite) => void; // Callback para editar paso
  onNuevoPaso?: () => void; // Callback para crear paso
}
```

## Dependencias

- `@xyflow/react`: Librería para crear diagramas interactivos
- `@mui/material`: Componentes de Material-UI
- `@mui/icons-material`: Iconos de Material-UI

## Configuración de Condiciones Automáticas

### Operadores Lógicos

- **AND**: Todos los documentos seleccionados deben cumplir su condición
- **OR**: Al menos uno de los documentos debe cumplir su condición

### Estados de Documentos

- **PENDIENTE**: El documento está cargado pero sin revisar
- **APROBADO**: El documento fue revisado y aprobado
- **RECHAZADO**: El documento fue revisado y rechazado

### Ejemplo Práctico

```
Transición: "Carga de Documentos" → "Revisión"
Tipo: Automática
Operador: AND
Condiciones:
  - DNI: APROBADO
  - Recibo de Sueldo: APROBADO

Resultado: La transición se ejecuta automáticamente cuando AMBOS
documentos estén en estado APROBADO.
```

## Mejoras Futuras

- [x] Condiciones automáticas basadas en estado de documentos
- [ ] Drag and drop de pasos desde un panel lateral
- [ ] Auto-layout de nodos (algoritmo de distribución automática)
- [ ] Exportar/Importar flujo como imagen
- [ ] Validación de flujos (detectar ciclos, pasos sin conexión, etc.)
- [ ] Modo de solo lectura para visualización
- [ ] Historial de cambios (undo/redo)
- [ ] Agrupación de pasos en subprocesos

## Notas Técnicas

### Posicionamiento de Nodos

Por defecto, los nodos se posicionan en una cuadrícula 3x3:

```typescript
position: {
  x: (index % 3) * 300 + 100,
  y: Math.floor(index / 3) * 200 + 100,
}
```

### Sincronización de Estado

El editor mantiene sincronización bidireccional con el formulario del flujo:

- Cambios en el editor se reflejan en el formulario
- Cambios en el formulario (tabs de Pasos) se reflejan en el editor

### Persistencia

Las transiciones se guardan automáticamente en el array `transicionesOrigen` de cada paso y se envían al backend al guardar el flujo completo.
