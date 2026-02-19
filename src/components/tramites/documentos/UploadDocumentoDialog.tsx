/**
 * Dialog para subir documentos con confirmación
 * Muestra el componente UploadDocumento y permite confirmar o cancelar la subida
 */
import { TramiteDocumento } from "@/types/index";
import {
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { UploadDocumento } from "./UploadDocumento";

interface UploadDocumentoDialogProps {
  open: boolean;
  documento: TramiteDocumento | null;
  onClose: () => void;
  onConfirm: (documento: TramiteDocumento, file: File) => Promise<void>;
  loading?: boolean;
}

export const UploadDocumentoDialog: React.FC<UploadDocumentoDialogProps> = ({
  open,
  documento,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleCargarDocumento = (doc: TramiteDocumento, file: File) => {
    setArchivoSeleccionado(file);
    setError(null);
  };

  const handleConfirmar = async () => {
    if (!archivoSeleccionado || !documento) {
      setError("Por favor seleccione un archivo");
      return;
    }

    try {
      await onConfirm(documento, archivoSeleccionado);
      handleCerrar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el archivo"
      );
    }
  };

  const handleCerrar = () => {
    setArchivoSeleccionado(null);
    setError(null);
    onClose();
  };

  if (!documento) return null;

  return (
    <Dialog
      open={open}
      onClose={!loading ? handleCerrar : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" component="span">
            Subir Documento
          </Typography>
          <Chip
            label={documento.estado}
            size="small"
            color={
              documento.estado === "Pendiente"
                ? "warning"
                : documento.estado === "Rechazado"
                ? "error"
                : "default"
            }
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Documento:</strong> {documento.documento?.nombre}
          </Typography>
          {documento.archivoNombre && (
            <Typography variant="body2" color="text.secondary">
              <strong>Archivo actual:</strong> {documento.archivoNombre}
            </Typography>
          )}
        </Box>

        {documento && (
          <UploadDocumento
            documentoCargado={documento}
            onCargarDocumento={handleCargarDocumento}
          />
        )}

        {archivoSeleccionado && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "success.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "success.main",
            }}
          >
            <Typography variant="body2" color="success.main" gutterBottom>
              ✓ Archivo seleccionado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Nombre:</strong> {archivoSeleccionado.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Tamaño:</strong>{" "}
              {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Tipo:</strong> {archivoSeleccionado.type}
            </Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "error.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "error.main",
            }}
          >
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCerrar}
          disabled={loading}
          startIcon={<CloseIcon />}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          disabled={!archivoSeleccionado || loading}
          variant="contained"
          color="primary"
          startIcon={<CheckIcon />}
        >
          {loading ? "Subiendo..." : "Aceptar y Subir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
