"use client";

import { FormField } from "@/components/shared";
import { PasoTramite, ReglaTransicion, TipoPaso } from "@/types/index";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";

interface PasoDialogProps {
  open: boolean;
  onClose: () => void;
  onPasoGuardado: (paso: PasoFormData) => void;
  paso?: PasoTramite | null;
  esEdicion: boolean;
  pasosExistentes: PasoTramite[];
}

export interface PasoFormData {
  id: number | undefined;
  temporalId: string;
  nombre: string;
  descripcion: string;
  orden: number;
  diasMaximoSinAvance: number | undefined;
  tipoPaso: TipoPaso;
  transicionesOrigen: ReglaTransicion[];
  transicionesDestino: ReglaTransicion[];
}

export default function PasoDialog({
  open,
  onClose,
  onPasoGuardado,
  paso,
  esEdicion,
  pasosExistentes,
}: PasoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setPasoFormData] = useState<PasoFormData>({
    id: undefined,
    temporalId: crypto.randomUUID(),
    nombre: "",
    descripcion: "",
    orden: 1,
    diasMaximoSinAvance: undefined,
    transicionesOrigen: [],
    transicionesDestino: [],
    tipoPaso: TipoPaso.INTERMEDIO,
  });

  useEffect(() => {
    if (open && paso && esEdicion) {
      setPasoFormData({
        id: paso.id,
        nombre: paso.nombre,
        temporalId: paso.temporalId,
        descripcion: paso.descripcion || "",
        orden: paso.orden,
        transicionesOrigen: paso.transicionesOrigen,
        transicionesDestino: paso.transicionesDestino,
        diasMaximoSinAvance: paso.diasMaximoSinAvance || undefined,
        tipoPaso: paso.tipoPaso,
      });
    } else if (open && !esEdicion) {
      // Calcular automáticamente la próxima secuencia
      const maxSecuencia = pasosExistentes
        .filter(
          (p) =>
            p.tipoPaso !== TipoPaso.FINAL_EXITOSO &&
            p.tipoPaso !== TipoPaso.FINAL_RECHAZADO,
        )
        .reduce((max, paso) => Math.max(max, paso.orden), 0);

      setPasoFormData({
        id: undefined,
        nombre: "",
        descripcion: "",
        temporalId: crypto.randomUUID(),
        orden: maxSecuencia + 1,
        transicionesOrigen: [],
        transicionesDestino: [],
        diasMaximoSinAvance: undefined,
        tipoPaso:
          maxSecuencia === 0
            ? TipoPaso.INICIAL
            : pasosExistentes.findIndex(
                  (p) => p.tipoPaso === TipoPaso.FINAL_EXITOSO,
                ) > -1
              ? TipoPaso.FINAL_RECHAZADO
              : pasosExistentes.findIndex(
                    (p) => p.tipoPaso === TipoPaso.FINAL_RECHAZADO,
                  ) > -1
                ? TipoPaso.FINAL_EXITOSO
                : TipoPaso.INTERMEDIO,
      });
    }
    setError(null);
  }, [open, paso, esEdicion, pasosExistentes]);

  const handleFieldChange = (
    field: keyof PasoFormData,
    value: string | number | boolean,
  ) => {
    setPasoFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return formData.nombre.trim() !== "" && formData.orden > 0;
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      setError("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      onPasoGuardado(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el paso");
    } finally {
      setLoading(false);
    }
  };

  const handleTipoPasoChange = (value: TipoPaso) => {
    handleFieldChange("tipoPaso", value);

    const maxSecuencia = pasosExistentes
      .filter(
        (p) =>
          p.tipoPaso !== TipoPaso.FINAL_EXITOSO &&
          p.tipoPaso !== TipoPaso.FINAL_RECHAZADO,
      )
      .reduce((max, paso) => Math.max(max, paso.orden), 0);
    if (
      value === TipoPaso.FINAL_EXITOSO ||
      value === TipoPaso.FINAL_RECHAZADO
    ) {
      handleFieldChange("orden", maxSecuencia + 1);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ minHeight: "90vh" }}
    >
      <DialogTitle>
        {esEdicion
          ? "Editar Paso"
          : `Nuevo Paso ${
              formData.tipoPaso === TipoPaso.INICIAL
                ? "Inicial"
                : formData.tipoPaso === TipoPaso.FINAL_EXITOSO
                  ? "Final Exitoso"
                  : formData.tipoPaso === TipoPaso.FINAL_RECHAZADO
                    ? "Final Rechazado"
                    : "Intermedio"
            }`}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormField
              fullWidth
              name="nombre"
              type="text"
              label="Nombre del Paso"
              value={formData?.nombre || ""}
              onChange={(value) => handleFieldChange("nombre", value)}
              placeholder="Ej: Revisión de Documentos"
            />
          </Grid>

          {formData.orden > 1 && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      formData.tipoPaso === TipoPaso.FINAL_EXITOSO ||
                      formData.tipoPaso === TipoPaso.FINAL_RECHAZADO
                    }
                    onChange={(e) => {
                      handleTipoPasoChange(
                        e.target.checked
                          ? TipoPaso.FINAL_EXITOSO
                          : TipoPaso.INTERMEDIO,
                      );
                    }}
                  />
                }
                label="Es final"
              />

              {(formData.tipoPaso === TipoPaso.FINAL_RECHAZADO ||
                formData.tipoPaso === TipoPaso.FINAL_EXITOSO) && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="tipo-final-label">
                    Tipo de Paso Final
                  </InputLabel>
                  <Select
                    labelId="tipo-final-label"
                    value={formData.tipoPaso}
                    label="Tipo final"
                    onChange={(e) =>
                      handleTipoPasoChange(e.target.value as TipoPaso)
                    }
                  >
                    <MenuItem value={TipoPaso.FINAL_EXITOSO}>Exitoso</MenuItem>
                    <MenuItem value={TipoPaso.FINAL_RECHAZADO}>
                      Rechazado
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {!(
            formData.tipoPaso === TipoPaso.FINAL_EXITOSO ||
            formData.tipoPaso === TipoPaso.FINAL_RECHAZADO
          ) && (
            <Grid size={{ xs: 12 }}>
              <FormField
                fullWidth
                type="number"
                name="diasMaximoSinAvance"
                label="Días Máximo"
                value={formData.diasMaximoSinAvance || ""}
                onChange={(value) =>
                  handleFieldChange("diasMaximoSinAvance", Number(value))
                }
                placeholder="Opcional"
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <FormField
              fullWidth
              type="number"
              name="orden"
              label="Orden"
              disabled={
                formData.tipoPaso === TipoPaso.INICIAL ||
                formData.tipoPaso === TipoPaso.FINAL_EXITOSO ||
                formData.tipoPaso === TipoPaso.FINAL_RECHAZADO
              }
              value={formData.orden}
              onChange={(value) => handleFieldChange("orden", value)}
              placeholder="Orden del paso"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormField
              fullWidth
              type="text"
              multiline
              name="descripcion"
              rows={2}
              label="Descripción"
              value={formData.descripcion}
              onChange={(value) => handleFieldChange("descripcion", value)}
              placeholder="Descripción opcional del paso..."
            />
          </Grid>
        </Grid>

        {error && (
          <div style={{ color: "red", marginTop: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isFormValid()}
        >
          {loading ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"} Paso
        </Button>
      </DialogActions>
    </Dialog>
  );
}
