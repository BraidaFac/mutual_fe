/**
 * Componente Stepper para mostrar el progreso del flujo de trámite
 * Permite visualizar pasos completados, actual y pendientes
 */
import { PasoTramite, Tramite } from "@/types/index";
import {
  NavigateBefore as BackIcon,
  CheckCircle as CheckIcon,
  PlayArrow as CurrentIcon,
  NavigateNext as NextIcon,
  RadioButtonUnchecked as PendingIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";

interface TramiteStepperProps {
  tramite: Tramite;
  orientation?: "horizontal" | "vertical";
  showActions?: boolean;
  onStepAction?: (action: "next" | "back", paso: PasoTramite) => void;
  canAdvance?: boolean;
  canGoBack?: boolean;
  loading?: boolean;
}

export const TramiteStepper: React.FC<TramiteStepperProps> = ({
  tramite,
  orientation = "horizontal",
  showActions = false,
  onStepAction,
  canAdvance = false,
  canGoBack = false,
  loading = false,
}) => {
  if (!tramite.flujo || !tramite.pasoActual) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <Typography color="text.secondary">
          No hay flujo definido para este trámite
        </Typography>
      </Paper>
    );
  }

  const pasos = tramite.flujo.pasos.sort((a, b) => a.orden - b.orden);

  const activeStep = pasos.findIndex(
    (paso) => paso.id === tramite.pasoActual.id,
  );

  const getStepIcon = (index: number, paso: PasoTramite) => {
    if (index < activeStep) {
      return <CheckIcon color="success" />;
    }
    if (index === activeStep) {
      return <CurrentIcon color="primary" />;
    }
    return <PendingIcon color="disabled" />;
  };

  const getStepStatus = (index: number, paso: PasoTramite) => {
    if (index < activeStep) return "completed";
    if (index === activeStep) return "active";
    return "pending";
  };

  const renderStepContent = (paso: PasoTramite, index: number) => {
    const status = getStepStatus(index, paso);

    return (
      <Box sx={{ py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {paso.nombre}
          </Typography>

          {status === "active" && (
            <Chip label="Actual" size="small" color="primary" />
          )}
        </Box>

        {paso.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {paso.descripcion}
          </Typography>
        )}

        {paso.diasMaximoSinAvance && (
          <Typography variant="caption" color="text.secondary">
            Máximo {paso.diasMaximoSinAvance} días
          </Typography>
        )}

        {showActions && status === "active" && (
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {canGoBack && index > 0 && (
              <Tooltip title="Retroceder paso">
                <IconButton
                  size="small"
                  onClick={() => onStepAction?.("back", pasos[index - 1])}
                  disabled={loading}
                  color="secondary"
                >
                  <BackIcon />
                </IconButton>
              </Tooltip>
            )}
            {canAdvance && index < pasos.length - 1 && (
              <Tooltip title="Avanzar paso">
                <IconButton
                  size="small"
                  onClick={() => onStepAction?.("next", pasos[index + 1])}
                  disabled={loading}
                  color="primary"
                >
                  <NextIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (orientation === "vertical") {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Flujo: {tramite.flujo.nombre}
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {pasos.map((paso, index) => (
            <Step key={paso.id} completed={index < activeStep}>
              <StepLabel icon={getStepIcon(index, paso)}>
                <Typography variant="subtitle2">{paso.nombre}</Typography>
              </StepLabel>
              <StepContent>{renderStepContent(paso, index)}</StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Flujo: {tramite.flujo.nombre}
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {pasos.map((paso, index) => (
          <Step key={paso.id} completed={index < activeStep}>
            <StepLabel
              icon={getStepIcon(index, paso)}
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: "0.875rem",
                  fontWeight: index === activeStep ? 600 : 400,
                },
              }}
            >
              {paso.nombre}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {showActions && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          {canGoBack && activeStep > 0 && (
            <Tooltip title={`Retroceder a: ${pasos[activeStep - 1]?.nombre}`}>
              <IconButton
                onClick={() => onStepAction?.("back", pasos[activeStep - 1])}
                disabled={loading}
                color="secondary"
                size="large"
              >
                <BackIcon />
              </IconButton>
            </Tooltip>
          )}
          {canAdvance && activeStep < pasos.length - 1 && (
            <Tooltip title={`Avanzar a: ${pasos[activeStep + 1]?.nombre}`}>
              <IconButton
                onClick={() => onStepAction?.("next", pasos[activeStep + 1])}
                disabled={loading}
                color="primary"
                size="large"
              >
                <NextIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Paper>
  );
};
