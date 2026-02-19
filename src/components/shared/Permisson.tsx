import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/auth.types";
import {
  Warning as AlertTriangleIcon,
  ArrowBack as ArrowLeftIcon,
  Security as ShieldIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

// Hook para verificar permisos en componentes
export function usePermission() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: Role): boolean => {
    return isAuthenticated() && user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return isAuthenticated() && user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
      return hasRole(Role.ADMIN);
  };

  const canAccess = (requiredRole?: Role, requiredRoles?: Role[]): boolean => {
    if (!isAuthenticated || !user) return false;

    if (requiredRole) return user.role === requiredRole;
    if (requiredRoles) return requiredRoles.includes(user.role);

    return true; // Si no se especifican roles, cualquier usuario autenticado puede acceder
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    canAccess,
    user,
    isAuthenticated,
  };
}

interface PermissionErrorProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PermissionError({
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a esta sección.",
  showBackButton = true,
  onBack,
}: PermissionErrorProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", p: 3 }}>
          <Stack spacing={3} alignItems="center">
            {/* Icono de seguridad */}
            <Avatar
              sx={{
                bgcolor: "error.light",
                width: 64,
                height: 64,
                mb: 1,
              }}
            >
              <ShieldIcon sx={{ fontSize: 32, color: "error.main" }} />
            </Avatar>

            {/* Título */}
            <Typography
              variant="h5"
              component="h1"
              color="error.main"
              fontWeight="bold"
            >
              {title}
            </Typography>

            {/* Mensaje */}
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>

            {/* Advertencia */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: "text.secondary" }}
            >
              <AlertTriangleIcon fontSize="small" />
              <Typography variant="body2">
                Contacta al administrador si crees que esto es un error
              </Typography>
            </Stack>

            {/* Botón de volver */}
            {showBackButton && (
              <Button
                variant="outlined"
                startIcon={<ArrowLeftIcon />}
                onClick={handleBack}
                fullWidth
                sx={{ mt: 2 }}
              >
                Volver
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
