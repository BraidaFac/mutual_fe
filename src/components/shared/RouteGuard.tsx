"use client";

import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/auth.types";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";

const REPRESENTANTE_ALLOWED_PREFIXES = ["/tramites", "/clientes","/leads"];

const isAllowedForRepresentante = (pathname: string) =>
  REPRESENTANTE_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

interface RouteGuardProps {
  children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hasFullAccess = useMemo(() => {
      return user?.role === Role.ADMIN || user?.role === Role.MANAGER;
  }, [user?.role]);

  const canAccessRoute = useMemo(() => {
    if (!pathname || !isAuthenticated || !user) return false;
    if (hasFullAccess) return true;
      if (user.role === Role.REPRESENTANTE) {
        return isAllowedForRepresentante(pathname);
      }
      return false;
    }, [hasFullAccess, isAuthenticated, pathname, user]);

    useEffect(() => {
    if (isLoading || !isAuthenticated || !pathname) return;
    if (!canAccessRoute) {
      router.replace("/tramites");
    }
  }, [canAccessRoute, isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (!canAccessRoute) {
    return null;
  }

  return <>{children}</>;
}
