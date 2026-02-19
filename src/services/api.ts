/**
 * Cliente API mejorado con refresh token automático
 * - Manejo automático de tokens
 * - Refresh token con retry
 * - Manejo de errores consistente
 */

import { ApiResponse } from "@/types/index";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let accessToken: string | null = null;
let refreshTokenPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isPermissionError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 403;
};

export const isAuthError = (error: unknown | Response): boolean => {
  if (error instanceof ApiError) {
    return error.status === 401;
  }
  if (error instanceof Response) {
    return error.status === 401;
  }
  return false;
};

/**
 * Refresca el access token usando el refresh token en cookies
 */
async function refreshAccessToken(): Promise<string | null> {
  // Si ya hay un refresh en curso, esperar a que termine
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // Crear una nueva promesa de refresh
  refreshTokenPromise = (async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Envía las cookies httpOnly
        },
      );

      if (!response.ok) {
        // Si el refresh falla, limpiar todo y redirigir al login
        accessToken = null;
        localStorage.removeItem("crm_user");
        localStorage.removeItem("crm_access_token");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return null;
      }

      const { data } = await response.json();
      accessToken = data.accessToken;

      // Actualizar también en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_access_token", accessToken as string);
      }

      return accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      accessToken = null;

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return null;
    } finally {
      // Limpiar la promesa después de completarse
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

/**
 * Realiza una petición HTTP a la API con manejo automático de tokens
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Preparar headers
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Agregar token de autorización si existe
  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  // Agregar Content-Type solo si no es FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    credentials: "include", // Importante para cookies
    headers,
  };

  try {
    let response = await fetch(url, config);

    // Si recibimos 401 (no autorizado), intentar refrescar el token
    if (response.status === 401) {
      console.log("Token expirado, refrescando...");

      // Esperar a que el refresh termine
      const newToken = await refreshAccessToken();

      if (!newToken) {
        throw new ApiError(
          401,
          "Sesión expirada. Por favor, inicia sesión nuevamente.",
        );
      }

      // Actualizar headers con el nuevo token
      const updatedHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      const retryConfig: RequestInit = {
        ...config,
        headers: updatedHeaders,
      };

      // Reintentar la petición original con el nuevo token
      response = await fetch(url, retryConfig);
    }

    // Manejar error de permisos
    if (response.status === 403) {
      throw new ApiError(403, "No tienes permisos para realizar esta acción");
    }

    // Manejar respuesta exitosa
    if (response.ok) {
      // Si la respuesta es vacía (204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new ApiError(
          response.status,
          result.message || "Error en la respuesta de la API",
          result.data,
        );
      }

      return result.data;
    }

    // Manejar otros errores HTTP
    let errorMessage = response.statusText || "Error en la respuesta de la API";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Si no se puede parsear el JSON, usar statusText
    }

    throw new ApiError(response.status, errorMessage);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Error de red o conexión
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Error de conexión",
    );
  }
}

/**
 * Realiza una petición para descargar archivos binarios (Blob)
 */
export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {},
): Promise<Blob> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  try {
    let response = await fetch(url, config);

    // Manejar refresh token si es necesario
    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        throw new ApiError(401, "Sesión expirada");
      }

      const updatedHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(url, {
        ...config,
        headers: updatedHeaders,
      });
    }

    if (response.ok) {
      return response.blob();
    }

    throw new ApiError(
      response.status,
      response.statusText || "Error al descargar el archivo",
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Error de conexión",
    );
  }
}

/**
 * Helper para construir query strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
