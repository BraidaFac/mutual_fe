"use client";

import { FormField } from "@/components/shared";
import { documentosService } from "@/services/index";
import { Documento } from "@/types/index";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";

interface DocumentoDialogProps {
  open: boolean;
  documento: Documento | null;
  modoEdicion: boolean;
  onClose: () => void;
  onGuardado: () => void;
}

interface DocumentoFormData {
  nombre: string;
  descripcion: string;
}

export default function DocumentoDialog({
  open,
  documento,
  modoEdicion,
  onClose,
  onGuardado,
}: DocumentoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentoFormData>({
    nombre: "",
    descripcion: "",
  });
  const [errors, setErrors] = useState<Partial<DocumentoFormData>>({});

  useEffect(() => {
    if (open) {
      if (modoEdicion && documento) {
        setFormData({
          nombre: documento.nombre,
          descripcion: documento.descripcion || "",
        });
      } else {
        setFormData({ nombre: "", descripcion: "" });
      }
      setErrors({});
      setError(null);
    }
  }, [open, documento, modoEdicion]);

  const validateForm = (): boolean => {
    const newErrors: Partial<DocumentoFormData> = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
      };

      if (modoEdicion && documento) {
        await documentosService.update(documento.documentoId, dataToSend);
      } else {
        await documentosService.create(dataToSend);
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar documento"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof DocumentoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {modoEdicion ? "Editar Documento" : "Nuevo Documento"}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormField
            type="text"
            name="nombre"
            label="Nombre del Documento"
            value={formData.nombre}
            onChange={(value) => handleFieldChange("nombre", value)}
            error={errors.nombre}
            required
            disabled={loading}
            placeholder="Ej: DNI, Recibo de Sueldo, etc."
          />

          <FormField
            type="text"
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={(value) => handleFieldChange("descripcion", value)}
            disabled={loading}
            multiline
            rows={3}
            placeholder="Descripción del documento"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
