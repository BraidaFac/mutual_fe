"use client";

import { FormField } from "@/components/shared";
import { fuerzasService } from "@/services/index";
import { Fuerza } from "@/types/index";
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

interface FuerzaDialogProps {
  open: boolean;
  fuerza: Fuerza | null;
  modoEdicion: boolean;
  onClose: () => void;
  onGuardado: () => void;
}

interface FuerzaFormData {
  nombre: string;
  descripcion: string;
}

export default function FuerzaDialog({
  open,
  fuerza,
  modoEdicion,
  onClose,
  onGuardado,
}: FuerzaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FuerzaFormData>({
    nombre: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState<Partial<FuerzaFormData>>({});

  useEffect(() => {
    if (open) {
      if (modoEdicion && fuerza) {
        setFormData({
          nombre: fuerza.nombre,
          descripcion: fuerza.descripcion || "",
        });
      } else {
        setFormData({
          nombre: "",
          descripcion: "",
        });
      }
      setErrors({});
      setError(null);
    }
  }, [open, fuerza, modoEdicion]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FuerzaFormData> = {};

    if (!formData.nombre) {
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
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      };

      if (modoEdicion && fuerza) {
        console.log(fuerza.id);

        await fuerzasService.update(fuerza.id, dataToSend);
      } else {
        await fuerzasService.create(dataToSend);
      }

      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar fuerza");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FuerzaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title = modoEdicion ? "Editar Fuerza" : "Nueva Fuerza";

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
            label="Nombre de la Fuerza"
            value={formData.nombre}
            onChange={(value) => handleFieldChange("nombre", value)}
            error={errors.nombre}
            required
            disabled={loading}
            placeholder="Ej: Gendarmería Nacional, Policía Federal, etc."
          />

          <FormField
            type="text"
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={(value) => handleFieldChange("descripcion", value)}
            error={errors.descripcion}
            disabled={loading}
            multiline
            rows={3}
            placeholder="Descripción opcional de la fuerza o entidad"
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
