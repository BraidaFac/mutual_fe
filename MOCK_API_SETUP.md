# 🎭 Sistema de Mock API - Documentación Completa

Este sistema te permite probar toda la funcionalidad del CRM con datos simulados sin necesidad de un backend real.

## 🚀 Activación del Mock

### 1. Configuración Principal

En `src/config/apiConfig.ts`, cambia la variable:

```typescript
export const USE_MOCK_DATA = true; // ✅ Activar datos mock
// export const USE_MOCK_DATA = false; // ❌ Usar API real
```

### 2. Servicios Ya Configurados

✅ **Fuerzas Service** - Ya configurado con mock

- `src/services/fuerzasService.ts`

Para configurar el resto de servicios, sigue este patrón:

## 📝 Patrón de Configuración

### Ejemplo para cualquier servicio:

```typescript
// Antes (solo API real)
import { TipoDeServicio } from "@/types/index";
import { apiRequest } from "./api";

export const miServicio = {
  getAll: async (): Promise<TipoDeServicio[]> => {
    return apiRequest<TipoDeServicio[]>("/endpoint");
  },
};

// Después (con mock)
import { TipoDeServicio } from "@/types/index";
import { apiRequest } from "./api";
import { USE_MOCK_DATA } from "@/config/apiConfig";
import { mockMiServicio } from "./mockApiService";

export const miServicio = {
  getAll: async (): Promise<TipoDeServicio[]> => {
    if (USE_MOCK_DATA) {
      return mockMiServicio.getAll();
    }
    return apiRequest<TipoDeServicio[]>("/endpoint");
  },
};
```

## 📊 Datos de Prueba Incluidos

### Fuerzas (5 entidades)

- Ejército Argentino
- Armada Argentina
- Fuerza Aérea Argentina
- Gendarmería Nacional
- Prefectura Naval

### Localidades (5 ubicaciones)

- Buenos Aires
- Córdoba
- Rosario
- Mendoza
- La Plata

### Estados de Trámite (6 estados)

- Iniciado
- En Revisión
- Documentación Incompleta (Urgente)
- Aprobado
- Rechazado (Urgente)
- Pendiente de Firma (Urgente)

### Clientes (5 clientes)

- Ana Martínez (Estado: En Revisión)
- Roberto Silva (Estado: Documentación Incompleta)
- Laura Torres (Estado: Aprobado)
- Diego Ramírez (Estado: Iniciado)
- Carmen López (Estado: Pendiente de Firma)

### Trámites (5 trámites)

- Préstamo Personal - $500,000
- Préstamo Vivienda - $2,000,000
- Préstamo Educación - $300,000
- Préstamo Emergencia - $150,000
- Préstamo Vehículo - $800,000

### Documentos (6 tipos)

- DNI
- Recibo de Sueldo
- Certificado de Servicios
- Formulario de Solicitud
- Autorización Cónyuge
- Constancia de CUIL

## ⚙️ Configuración Avanzada

### Latencia Simulada

```typescript
// En src/config/apiConfig.ts
export const MOCK_CONFIG = {
  DEFAULT_DELAY: 800, // Delay promedio
  MIN_DELAY: 300, // Delay mínimo
  MAX_DELAY: 2000, // Delay máximo
  ERROR_RATE: 0.05, // 5% de errores simulados
};
```

### Personalizar Errores

```typescript
ERROR_MESSAGES: [
  "Error de conexión con el servidor",
  "Timeout de la solicitud",
  "Error interno del servidor",
  "Servicio temporalmente no disponible",
];
```

## 🔧 Servicios que Necesitan Configuración

Para completar la configuración, actualiza estos archivos añadiendo el patrón mostrado arriba:

1. `src/services/localidadesService.ts`
2. `src/services/documentosService.ts`
3. `src/services/estadosService.ts`
4. `src/services/clientesService.ts`
5. `src/services/tramitesService.ts`
6. `src/services/representantesService.ts`
7. `src/services/configuracionService.ts`

## 🎯 Funcionalidades Simuladas

### ✅ Operaciones CRUD Completas

- ✅ Crear nuevos registros
- ✅ Leer/Listar registros
- ✅ Actualizar registros existentes
- ✅ Eliminar registros

### ✅ Funcionalidades Especiales

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Filtros y búsquedas
- ✅ Estados urgentes
- ✅ Configuración de documentos por fuerza/estado
- ✅ Validaciones de formularios

### ✅ Simulación Realista

- ✅ Delays de red variables
- ✅ Errores ocasionales (5% por defecto)
- ✅ Persistencia durante la sesión
- ✅ IDs únicos generados automáticamente

## 🚦 Cómo Probar

### 1. Dashboard

- Ve a `/` para ver estadísticas
- Los trámites urgentes aparecen destacados
- Crea nuevos trámites desde el botón "Nuevo Trámite"

### 2. Gestión de Entidades

- **Fuerzas**: `/fuerzas` - Gestiona las fuerzas armadas
- **Localidades**: `/localidades` - Gestiona ubicaciones
- **Documentos**: `/documentos` - Gestiona tipos de documentos
- **Estados**: `/estados` - Gestiona estados de trámites

### 3. Gestión de Clientes

- **Clientes**: `/clientes` - CRUD completo de clientes
- Filtros por nombre, localidad, fuerza
- Ver detalles completos de cada cliente

### 4. Gestión de Trámites

- **Trámites**: `/tramites` - Ver todos los trámites
- Filtros por fuerza y estado
- Estados con colores según urgencia

### 5. Configuración

- **Configuración**: `/configuracion` - Configura documentos requeridos
- Selecciona fuerza y estado
- Marca documentos como obligatorios

## 🐛 Debug y Desarrollo

### Ver datos en consola:

```typescript
// En cualquier componente
import { mockApiServices } from "@/services/mockApiService";

// Ver todos los datos mock
console.log("Mock Data:", {
  fuerzas: await mockApiServices.fuerzas.getAll(),
  clientes: await mockApiServices.clientes.getAll(),
  tramites: await mockApiServices.tramites.getAll(),
});
```

### Resetear datos:

Los datos se resetean cada vez que recargas la página o reinicias el servidor de desarrollo.

### Cambiar datos:

Modifica los archivos en `src/data/mockData.ts` para personalizar los datos iniciales.

## 🔄 Migración a API Real

Cuando tengas el backend listo:

1. Cambia `USE_MOCK_DATA = false` en `src/config/apiConfig.ts`
2. Actualiza `API_BASE_URL` con la URL de tu backend
3. Todos los servicios automáticamente usarán la API real

## 🎉 ¡Listo para Probar!

Con este sistema tienes:

- ✅ **5 Fuerzas** predefinidas
- ✅ **5 Localidades** de Argentina
- ✅ **6 Estados** de trámite (3 urgentes)
- ✅ **5 Clientes** con diferentes estados
- ✅ **5 Trámites** de diferentes tipos
- ✅ **6 Tipos de documentos**
- ✅ **Dashboard completo** con estadísticas
- ✅ **Todas las funcionalidades CRUD**

¡Ahora puedes probar toda la funcionalidad del CRM sin backend! 🚀
