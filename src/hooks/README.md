# Hooks de la Aplicación

## useErrorHandler

Hook personalizado para manejar errores y mostrar notificaciones usando **notistack**.

### Características

- ✅ Manejo automático de errores HTTP (401, 403, 404, 422, 500)
- ✅ Notificaciones elegantes con notistack
- ✅ Diferentes tipos de notificaciones (success, error, warning, info)
- ✅ Duración automática personalizable
- ✅ Integración con AuthContext para logout automático

### Uso Básico

```typescript
import { useErrorHandler } from "@/hooks/useErrorHandler";

function MyComponent() {
  const {
    handleError,
    handlePermissionError,
    showSuccess,
    showInfo,
    showWarning,
  } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      await apiRequest("/api/data");
      showSuccess("¡Datos cargados correctamente!");
    } catch (error) {
      handleError(error); // Maneja automáticamente el tipo de error
    }
  };

  return <button onClick={handleApiCall}>Cargar Datos</button>;
}
```

### Funciones Disponibles

#### `handleError(error: unknown)`

Maneja cualquier tipo de error y muestra la notificación apropiada:

```typescript
// Errores HTTP automáticos
handleError(new ApiError(401, "Token expirado")); // → Notificación de error roja
handleError(new ApiError(403, "Sin permisos")); // → Notificación de error roja
handleError(new ApiError(404, "No encontrado")); // → Notificación de advertencia amarilla
```

#### `handlePermissionError(error: unknown)`

Manejo específico para errores 403 (sin permisos):

```typescript
try {
  await apiRequest("/api/admin-action");
} catch (error) {
  handlePermissionError(error); // Solo maneja 403, otros errores van a handleError
}
```

#### `handleAuthError(error: unknown)`

Manejo específico para errores 401 (autenticación):

```typescript
try {
  await apiRequest("/api/protected");
} catch (error) {
  handleAuthError(error); // Si es 401, hace logout automático
}
```

### Notificaciones Manuales

#### `showSuccess(message: string, duration?: number)`

```typescript
showSuccess("¡Operación exitosa!"); // Verde, 3 segundos
showSuccess("Guardado", 5000); // Verde, 5 segundos
```

#### `showInfo(message: string, duration?: number)`

```typescript
showInfo("Información importante"); // Azul, 3 segundos
```

#### `showWarning(message: string, duration?: number)`

```typescript
showWarning("Revisa los datos"); // Amarillo, 4 segundos
```

### Tipos de Errores HTTP

| Código    | Tipo    | Acción                | Duración |
| --------- | ------- | --------------------- | -------- |
| **401**   | Error   | Logout automático     | 3s       |
| **403**   | Error   | Mensaje específico    | 4s       |
| **404**   | Warning | Recurso no encontrado | 3s       |
| **422**   | Error   | Error de validación   | 4s       |
| **500**   | Error   | Error del servidor    | 5s       |
| **Otros** | Error   | Error inesperado      | 3s       |

### Ejemplos Avanzados

#### Validación de Formularios

```typescript
const validateForm = () => {
  if (!email) {
    showWarning("El email es requerido");
    return false;
  }

  if (!isValidEmail(email)) {
    showWarning("Formato de email inválido");
    return false;
  }

  showSuccess("Formulario válido");
  return true;
};
```

#### Operaciones con Permisos

```typescript
const deleteUser = async (userId: string) => {
  try {
    await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
    showSuccess("Usuario eliminado correctamente");
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      showWarning("No tienes permisos para eliminar usuarios");
    } else {
      handleError(error);
    }
  }
};
```

#### Operaciones en Lote

```typescript
const processBatch = async (items: any[]) => {
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      await apiRequest("/api/process", {
        method: "POST",
        body: JSON.stringify(item),
      });
      successCount++;
    } catch (error) {
      errorCount++;
      handleError(error);
    }
  }

  showInfo(`Procesados: ${successCount} exitosos, ${errorCount} errores`);
};
```

### Configuración de Notistack

Asegúrate de tener el SnackbarProvider configurado en tu app:

```typescript
// En tu layout.tsx o _app.tsx
import { SnackbarProvider } from "notistack";

export default function Layout({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {children}
    </SnackbarProvider>
  );
}
```

### Ventajas

1. **🎯 Consistente**: Todos los errores se manejan de la misma forma
2. **🎨 Elegante**: Notificaciones profesionales con notistack
3. **⚡ Automático**: No necesitas especificar el tipo de error
4. **🛡️ Seguro**: Manejo automático de logout en errores 401
5. **🔧 Flexible**: Notificaciones manuales cuando las necesites
6. **📱 Responsive**: Funciona en todos los dispositivos

### Mejores Prácticas

- ✅ Usa `handleError` para la mayoría de casos
- ✅ Usa `handlePermissionError` específicamente para errores 403
- ✅ Usa `showSuccess` después de operaciones exitosas
- ✅ Usa `showWarning` para validaciones del frontend
- ✅ No abuses de las notificaciones (máximo 3 simultáneas)
- ✅ Mensajes claros y concisos
