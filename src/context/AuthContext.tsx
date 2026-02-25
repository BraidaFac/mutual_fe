"use client";

/**
 * Context de Autenticación con persistencia y mejores prácticas
 * - Persistencia en localStorage
 * - Refresh token automático
 * - Manejo de errores mejorado
 * - Sincronización entre tabs
 */

import { setAccessToken } from "@/services/api";
import { AuthUser, LoginData, RegisterData, Role } from "@/types/auth.types";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextProps {
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isRepresentante: () => boolean;
  login: (loginData: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (registerData: RegisterData) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Keys para localStorage
const STORAGE_KEYS = {
  USER: "crm_user",
  ACCESS_TOKEN: "crm_access_token",
} as const;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser) as AuthUser;
          setUser(parsedUser);
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        // Limpiar storage corrupto
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Sincronización entre tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
          router.push("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // Persistir usuario en localStorage
  const persistUser = useCallback((userData: AuthUser, token: string) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    setUser(userData);
    setAccessToken(token);
  }, []);

  // Limpiar usuario de localStorage
  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    setUser(null);
    setAccessToken(null);
  }, []);

  // Login
  const login = useCallback(
    async (loginData: LoginData): Promise<boolean> => {
      setError(null);
      setIsLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
            credentials: "include", // Importante para cookies httpOnly
          },
        );

        if (!res.ok) {
          const errorMessage =
            res.status === 401
              ? "Credenciales incorrectas"
              : "Error en el servidor";
          setError(errorMessage);
          clearUser();
          return false;
        }

        const { data } = await res.json();

        persistUser(data.user, data.accessToken);

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error en el login";
        setError(errorMessage);
        clearUser();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser, clearUser],
  );

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Llamar al backend para invalidar el refresh token
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearUser();
      setIsLoading(false);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [clearUser, router]);

  // Register
  const register = useCallback(
    async (registerData: RegisterData): Promise<boolean> => {
      setError(null);
      setIsLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerData),
          },
        );

        if (!res.ok) {
          const { message } = await res.json();
          setError(message || "Error en el registro");
          return false;
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error en el registro";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Refrescar información del usuario
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            STORAGE_KEYS.ACCESS_TOKEN,
          )}`,
        },
      });

      if (res.ok) {
        const { data } = await res.json();
        const currentToken =
          localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
        persistUser(data, currentToken);
      } else {
        // Si falla, cerrar sesión
        await logout();
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      await logout();
    }
  }, [persistUser, logout]);

  // Verificar si es admin
  const isAdmin = useCallback(() => user?.role === Role.ADMIN, [user]);
  const isManager = useCallback(() => user?.role === Role.MANAGER, [user]);
  const isRepresentante = useCallback(
    () => user?.role === Role.REPRESENTANTE,
    [user],
  );

  const isAuthenticated = useCallback(() => !!user, [user]);

  const value: AuthContextProps = {
    user,
    error,
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    isRepresentante,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
};
