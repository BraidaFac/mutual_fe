"use client";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useFlujoSelection } from "@/hooks/useFlujoSelection";
import { useTramiteManagement } from "@/hooks/useTramiteManagement";
import { clientesService } from "@/services/clientesService";
import {
  Cliente,
  ClienteFormData,
  Tramite,
  TramiteDocumento,
  TramiteFormData,
  validateForm,
} from "@/types/index";
import {
  NavigateBefore as BackIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  TipoCliente,
  TramiteFormStepCliente,
} from "./form-steps/TramiteFormStepCliente";
import { TramiteFormStepConfirmacion } from "./form-steps/TramiteFormStepConfirmacion";
import { TramiteFormStepDatos } from "./form-steps/TramiteFormStepDatos";
import { TramiteFormStepDocumentos } from "./form-steps/TramiteFormStepDocumentos";

interface TramiteFormDialogProps {
  open: boolean;
  tramite?: Tramite | null; // Para edición
  onClose: () => void;
  onTramiteCreated?: (tramite: Tramite) => void;
  onTramiteUpdated?: (tramite: Tramite) => void;
}

interface FormData {
  cliente: Cliente | null;
  nuevoCliente: ClienteFormData;
  tramite: TramiteFormData;
  tipoCliente: TipoCliente;
  documentos: TramiteDocumento[];
}

const steps = ["Cliente", "Datos del Trámite", "Documentos", "Confirmación"];

const initialFormData: FormData = {
  cliente: null,
  nuevoCliente: {
    fullName: "",
    dni: undefined,
    email: "",
    telefono: "",
    esSocio: false,
    fuerzaId: undefined,
    provinciaId: undefined,
    observaciones: "",
  },
  tramite: {
    clienteId: undefined,
    montoSolicitado: 0,
    observaciones: "",
    documentos: [],
  },
  tipoCliente: TipoCliente.EXISTENTE,
  documentos: [],
};

export const TramiteFormDialog: React.FC<TramiteFormDialogProps> = ({
  open,
  tramite,
  onClose,
  onTramiteCreated,
  onTramiteUpdated,
}) => {
  const [tramiteState, tramiteActions] = useTramiteManagement();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { loading, error } = tramiteState;
  const { handleError, showSuccess } = useErrorHandler();
  const { createTramite, updateTramite, clearError } = tramiteActions;

  const {
    flujo,
    loading: loadingFlujo,
    error: errorFlujo,
  } = useFlujoSelection({
    cliente: formData.cliente,
    tipoPrestamo: formData.tramite.tipoPrestamo,
  });

  const isEditMode = Boolean(tramite);

  // Inicializar formulario para edición
  useEffect(() => {
    if (open && tramite) {
      setFormData({
        ...initialFormData,
        cliente: tramite.cliente as Cliente,
        tramite: {
          clienteId: tramite.cliente.id,
          montoSolicitado: tramite.montoSolicitado,
          observaciones: tramite.observaciones,
          tipoPrestamo: tramite.tipoPrestamo,
          documentos: tramite.documentos,
        },
        tipoCliente: TipoCliente.EXISTENTE,
      });
    } else if (open && !tramite) {
      setFormData(initialFormData);
    }
  }, [open, tramite]);

  const handleClose = useCallback(() => {
    setActiveStep(0);
    setFormData(initialFormData);
    setFormErrors({});
    clearError();
    onClose();
  }, [clearError, onClose]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Cliente
        if (!formData.cliente) {
          errors.cliente = "Debe seleccionar un cliente";
        }

        break;

      case 1: // Datos del trámite
        if (
          !formData.tramite.montoSolicitado ||
          formData.tramite.montoSolicitado <= 0
        ) {
          errors["tramite.montoSolicitado"] = "El monto debe ser mayor a 0";
        }
        break;

      case 2: // Documentos
        // Validación de documentos si es necesaria
        break;

      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNuevoCliente = async () => {
    const errors = validateForm(formData.nuevoCliente);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const nuevoCliente = await clientesService.create(formData.nuevoCliente);
      updateFormData("cliente", nuevoCliente);
      updateTipoClienteFormData(TipoCliente.EXISTENTE);
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      setFormErrors({});
      updateFormData("nuevoCliente", initialFormData.nuevoCliente);
      showSuccess("Cliente guardado correctamente");
    } catch (err) {
      handleError(err);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      const clienteId = formData.cliente?.id;

      const tramiteData: TramiteFormData = {
        ...formData.tramite,
        flujoId: flujo!.id,
        clienteId,
        cliente: formData.cliente as Partial<Cliente>,
        documentos: formData.documentos,
      };

      if (isEditMode && tramite) {
        const updatedTramite = await updateTramite(tramite.id, tramiteData);
        if (updatedTramite) {
          onTramiteUpdated?.(updatedTramite);
          handleClose();
        }
      } else {
        const newTramite = await createTramite(tramiteData);
        if (newTramite) {
          onTramiteCreated?.(newTramite);
          handleClose();
        }
      }
    } catch {
      // Error ya manejado por el hook
    }
  };

  const updateFormData = <T extends keyof FormData>(
    section: T,
    data: Partial<FormData[T]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Partial<FormData[T]>),
        ...data,
      },
    }));
  };

  const updateTipoClienteFormData = (data: TipoCliente) => {
    setFormData((prev) => ({
      ...prev,
      tipoCliente: data,
    }));
  };

  const onChangeDocumentos = useCallback((documentos: TramiteDocumento[]) => {
    setFormData((prev) => ({
      ...prev,
      documentos,
    }));
  }, []);

  const canAdvanceToNext = (): boolean => {
    switch (activeStep) {
      case 0:
        return Boolean(formData.cliente);

      case 1:
        return Boolean(
          formData.tramite.montoSolicitado &&
          formData.tramite.montoSolicitado > 0,
        );
      case 2:
        return true; // Los documentos son opcionales en este paso
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <TramiteFormStepCliente
            tipoCliente={formData.tipoCliente as TipoCliente}
            cliente={formData.cliente}
            nuevoCliente={formData.nuevoCliente}
            errors={formErrors}
            onTipoClienteChange={(tipo) => updateTipoClienteFormData(tipo)}
            onClienteChange={(cliente) => updateFormData("cliente", cliente)}
            onNuevoClienteChange={(data) =>
              updateFormData("nuevoCliente", data)
            }
            onSubmitNuevoCliente={() => handleSubmitNuevoCliente()}
          />
        );
      case 1:
        return (
          <TramiteFormStepDatos
            tramite={formData.tramite}
            errors={formErrors}
            onChange={(data) => updateFormData("tramite", data)}
          />
        );
      case 2:
        return (
          <TramiteFormStepDocumentos
            cliente={formData.cliente}
            flujo={flujo}
            documentos={formData.documentos}
            onChange={(documentos) => onChangeDocumentos(documentos)}
          />
        );
      case 3:
        return (
          <TramiteFormStepConfirmacion
            formData={formData}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: "90vh" },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            {isEditMode ? "Editar Trámite" : "Nuevo Trámite"}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {(loading || loadingFlujo) && <LinearProgress sx={{ mb: 2 }} />}

        {(error || errorFlujo) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error || errorFlujo}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>{renderStepContent()}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            startIcon={<BackIcon />}
          >
            Anterior
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || !canAdvanceToNext()}
            endIcon={<NextIcon />}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !canAdvanceToNext()}
            startIcon={<SaveIcon />}
          >
            {isEditMode ? "Actualizar" : "Crear"} Trámite
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
