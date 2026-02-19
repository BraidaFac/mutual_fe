/**
 * Paso 2 del formulario: Datos del Trámite
 * Componente para configurar monto, tipo de préstamo y observaciones
 */
import { FormField } from "@/components/shared";
import {
  TipoPrestamo,
  tipoPrestamoOptions,
  TramiteFormData,
} from "@/types/index";
import {
  AccountBalance as BankIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { Box, Grid, InputAdornment, Typography } from "@mui/material";
import React from "react";

interface TramiteFormStepDatosProps {
  tramite: TramiteFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<TramiteFormData>) => void;
}

export const TramiteFormStepDatos: React.FC<TramiteFormStepDatosProps> = ({
  tramite,
  errors,
  onChange,
}) => {
  const handleFieldChange = (
    field: keyof TramiteFormData,
    value: string | number,
  ) => {
    onChange({ [field]: value });
  };

  const formatMonto = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleMontoChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
    handleFieldChange("montoSolicitado", numericValue);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <BankIcon color="primary" />
        <Typography variant="h6">Datos del Trámite</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormField
            type="select"
            name="tipoPrestamo"
            label="Tipo de Préstamo"
            value={tramite.tipoPrestamo || ""}
            onChange={(value) =>
              handleFieldChange("tipoPrestamo", value as TipoPrestamo)
            }
            options={tipoPrestamoOptions}
            required
            error={errors["tramite.tipoPrestamo"]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormField
            fullWidth
            label="Monto Solicitado"
            type="number"
            value={tramite.montoSolicitado || ""}
            onChange={(value) => handleMontoChange(value)}
            name="montoSolicitado"
            required
            error={errors["tramite.montoSolicitado"]}
            slotProps={{
              input: {
                inputProps: {
                  min: 0,
                  step: 1000,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormField
            fullWidth
            multiline
            rows={1}
            label="Observaciones"
            type="text"
            name="observaciones"
            value={tramite.observaciones || ""}
            onChange={(value) => handleFieldChange("observaciones", value)}
            placeholder="Información adicional sobre el trámite, condiciones especiales, etc."
            error={errors["tramite.observaciones"]}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
        <Typography variant="subtitle2" color="primary.main" gutterBottom>
          Resumen del Trámite
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            <strong>Tipo:</strong>{" "}
            {tipoPrestamoOptions.find(
              (opt) => opt.value === tramite.tipoPrestamo,
            )?.label || "No seleccionado"}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatMonto(tramite.montoSolicitado ?? 0)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
