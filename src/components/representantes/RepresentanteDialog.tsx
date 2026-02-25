"use client";

import { FormField } from "@/components/shared";
import { representantesService } from "@/services/index";
import { Representante, RepresentanteCreatePayload } from "@/types/index";
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

interface RepresentanteDialogProps {
  open: boolean;
  representante: Representante | null;
  modoEdicion: boolean;
  onClose: () => void;
  onGuardado: () => void;
}

interface RepresentanteFormData {
  fullName: string;
  email: string;
  telefono: string;
  username: string;
  password: string;
}

export default function RepresentanteDialog({
  open,
  representante,
  modoEdicion,
  onClose,
  onGuardado,
}: RepresentanteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RepresentanteFormData>({
    fullName: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<RepresentanteFormData>>({});

  useEffect(() => {
    if (open) {
      if (modoEdicion && representante) {
        const baseData = {
          fullName: representante.fullName,
          email: representante.email,
          telefono: representante.telefono || "",
          password: "",
        };
        if (representante.user?.username) {
          setFormData({
            ...baseData,
            username: representante.user.username,
          });
        } else {
          representantesService
            .getById(representante.id)
            .then((full) =>
              setFormData({
                ...baseData,
                username: full.user?.username || "",
              }),
            )
            .catch(() => setFormData({ ...baseData, username: "" }));
        }
      } else {
        setFormData({
          fullName: "",
          email: "",
          telefono: "",
          username: "",
          password: "",
        });
      }
      setErrors({});
      setError(null);
    }
  }, [open, representante, modoEdicion]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RepresentanteFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    }

    if (!modoEdicion && !formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!modoEdicion && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      if (modoEdicion && representante) {
        const dataToSend: Partial<Representante> = {
          fullName: formData.fullName,
          email: formData.email,
          telefono: formData.telefono || undefined,
        };
        if (formData.password) {
          (dataToSend as Record<string, unknown>).user = {
            username: formData.username,
            password: formData.password,
          };
        }
        await representantesService.update(representante.id, dataToSend);
      } else {
        const dataToSend: RepresentanteCreatePayload = {
          fullName: formData.fullName,
          email: formData.email,
          telefono: formData.telefono || undefined,
          username: formData.username,
          password: formData.password,
        };
        await representantesService.create(dataToSend);
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar representante",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof RepresentanteFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title = modoEdicion ? "Editar Representante" : "Nuevo Representante";

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
            name="fullName"
            label="Nombre completo"
            value={formData.fullName}
            onChange={(value) => handleFieldChange("fullName", value)}
            error={errors.fullName}
            required
            disabled={loading}
            placeholder="Ej: Juan Pérez"
          />

          <FormField
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={(value) => handleFieldChange("email", value)}
            error={errors.email}
            disabled={loading || modoEdicion}
            required
            placeholder="correo@ejemplo.com"
          />

          <FormField
            type="tel"
            name="telefono"
            label="Teléfono"
            value={formData.telefono}
            onChange={(value) => handleFieldChange("telefono", value)}
            error={errors.telefono}
            disabled={loading}
            placeholder="+54 11 1234-5678"
          />

          <FormField
            type="text"
            name="username"
            label="Nombre de usuario"
            value={formData.username}
            onChange={(value) => handleFieldChange("username", value)}
            error={errors.username}
            required
            disabled={loading || modoEdicion}
            placeholder="Usuario para iniciar sesión"
          />

          <FormField
            type="password"
            name="password"
            label={modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
            value={formData.password}
            onChange={(value) => handleFieldChange("password", value)}
            error={errors.password}
            required={!modoEdicion}
            disabled={loading}
            placeholder={
              modoEdicion
                ? "Dejar vacío para mantener la actual"
                : "Mínimo 6 caracteres"
            }
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
