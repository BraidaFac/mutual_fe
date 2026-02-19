"use client";

/**
 * Layout principal para páginas autenticadas
 * - Sidebar de navegación
 * - Área de contenido principal
 * - Responsive design
 */

import { SideBar } from "@/components/menu/SideMenu";
import { Box, useTheme } from "@mui/material";
import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // const { isLoading } = useAuth();
  const theme = useTheme();

  /*   // Mostrar loading mientras se carga el estado de autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  } */

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          // En mobile: margin-top para el AppBar, margin-left 0
          // En desktop: margin-left para el sidebar, margin-top 0
          ml: { xs: 0, lg: "64px" }, // Sidebar colapsado por defecto
          mt: { xs: "64px", lg: 0 }, // AppBar height en mobile
          // Transición suave cuando el sidebar cambia de tamaño
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // Responsive padding
          p: { xs: 2, sm: 3 },
          backgroundColor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
