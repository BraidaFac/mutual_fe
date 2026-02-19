# 🚀 Activar Sistema Mock - Guía Rápida

## ✅ Pasos para Activar

### 1. Configuración Principal

En `src/config/apiConfig.ts`:

```typescript
export const USE_MOCK_DATA = true; // ✅ Cambiar a true
```

### 2. El servicio de FUERZAS ya está configurado ✅

Puedes probarlo inmediatamente en `/fuerzas`

### 3. Para configurar otros servicios (opcional)

Aplica este patrón en cada servicio:

```typescript
// Agregar imports
import { USE_MOCK_DATA } from "@/config/apiConfig";
import { simpleMockServices } from "./simpleMockService";

// En cada método, agregar:
if (USE_MOCK_DATA) {
  return simpleMockServices.NOMBRE_SERVICIO.METODO();
}
```

## 🎯 Datos Disponibles

- ✅ **5 Fuerzas** (Ejército, Armada, Fuerza Aérea, etc.)
- ✅ **5 Localidades** (Buenos Aires, Córdoba, Rosario, etc.)
- ✅ **6 Estados** de trámite (3 urgentes)
- ✅ **5 Clientes** con información completa
- ✅ **5 Trámites** de diferentes tipos
- ✅ **6 Tipos de documentos**

## 🔧 Funcionalidades que Funcionan

- ✅ **Dashboard** con estadísticas reales
- ✅ **CRUD de Fuerzas** (crear, editar, eliminar)
- ✅ **Delays realistas** (300ms-2000ms)
- ✅ **Errores simulados** (5% probabilidad)
- ✅ **IDs únicos** generados automáticamente

## 🎉 ¡Listo para Probar!

1. Cambia `USE_MOCK_DATA = true`
2. Ve a `/fuerzas`
3. Prueba crear, editar y eliminar fuerzas
4. Ve al dashboard `/` para estadísticas

¡Todo funciona sin backend! 🚀
