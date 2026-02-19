"use client";

import { FormField } from "@/components/shared";
import { clientesService } from "@/services/index";
import {
  ClienteFormData,
  ClienteFormDataErrors,
  Fuerza,
  Provincia,
  Representante,
  validateForm
} from "@/types/index";
import { Lead } from "@/types/lead.type";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";

interface LeadDialogProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onGuardado: () => void;
  provincias: Provincia[];
  fuerzas: Fuerza[];
  representantes: Representante[];
}

export default function LeadDialog({
  open,
  lead,
  onClose,
  onGuardado,
  provincias,
  fuerzas,
  representantes,
}: LeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>({
    fullName: "",
    dni: undefined,
    email: "",
    telefono: "",
    provinciaId: undefined,
    fuerzaId: undefined,
    representanteId: undefined,
    esSocio: false,
    observaciones: "",
  });

  const [errors, setErrors] = useState<Partial<ClienteFormDataErrors>>({});

  useEffect(() => {
    if (open) {
      if (lead) {
        setFormData({
          fullName: lead.fullName || "",
          email: lead.email || "",
          telefono: lead.telefono || "",
          provinciaId: lead.provincia?.id,
          fuerzaId: lead.fuerza?.id,
          representanteId: lead.representante?.id,
          esSocio: false,
          observaciones: "",
        });
      } else {
        onClose();
      }
      setErrors({});
      setError(null);
    }
  }, [open, lead, onClose]);

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (lead && lead.id) {
        await clientesService.createByLead(lead.id!, formData);
      }
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof ClienteFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title =  "Nuevo Cliente";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="text"
              name="nombre"
              label="Nombre"
              value={formData.fullName}
              onChange={(value) => handleFieldChange("fullName", value)}
              error={errors.fullName}
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={(value) => handleFieldChange("email", value)}
              error={errors.email}
              required
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="tel"
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={(value) => handleFieldChange("telefono", value)}
              error={errors.telefono}
              required
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="text"
              name="dni"
              label="DNI"
              value={formData.dni?.toString() || ""}
              onChange={(value) => handleFieldChange("dni", value)}
              error={errors.dni}
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="select"
              name="fuerzaId"
              label="Fuerza"
              value={formData.fuerzaId ?? ""}
              onChange={(value) => handleFieldChange("fuerzaId", value)}
              options={fuerzas.map((l) => ({
                value: l.id.toString(),
                label: `${l.nombre}`,
              }))}
              error={errors.fuerzaId}
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="select"
              name="representanteId"
              label="Representante"
              value={formData.representanteId ?? ""}
              onChange={(value) => handleFieldChange("representanteId", value)}
              options={representantes.map((l) => ({
                value: l.id.toString(),
                label: `${l.fullName}`,
              }))}
              error={errors.representanteId}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="select"
              name="provinciaId"
              label="Provincia"
              value={formData.provinciaId ?? ""}
              onChange={(value) => handleFieldChange("provinciaId", value)}
              options={provincias.map((l) => ({
                value: l.id.toString(),
                label: `${l.nombre}`,
              }))}
              error={errors.provinciaId ?? ""}
              required
              disabled={loading}
            />
          </Grid>

          <Grid size={12}>
            <FormField
              type="text"
              name="observaciones"
              label="Observaciones"
              value={formData.observaciones ?? ""}
              onChange={(value) => handleFieldChange("observaciones", value)}
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>
        </Grid>
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
