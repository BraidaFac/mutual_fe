"use client";

/**
 * Error boundary global para la aplicación
 * Captura errores de runtime en cualquier página
 * Next.js lo muestra automáticamente cuando ocurre un error
 */

import { ErrorOutline, Home, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const theme = useTheme();

  useEffect(() => {
    // Log del error para debugging
    console.error("Error capturado por error.tsx:", error);
  }, [error]);

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
            p: 4,
            textAlign: "center",
            borderTop: `4px solid ${theme.palette.error.main}`,
            maxWidth: 600,
            width: "100%",
          }}
        >
          {/* Icono de error */}
          <Box
            sx={{
              display: "inline-flex",
              p: 3,
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              mb: 3,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: theme.palette.error.main,
              }}
            />
          </Box>

          {/* Título */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.error.main,
              mb: 2,
            }}
          >
            ¡Algo salió mal!
          </Typography>

          {/* Descripción */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.7 }}
          >
            Lo sentimos, ha ocurrido un error inesperado. Puedes intentar
            recargar la página o volver al inicio.
          </Typography>

          {/* Detalles del error (solo en desarrollo) */}
          {process.env.NODE_ENV === "development" && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                textAlign: "left",
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: theme.palette.error.dark,
                }}
              >
                {error.message}
              </Typography>
              {error.digest && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Error ID: {error.digest}
                </Typography>
              )}
            </Paper>
          )}

          {/* Botones de acción */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Refresh />}
              onClick={reset}
              sx={{ minWidth: 150 }}
            >
              Reintentar
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<Home />}
              href="/"
              sx={{ minWidth: 150 }}
            >
              Ir al Inicio
            </Button>
          </Box>

          {/* Información adicional */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 3 }}
          >
            Si el problema persiste, contacta con el administrador
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

