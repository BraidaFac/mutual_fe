"use client";

/**
 * Layout para páginas autenticadas
 * Incluye el sidebar, navegación y protección de rutas
 */

import AppLayout from "@/components/layout/AppLayout";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import { ReactNode } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RouteGuard>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <AppLayout>{children}</AppLayout>
      </LocalizationProvider>
    </RouteGuard>
  );
}
