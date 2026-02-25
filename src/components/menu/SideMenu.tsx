"use client";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/auth.types";
import {
  Business as Building,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  CreditCard,
  Description as FileText,
  Home,
  Logout,
  LocationOn as MapPin,
  Menu,
  PersonAdd,
  Settings,
  People as Users,
  Close as X,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { LoadingSpinner } from "../shared";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
  href: string;
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
  { id: "clientes", label: "Clientes", icon: Users, href: "/clientes" },
  { id: "leads", label: "Leads", icon: PersonAdd, href: "/leads" },
  { id: "tramites", label: "Trámites", icon: CreditCard, href: "/tramites" },
  { id: "fuerzas", label: "Fuerzas", icon: Building, href: "/fuerzas" },
  {
    id: "localidades",
    label: "Localidades",
    icon: MapPin,
    href: "/localidades",
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    href: "/documentos",
  },
  {
    id: "importacion",
    label: "Importación",
    icon: CloudUpload,
    href: "/importacion",
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    href: "/configuracion",
  },
];

const REPRESENTANTE_ALLOWED_PREFIXES = ["/tramites", "/clientes", "/leads"];

const isAllowedForRepresentante = (href: string) =>
  REPRESENTANTE_ALLOWED_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`),
  );

export function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { user, logout, isLoading } = useAuth();
  const [isPinned, setIsPinned] = useState(false); // Para controlar si está fijado
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // En desktop: muestra expandido si hay hover O si está fijado manualmente
  const shouldShowExpanded = isMobile || isHovered || isPinned;
  const effectiveWidth = isMobile ? 240 : shouldShowExpanded ? 240 : 64;

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const canSeeAll = useMemo(() => {
    return user?.role === Role.ADMIN || user?.role === Role.MANAGER;
  }, [user?.role]);

  const filteredNavigationItems = useMemo(() => {
    if (!user) return [];
    if (canSeeAll) return navigationItems;
    if (user.role === Role.REPRESENTANTE) {
      return navigationItems.filter((item) =>
        isAllowedForRepresentante(item.href),
      );
    }
    return [];
  }, [canSeeAll, user]);

  const roleLabel = useMemo(() => {
    if (!user?.role) return "";
    if (user.role === Role.ADMIN) return "Admin";
    if (user.role === Role.MANAGER) return "Manager";
    if (user.role === Role.REPRESENTANTE) return "Representante";
  }, [user?.role]);

  const displayName =
    user?.representante?.fullName || user?.username || "Usuario";

  const getCurrentPageTitle = () => {
    const currentItem = filteredNavigationItems.find((item) =>
      isActive(item.href),
    );
    return currentItem?.label || "Dashboard";
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          px: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {shouldShowExpanded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Paper
              elevation={0}
              sx={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard sx={{ fontSize: 16, color: "white" }} />
            </Paper>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Préstamos
            </Typography>
          </Box>
        )}

        {/* Desktop pin/unpin button */}
        {!isMobile && (
          <IconButton
            onClick={() => setIsPinned(!isPinned)}
            size="small"
            sx={{ ml: "auto" }}
          >
            {isPinned ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <IconButton onClick={() => setIsMobileOpen(false)} size="small">
            <X />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 1 }}>
        <List disablePadding={true}>
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <ListItem key={item.id} disablePadding={true}>
                <ListItemButton
                  onClick={() => handleNavigation(item.href)}
                  sx={{
                    borderRadius: 1,
                    height: 44,
                    justifyContent: "center",
                    px: 2,
                    backgroundColor: active ? "primary.50" : "transparent",
                    color: active ? "primary.main" : "text.primary",
                    "&:hover": {
                      backgroundColor: active ? "primary.100" : "action.hover",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  title={!shouldShowExpanded ? item.label : undefined}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: shouldShowExpanded ? 40 : "auto",
                      color: active ? "primary.main" : "text.secondary",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  {shouldShowExpanded && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: active ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer info - only when expanded */}
      {shouldShowExpanded && (
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
            minWidth: 240,
            flexShrink: 0,
            animation: "footerFadeIn 0.3s ease-out forwards",
            "@keyframes footerFadeIn": {
              "0%": { opacity: 0 },
              "70%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 500, lineHeight: "16px" }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "text.secondary" }}
            >
              {roleLabel}
            </Typography>
          </Box>
        </Stack>
      )}

      <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              disabled={isLoading}
              sx={{
                borderRadius: 1,
                minHeight: 44,
                justifyContent: shouldShowExpanded ? "flex-start" : "center",
                px: shouldShowExpanded ? 2 : 1,
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
              title={!shouldShowExpanded ? "Cerrar sesión" : undefined}
            >
              <ListItemIcon
                sx={{
                  minWidth: shouldShowExpanded ? 40 : "auto",
                  color: "text.secondary",
                  justifyContent: "center",
                }}
              >
                <Logout sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {shouldShowExpanded && (
                <ListItemText
                  primary="Cerrar sesión"
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
            backgroundColor: "white",
          }}
        >
          <LoadingSpinner />
        </Box>
      )}
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: "background.paper",
            color: "text.primary",
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {getCurrentPageTitle()}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Drawer */}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: effectiveWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: effectiveWidth,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile toolbar spacer */}
      {isMobile && <Toolbar />}
    </>
  );
}
