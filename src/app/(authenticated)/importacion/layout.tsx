/**
 * Layout para las páginas de importación ETL
 * Proporciona navegación secundaria entre las secciones
 */

"use client";

import { CloudUpload, Settings } from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ImportacionLayoutProps {
  children: React.ReactNode;
}

const TABS = [
  {
    href: "/importacion",
    label: "Importar",
    icon: <CloudUpload />,
  },
  {
    href: "/importacion/templates",
    label: "Templates",
    icon: <Settings />,
  },
];

export default function ImportacionLayout({
  children,
}: ImportacionLayoutProps) {
  const pathname = usePathname();

  // Determinar tab activo
  const currentTabIndex = TABS.findIndex((tab) => {
    if (tab.href === "/importacion") {
      return pathname === "/importacion";
    }
    return pathname.startsWith(tab.href);
  });

  return (
    <Box>
      {/* Navegación de tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTabIndex >= 0 ? currentTabIndex : 0}
          aria-label="Navegación de importación"
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.href}
              component={Link}
              href={tab.href}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Contenido de la página */}
      {children}
    </Box>
  );
}

