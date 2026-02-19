"use client";

import { Refresh } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button } from "@mui/material";

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorAlert({
  error,
  onRetry,
  title = "Error",
}: ErrorAlertProps) {
  return (
    <Box py={2}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<Refresh />}
            >
              Reintentar
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {error}
      </Alert>
    </Box>
  );
}
