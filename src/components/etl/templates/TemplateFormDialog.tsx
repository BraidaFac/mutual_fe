/**
 * Diálogo de formulario para crear/editar templates de importación
 * Implementa un wizard de configuración con validaciones
 */

"use client";

import { useTemplateForm } from "@/hooks/etl";
import { Entity, FileType, ImportTemplate, ImportTemplateFormData, Provincia } from "@/types/index";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ColumnMappingsEditor from "./ColumnMappingsEditor";

interface TemplateFormDialogProps {
  open: boolean;
  template: ImportTemplate | null;
  modoEdicion: boolean;
  onClose: () => void;
  onGuardado: (data : ImportTemplateFormData) => Promise<void>;
  provincias: Provincia[];
  entities: Entity[];
}


const FILE_TYPE_OPTIONS: { value: FileType; label: string }[] = [
  { value: "xlsx", label: "Excel (XLSX)" },
];

const STEPS = [
  "Información básica",
  "Configuración del archivo",
  "Mapeo de columnas",
];

export default function TemplateFormDialog({
  open,
  template,
  modoEdicion,
  onClose,
  onGuardado,
  provincias,
  entities,
}: TemplateFormDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasHeaders, setHasHeaders] = useState<boolean>(false);

  const {
    formData,
    setName,
    setDescription,
    setEntity,
    setProvinciaId,
    setFileType,
    setDataStartRow,
    setCsvDelimiter,
    addMapping,
    updateMapping,
    removeMapping,
    clearMappings,
    validate,
    getFieldError,
    resetForm,
    loadTemplate,
  } = useTemplateForm(entities, template||undefined);

  // Reset form cuando se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError(null);
      if (modoEdicion && template) {
        loadTemplate(template);
        setHasHeaders(template.headerRow > 0);
      } else {
        resetForm();
      }
    }
  }, [open, template, modoEdicion, loadTemplate, resetForm]);

  const handleNext = () => {
    // Validar paso actual antes de avanzar
    if (activeStep === 0) {
      if (!formData.nombre.trim()) {
        setError("El nombre es requerido");
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setError("Por favor, corrige los errores antes de guardar");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      
      await onGuardado(formData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el template"
      );
    } finally {
      setSaving(false);
    }
  };

  const title = modoEdicion
    ? "Editar Template de Importación"
    : "Nuevo Template de Importación";

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Nombre del template"
                value={formData.nombre}
                onChange={(e) => setName(e.target.value)}
                error={!!getFieldError("nombre")}
                helperText={
                  getFieldError("nombre") ||
                  "Un nombre descriptivo para identificar este template"
                }
                required
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Descripción"
                value={formData.descripcion || ""}
                onChange={(e) => setDescription(e.target.value)}
                error={!!getFieldError("descripcion")}
                helperText={
                  getFieldError("descripcion") ||
                  "Opcional: describe el propósito de este template"
                }
                multiline
                rows={2}
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!getFieldError("entityType")}>
                <InputLabel required>Tipo de entidad</InputLabel>
                <Select
                  value={formData.entity.name}
                  label="Entidad"
                  onChange={(e) => setEntity(e.target.value)}
                  disabled={saving}
                >
                  {entities.map((opt, index) => (
                    <MenuItem key={index} value={opt.name}>
                      {opt.displayName}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {getFieldError("entityType") || "Tipo de datos a importar"}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Provincia/Origen</InputLabel>
                <Select
                  value={formData.provinciaId || ""}
                  label="Provincia/Origen"
                  onChange={(e) =>
                    setProvinciaId(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  disabled={saving}
                >
                  <MenuItem value="">
                    <em>Sin provincia específica</em>
                  </MenuItem>
                  {provincias.map((prov) => (
                    <MenuItem key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Opcional: asociar este template a una provincia específica
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!getFieldError("fileType")}>
                <InputLabel required>Tipo de archivo</InputLabel>
                <Select
                  value={formData.fileType}
                  label="Tipo de archivo"
                  onChange={(e) => setFileType(e.target.value as FileType)}
                  disabled={saving}
                >
                  {FILE_TYPE_OPTIONS.map((opt, index) => (
                    <MenuItem key={index} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {getFieldError("fileType") ||
                    "Formato del archivo a importar"}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasHeaders}
                      onChange={(e) => setHasHeaders(e.target.checked)}
                      disabled={saving}
                    />
                  }
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', m: 0 }}
                  label="Tiene encabezados"
                  labelPlacement="bottom"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Fila de inicio de datos después del encabezado"
                type="number"
                value={formData.dataStartRow}
                onChange={(e) => setDataStartRow(parseInt(e.target.value) || 0)}
                error={!!getFieldError("dataStartRow")}
                helperText={
                  getFieldError("dataStartRow")
                }
                fullWidth
                disabled={saving}
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Grid>

            {formData.fileType === "csv" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Delimitador CSV"
                  value={formData.csvDelimiter || ","}
                  onChange={(e) => setCsvDelimiter(e.target.value)}
                  error={!!getFieldError("csvDelimiter")}
                  helperText={
                    getFieldError("csvDelimiter") ||
                    "Carácter separador (coma, punto y coma, tab)"
                  }
                  fullWidth
                  disabled={saving}
                  slotProps={{
                    htmlInput: { maxLength: 1 },
                  }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Box>
              <ColumnMappingsEditor
                mappings={formData.columnMappings}
                entityProperties={formData.entity.entityProperties}
                onAddMapping={addMapping}
                onUpdateMapping={updateMapping} 
                onRemoveMapping={removeMapping}
                onClearMappings={clearMappings}
                disabled={saving}
                error={getFieldError("columnMappings")}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: "80vh" },
        },
      }}
    >
      <DialogTitle>
        <Stack spacing={2}>
          <Typography variant="h5">{title}</Typography>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ py: 2 }}>{renderStepContent()}</Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={2}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={saving}>
              Atrás
            </Button>
          )}

          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={saving}>
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Template"}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
