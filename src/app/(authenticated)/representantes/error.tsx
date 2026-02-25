"use client";

/**
 * Error boundary para la página de representantes
 */

import { ErrorOutline, Refresh } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Paper } from "@mui/material";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error en representantes:", error);
  }, [error]);

  return (
    <Box sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          icon={<ErrorOutline fontSize="large" />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={reset}
            >
              Reintentar
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            Error al cargar representantes
          </AlertTitle>
          {error.message || "Ha ocurrido un error inesperado"}

          {process.env.NODE_ENV === "development" && error.digest && (
            <Box component="small" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
              Error ID: {error.digest}
            </Box>
          )}
        </Alert>
      </Paper>
    </Box>
  );
}
