"use client";
import {
  Business as Building,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Description as FileText,
  Home,
  LocationOn as MapPin,
  Menu,
  Settings,
  People as Users,
  Close as X,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
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
import React from "react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
  href: string;
}

const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
  { id: "clientes", label: "Clientes", icon: Users, href: "/clientes" },
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
  { id: "estados", label: "Estados", icon: Settings, href: "/estados" },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    href: "/configuracion",
  },
];

export function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [isPinned, setIsPinned] = React.useState(false); // Para controlar si está fijado
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

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

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find((item) => isActive(item.href));
    return currentItem?.label || "Dashboard";
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
        <List disablePadding>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.href)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    minHeight: 44,
                    justifyContent: shouldShowExpanded
                      ? "flex-start"
                      : "center",
                    px: shouldShowExpanded ? 2 : 1,
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
                      primaryTypographyProps={{
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
          }}
        >
          <Avatar
            sizes="small"
            alt="Riley Carter"
            src="/static/images/avatar/7.jpg"
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, lineHeight: "16px" }}
            >
              Riley Carter
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              riley@email.com
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );

  return (
    <>
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
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: effectiveWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
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

      {/* Mobile toolbar spacer */}
      {isMobile && <Toolbar />}
    </>
  );
}
