"use client";

/**
 * Error boundary para páginas autenticadas
 */

import { ErrorOutline, Home, Refresh } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Paper, Stack } from "@mui/material";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error en páginas autenticadas:", error);
  }, [error]);

  return (
    <Box sx={{ py: 4, maxWidth: 800, mx: "auto" }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error" icon={<ErrorOutline fontSize="large" />}>
          <AlertTitle sx={{ fontWeight: 600, mb: 2 }}>
            ¡Algo salió mal!
          </AlertTitle>
          {error.message || "Ha ocurrido un error inesperado"}

          {process.env.NODE_ENV === "development" && error.digest && (
            <Box
              component="small"
              sx={{ display: "block", mt: 1, opacity: 0.7 }}
            >
              Error ID: {error.digest}
            </Box>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Refresh />}
              onClick={reset}
            >
              Reintentar
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Home />}
              href="/"
            >
              Ir al Dashboard
            </Button>
          </Stack>
        </Alert>
      </Paper>
    </Box>
  );
}
