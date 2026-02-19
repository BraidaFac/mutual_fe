"use client";

import { Tramite } from "@/types/index";
import { ArrowForward, Call, Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface AccionesRapidasDialogProps {
  open: boolean;
  tramite: Tramite | null;
  accion: "avanzar" | "contactar" | null;
  onClose: () => void;
  onConfirmar: (
    tramite: Tramite,
    accion: "avanzar" | "contactar",
    datos?: { observaciones?: string }
  ) => void;
}

export default function AccionesRapidasDialog({
  open,
  tramite,
  accion,
  onClose,
  onConfirmar,
}: AccionesRapidasDialogProps) {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!tramite || !accion) return;

    setLoading(true);
    try {
      await onConfirmar(tramite, accion, { observaciones });
      setObservaciones("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObservaciones("");
    onClose();
  };

  if (!tramite || !accion) return null;

  const titulo =
    accion === "avanzar"
      ? "Avanzar Trámite al Siguiente Paso"
      : "Registrar Contacto con Cliente";

  const icono =
    accion === "avanzar" ? (
      <ArrowForward color="success" />
    ) : (
      <Call color="info" />
    );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {icono}
            <Typography variant="h6">{titulo}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Trámite:</strong> #{tramite.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Cliente:</strong> {tramite.cliente.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Paso Actual:</strong> {tramite.pasoActual.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Tipo:</strong> {tramite.tipoPrestamo}
          </Typography>
        </Box>

        {accion === "avanzar" && (
          <Box
            sx={{
              backgroundColor: "success.light",
              color: "success.contrastText",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2">
              El trámite avanzará al siguiente paso del flujo según las reglas
              de transición configuradas.
            </Typography>
          </Box>
        )}

        {accion === "contactar" && (
          <Box
            sx={{
              backgroundColor: "info.light",
              color: "info.contrastText",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2">
              Se actualizará la fecha de último contacto con el cliente.
            </Typography>
          </Box>
        )}

        <TextField
          label="Observaciones (opcional)"
          multiline
          rows={4}
          fullWidth
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder={
            accion === "avanzar"
              ? "Describe brevemente el motivo del avance..."
              : "Describe brevemente el contacto realizado..."
          }
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color={accion === "avanzar" ? "success" : "info"}
          disabled={loading}
          startIcon={icono}
        >
          {loading
            ? "Procesando..."
            : accion === "avanzar"
            ? "Avanzar Paso"
            : "Registrar Contacto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

