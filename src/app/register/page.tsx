"use client";

import { useAuth } from "@/context/AuthContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { RegisterData, Role } from "@/types/index";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<
    RegisterData & { confirmPassword: string; acceptTerms: boolean }
  >({
    username: "",
    role: Role.REPRESENTANTE,
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    telefono: "",
    representanteName: "",
  });

  const { register } = useAuth();
  const { showSuccess } = useErrorHandler();
  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Limpiar mensajes cuando el usuario empiece a escribir
      if (error) setError("");
      if (success) setSuccess("");
    };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError("El nombre de usuario es requerido");
      return false;
    }

    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Ingresa un email válido");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      const response = await register(registerData);

      if (response) {
        showSuccess(
          "Usuario registrado exitosamente. Redirigiendo al login..."
        );
        router.push("/login");
      }
    } catch {
      setError("Error al registrar usuario");
    } finally {
      setLoading(false);
    }
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
            Registro de Usuario
          </Typography>
        </Box>

        {/* Formulario de Registro */}
        <Card elevation={8} sx={{ width: "100%", maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Crear Cuenta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange("username")}
                margin="normal"
                required
                autoFocus
                autoComplete="username"
                disabled={loading}
                helperText="Mínimo 3 caracteres, sin espacios"
              />

           <TextField
                fullWidth
                label="Nombre de Representante"
                name="representanteName"
                value={formData.representanteName}
                onChange={handleChange("representanteName")}
                margin="normal"
                required
                autoComplete="representanteName"
                disabled={loading}
                helperText="Nombre del representante"
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                margin="normal"
                required
                autoComplete="email"
                disabled={loading}
              />

          <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                type="string"
                value={formData.telefono}
                onChange={handleChange("telefono")}
                margin="normal"
                required
                autoComplete="telefono"
                disabled={loading}
              />

          <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as Role,
                    }))
                  }
                >
                  {Object.values(Role).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select> 
              </FormControl>

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange("password")}
                margin="normal"
                required
                autoComplete="new-password"
                disabled={loading}
                helperText="Mínimo 6 caracteres"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                margin="normal"
                required
                autoComplete="new-password"
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms}
                    onChange={handleChange("acceptTerms")}
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2">
                    Acepto los{" "}
                    <Link href="#" color="primary" underline="hover">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="#" color="primary" underline="hover">
                      política de privacidad
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? "Registrando..." : "Crear Cuenta"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    component={NextLink}
                    href="/login"
                    color="primary"
                    underline="hover"
                  >
                    Iniciar Sesión
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
