import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

export function useErrorHandler() {
  const router = useRouter();
  const { logout } = useAuth();

  const showError = useCallback((message: string, duration = 3000) => {
    toast.error(message, {
      duration: duration,
      position: "top-right",
    });
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error && "status" in error) {
      switch (error.status) {
        case 401:
          // Sesión expirada - logout automático ya se maneja en api.ts
          toast.error("Sesión expirada. Redirigiendo al login...", {
            duration: 3000,
            position: "top-right",
          });
          break;

        case 403:
          // Sin permisos - mostrar mensaje específico
          toast.error(error.message || "No tienes permisos para esta acción", {
            duration: 4000,
            position: "top-right",
          });
          break;

        case 404:
          // Recurso no encontrado
          toast.error("El recurso solicitado no existe", {
            duration: 3000,
            position: "top-right",
          });
          break;

        case 422:
          // Error de validación
          toast.error(error.message || "Error de validación en los datos", {
            duration: 4000,
            position: "top-right",
          });
          break;

        case 500:
          // Error del servidor
          toast.error("Error interno del servidor. Intenta más tarde", {
            duration: 5000,
            position: "top-right",
          });
          break;

        default:
          // Otros errores HTTP
          toast.error(error.message || "Error inesperado", {
            duration: 3000,
            position: "top-right",
          });
      }
    } else {
      console.error(error);
      // Errores no relacionados con API
      toast.error("Error de conexión. Verifica tu internet", {
        duration: 4000,
        position: "top-right",
      });
    }
  }, []); // ✅ Memoizado sin dependencias

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof Error && "status" in error && error.status === 401) {
        logout();
        router.push("/login");
      } else {
        handleError(error);
      }
    },
    [logout, router, handleError],
  ); // ✅ Con dependencias necesarias

  const handlePermissionError = useCallback(
    (error: unknown) => {
      if (error instanceof Error && "status" in error && error.status === 403) {
        toast.error("No tienes permisos para realizar esta acción", {
          duration: 4000,
        });
        // Opcional: redirigir a una página de "sin permisos"
        // router.push("/unauthorized");
      } else {
        handleError(error);
      }
    },
    [handleError],
  ); // ✅ Con dependencia

  // Función para mostrar notificaciones de éxito
  const showSuccess = useCallback((message: string, duration = 3000) => {
    toast.success(message, { duration: duration, position: "top-right" });
  }, []);

  // Función para mostrar notificaciones de información
  const showInfo = useCallback((message: string, duration = 3000) => {
    toast(message, {
      duration: duration,
      position: "top-right",
    });
  }, []);

  // Función para mostrar notificaciones de advertencia
  const showWarning = useCallback((message: string, duration = 4000) => {
    toast(message, {
      duration: duration,
      position: "top-right",
    });
  }, []);

  return {
    handleError,
    handleAuthError,
    handlePermissionError,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  };
}
