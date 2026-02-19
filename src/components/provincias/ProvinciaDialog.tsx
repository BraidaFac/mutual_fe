"use client";

import { FormField } from "@/components/shared";
import { provinciasService } from "@/services/index";
import { Provincia } from "@/types/index";
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

interface ProvinciaDialogProps {
  open: boolean;
  provincia: Provincia | null;
  modoEdicion: boolean;
  onClose: () => void;
  onGuardado: () => void;
}

interface ProvinciaFormData {
  nombre: string;
}

export default function ProvinciaDialog({
  open,
  provincia,
  modoEdicion,
  onClose,
  onGuardado,
}: ProvinciaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProvinciaFormData>({
    nombre: "",
  });

  const [errors, setErrors] = useState<Partial<ProvinciaFormData>>({});

  useEffect(() => {
    if (open) {
      if (modoEdicion && provincia) {
        setFormData({
          nombre: provincia.nombre,
        });
      } else {
        setFormData({
          nombre: "",
        });
      }
      setErrors({});
      setError(null);
    }
  }, [open, provincia, modoEdicion]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProvinciaFormData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la Provincia es requerido";
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
      };

      if (modoEdicion && provincia) {
        await provinciasService.update(provincia.id, dataToSend);
      } else {
        await provinciasService.create({
          nombre: dataToSend.nombre,
        });
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar Provincia"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof ProvinciaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title = modoEdicion ? "Editar Provincia" : "Nueva Provincia";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>

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
            label="Nombre de la Provincia"
            value={formData.nombre}
            onChange={(value) => handleFieldChange("nombre", value)}
            error={errors.nombre}
            required
            disabled={loading}
            placeholder="Ej: San Miguel de Tucumán, Villa Carlos Paz, etc."
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
