"use client";

import { useAuth } from "@/context/AuthContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { LoginData } from "@/types/index";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, user } = useAuth();
  const { showSuccess } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  // Obtener la URL de origen (de dónde venía el usuario)
  const from = searchParams.get("from") || "/";

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push(from);
    }
  }, [user, router, from]);

  const handleChange =
    (field: keyof LoginData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev: LoginData) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Limpiar error cuando el usuario empiece a escribir
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await login(formData);
    if (response) {
      // Redirigir a la página de origen o al dashboard
      router.push(from);
      showSuccess("¡Bienvenido! Sesión iniciada correctamente");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            fontWeight="bold"
          >
            CRM Mutual
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistema de Gestión de Trámites
          </Typography>
        </Box>

        {/* Formulario de Login */}
        <Card elevation={8} sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Iniciar Sesión
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange("username")}
                margin="normal"
                required
                autoFocus
                autoComplete="username"
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                margin="normal"
                required
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Iniciar Sesión
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    component={NextLink}
                    href="/register"
                    color="primary"
                    underline="hover"
                  >
                    Registrarse
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 CRM Mutual. Todos los derechos reservados.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
