"use client";
import { ArrowBack, Construction, Home, Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            maxWidth: 600,
            width: "100%",
          }}
        >
          {/* Icono animado */}
          <Box
            sx={{
              mb: 4,
              position: "relative",
              display: "inline-block",
            }}
          >
            <Construction
              sx={{
                fontSize: 120,
                color: "warning.main",
                animation: "bounce 2s infinite",
                "@keyframes bounce": {
                  "0%, 20%, 50%, 80%, 100%": {
                    transform: "translateY(0)",
                  },
                  "40%": {
                    transform: "translateY(-30px)",
                  },
                  "60%": {
                    transform: "translateY(-15px)",
                  },
                },
              }}
            />
            <Settings
              sx={{
                position: "absolute",
                top: 10,
                right: -10,
                fontSize: 30,
                color: "primary.main",
                animation: "spin 3s linear infinite",
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
          </Box>

          {/* Título principal */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "3rem", md: "4rem" },
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
            }}
          >
            404
          </Typography>

          {/* Mensaje principal */}
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: "medium",
              color: "text.primary",
            }}
          >
            ¡Estamos en construcción!
          </Typography>

          {/* Descripción */}
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              lineHeight: 1.6,
              maxWidth: 400,
              mx: "auto",
            }}
          >
            La página que buscas no existe o está siendo desarrollada. Nuestro
            equipo está trabajando arduamente para mejorar tu experiencia.
          </Typography>

          {/* Información adicional */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 1,
              }}
            >
              <strong>CRM Préstamos</strong> - Sistema de Gestión
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              Mientras tanto, puedes navegar por las secciones disponibles
            </Typography>
          </Paper>

          {/* Botones de acción */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "medium",
                background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)",
                },
              }}
            >
              Ir al Inicio
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "medium",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.50",
                  borderColor: "primary.dark",
                },
              }}
            >
              Volver Atrás
            </Button>
          </Stack>

          {/* Decoración inferior */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              &quot;Construyendo el futuro de la gestión financiera, una línea
              de código a la vez&quot;
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
