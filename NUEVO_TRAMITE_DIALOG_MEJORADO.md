# 🚀 NuevoTramiteDialog Mejorado - Formulario por Pasos con Carga de Archivos

## ✅ **Cambios Implementados**

### 📁 **1. Movido a Ubicación Correcta**

- ✅ **Antes**: `src/components/dashboard/NuevoTramiteDialog.tsx`
- ✅ **Ahora**: `src/components/tramites/NuevoTramiteDialog.tsx`
- ✅ **Referencias actualizadas** en `DashboardContent.tsx`

### 📋 **2. Formulario por Pasos (Stepper)**

- ✅ **4 Pasos** bien definidos con navegación
- ✅ **Stepper visual** de Material-UI
- ✅ **Validación por paso** antes de avanzar
- ✅ **Navegación hacia atrás/adelante**

**Pasos del Formulario:**

1. **Cliente** - Seleccionar existente o crear nuevo
2. **Datos del Trámite** - Fuerza, monto, observaciones
3. **Documentos** - Carga y gestión de archivos
4. **Confirmación** - Resumen final antes de crear

### 📎 **3. Sistema de Carga de Archivos**

- ✅ **Tipos soportados**: PDF, JPG, JPEG, PNG
- ✅ **Tamaño máximo**: 5MB por archivo
- ✅ **Validación automática** de tipo y tamaño
- ✅ **Preview de imágenes** integrado
- ✅ **Gestión de documentos obligatorios**

### 🔍 **4. Visualización de Archivos**

- ✅ **Preview de imágenes** directamente en el modal
- ✅ **Vista previa de PDFs** con opción de abrir en nueva pestaña
- ✅ **Información del archivo** (nombre, tamaño, tipo)
- ✅ **Iconos diferenciados** por tipo de archivo

## 🎯 **Funcionalidades Principales**

### **Paso 1: Selección de Cliente**

```tsx
// Dos opciones disponibles:
1. Cliente Existente → Autocomplete con búsqueda
2. Nuevo Cliente → Formulario completo
```

**Campos del Nuevo Cliente:**

- Nombre, Apellido (obligatorios)
- Email (obligatorio)
- Teléfono
- Localidad (select con opciones)
- Observaciones (textarea)

### **Paso 2: Datos del Trámite**

```tsx
// Información del trámite:
- Fuerza (select - obligatorio)
- Monto Solicitado (number - obligatorio)
- Observaciones (textarea - opcional)
```

### **Paso 3: Documentos** ⭐

```tsx
// Sistema completo de archivos:
- Lista de documentos requeridos según la fuerza
- Distinción entre obligatorios y opcionales
- Carga individual por documento
- Preview y gestión de archivos
```

**Funcionalidades de Archivos:**

- 📤 **Drag & Drop** (input file)
- 🔍 **Preview instantáneo** para imágenes
- 📄 **Vista PDF** con botón de abrir
- 🗑️ **Eliminar archivos** subidos
- ✅ **Validación de obligatorios**

### **Paso 4: Confirmación**

```tsx
// Resumen completo:
- Datos del cliente
- Información del trámite
- Lista de archivos subidos
- Botón final "Crear Trámite"
```

## 📱 **Interfaces y Tipos Nuevos**

### **ArchivoSubido Interface:**

```tsx
interface ArchivoSubido {
  id: string;
  file: File;
  documentoId: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  preview?: string; // Para imágenes
  obligatorio: boolean;
}
```

### **DocumentoRequerido Interface:**

```tsx
interface DocumentoRequerido {
  documentoId: string;
  nombre: string;
  descripcion?: string;
  obligatorio: boolean;
  archivo?: ArchivoSubido;
}
```

## 🎨 **Mejoras Visuales**

### **Stepper Navigation:**

- 📍 **Indicador visual** del paso actual
- ➡️ **Botones Next/Previous** con iconos
- 🔒 **Botones deshabilitados** si faltan datos
- ✅ **Validación visual** por paso

### **Gestión de Archivos:**

- 📋 **Lista organizada** por documento
- 🏷️ **Chips** para documentos obligatorios
- 📊 **Información de tamaño** formateada
- 🎨 **Iconos coloridos** por tipo de archivo

### **Preview de Archivos:**

- 🖼️ **Modal dedicado** para preview
- 📱 **Responsive** para diferentes tamaños
- 🔗 **Botón de abrir** PDFs en nueva pestaña
- 📏 **Tamaño ajustado** automáticamente

## 🔧 **Validaciones Implementadas**

### **Validación por Paso:**

```tsx
const canAdvanceToNext = () => {
  switch (activeStep) {
    case 0: // Cliente
      return tipoCliente === "existente"
        ? clienteSeleccionado !== null
        : nuevoCliente.nombre && nuevoCliente.apellido && nuevoCliente.email;

    case 1: // Datos del trámite
      return tramiteData.fuerzaId && tramiteData.montoSolicitado > 0;

    case 2: // Documentos
      const obligatoriosSubidos = documentosRequeridos
        .filter((d) => d.obligatorio)
        .every((d) =>
          archivosSubidos.some((a) => a.documentoId === d.documentoId)
        );
      return obligatoriosSubidos;

    default:
      return true;
  }
};
```

### **Validación de Archivos:**

- ✅ **Tipos permitidos**: PDF, JPG, JPEG, PNG
- ✅ **Tamaño máximo**: 5MB
- ✅ **Documentos obligatorios**: Bloqueante para avanzar
- ✅ **Mensajes de error** claros

## 📋 **Funciones Helper**

### **Gestión de Archivos:**

```tsx
// Formateo de tamaño
const formatFileSize = (bytes: number) => {
  // Convierte bytes a KB, MB, GB
};

// Iconos por tipo
const getFileIcon = (tipo: string) => {
  // PDF: PictureAsPdf (rojo)
  // Imagen: ImageIcon (azul)
};

// Upload handler
const handleFileUpload = async (documentoId, files) => {
  // Validación + Preview + Estado
};
```

### **Navegación del Stepper:**

```tsx
const handleNext = () => {
  if (activeStep < steps.length - 1) {
    setActiveStep((prev) => prev + 1);
  }
};

const handleBack = () => {
  if (activeStep > 0) {
    setActiveStep((prev) => prev - 1);
  }
};
```

## 🚀 **Integración Completa**

### **TramitesContent.tsx:**

```tsx
// Importación actualizada
import NuevoTramiteDialog from "./NuevoTramiteDialog";

// Uso en el componente
<NuevoTramiteDialog
  open={nuevoTramiteOpen}
  onClose={() => setNuevoTramiteOpen(false)}
  onTramiteCreado={() => {
    setNuevoTramiteOpen(false);
    cargarDatos(); // Recargar la lista
  }}
/>;
```

### **DashboardContent.tsx:**

```tsx
// Referencia actualizada
import NuevoTramiteDialog from "../tramites/NuevoTramiteDialog";
```

## 🎯 **Resultado Final**

### **Experiencia de Usuario:**

1. **Paso 1**: Selección rápida o creación de cliente
2. **Paso 2**: Datos del trámite con validación
3. **Paso 3**: ⭐ **Carga intuitiva de documentos con preview**
4. **Paso 4**: Confirmación visual antes de crear

### **Funcionalidades de Archivos:**

- ✅ **Drag & drop** para subir archivos
- ✅ **Preview inmediato** de imágenes
- ✅ **Gestión completa** (ver, eliminar, reemplazar)
- ✅ **Validación de obligatorios**
- ✅ **Información detallada** de cada archivo

### **Navegación Fluida:**

- ✅ **Stepper visual** siempre visible
- ✅ **Validación por paso** antes de avanzar
- ✅ **Botones inteligentes** (habilitados/deshabilitados)
- ✅ **Reset completo** al cerrar

## 🎉 **¡Implementación Completa!**

El **NuevoTramiteDialog** ahora es un componente completo y profesional que:

- ✅ Está en la **ubicación correcta** (`/tramites`)
- ✅ Tiene **formulario por pasos** intuitivo
- ✅ Soporta **carga de archivos** con preview
- ✅ Valida **documentos obligatorios**
- ✅ Ofrece **experiencia de usuario premium**

¡Perfecto para gestionar trámites con documentos obligatorios! 🚀
