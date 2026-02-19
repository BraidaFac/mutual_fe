/**
 * Componente Timeline para mostrar el historial de pasos del trámite
 * Visualización cronológica de todos los cambios de estado
 */
import { HistorialPaso } from "@/types/index";
import {
  PlayArrow as ActiveIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import React from "react";

interface TramiteTimelineProps {
  historial: HistorialPaso[];
  currentStepId?: number;
  compact?: boolean;
  showUserInfo?: boolean;
}

export const TramiteTimeline: React.FC<TramiteTimelineProps> = ({
  historial,
  currentStepId,
  compact = false,
  showUserInfo = true,
}) => {
  if (!historial || historial.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No hay historial disponible para este trámite
        </Typography>
      </Paper>
    );
  }

  const formatDate = (date: Date, includeTime: boolean = true) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return new Date(date).toLocaleDateString("es-AR", options);
  };

  const calculateDuration = (fechaInicio: Date, fechaFin?: Date) => {
    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const diffMs = fin.getTime() - inicio.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? "s" : ""}`;
    }
    if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    }
    return "Menos de 1 hora";
  };

  const getStepIcon = (item: HistorialPaso, isActive: boolean) => {
    if (isActive) {
      return <ActiveIcon sx={{ color: "primary.main" }} />;
    }
    if (item.fechaFin) {
      return <CompletedIcon sx={{ color: "success.main" }} />;
    }
    return <PendingIcon sx={{ color: "warning.main" }} />;
  };

  const getStepColor = (item: HistorialPaso, isActive: boolean) => {
    if (isActive) return "primary";
    if (item.fechaFin) return "success";
    return "warning";
  };

  // Ordenar historial por fecha de inicio (más reciente primero)
  const sortedHistorial = [...historial].sort(
    (a, b) =>
      new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
  );

  return (
    <Paper sx={{ p: compact ? 2 : 3 }}>
      <Typography variant="h6" gutterBottom>
        Historial del Trámite
      </Typography>

      <Timeline position="left">
        {sortedHistorial.map((item, index) => {
          const isActive = item.paso.id === currentStepId;
          const isLast = index === sortedHistorial.length - 1;

          return (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent
                sx={{
                  m: "auto 0",
                  minWidth: compact ? "80px" : "120px",
                  maxWidth: compact ? "80px" : "120px",
                }}
                variant="body2"
                color="text.secondary"
              >
                {formatDate(item.fechaInicio, !compact)}
                {item.fechaFin && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="success.main">
                      Finalizado
                    </Typography>
                  </Box>
                )}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getStepColor(item, isActive)}>
                  {getStepIcon(item, isActive)}
                </TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: compact ? 1 : 2 }}>
                <Paper
                  elevation={isActive ? 3 : 1}
                  sx={{
                    p: compact ? 1.5 : 2,
                    backgroundColor: isActive
                      ? "primary.50"
                      : "background.paper",
                    border: isActive ? 1 : 0,
                    borderColor: "primary.main",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.paso.nombre}
                    </Typography>
                    {isActive && (
                      <Chip label="Actual" size="small" color="primary" />
                    )}
                    {item.fechaFin && (
                      <Chip
                        label="Completado"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {!compact && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duración:{" "}
                        {calculateDuration(item.fechaInicio, item.fechaFin)}
                      </Typography>
                      {item.fechaFin && (
                        <Typography variant="body2" color="text.secondary">
                          Finalizado: {formatDate(item.fechaFin)}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {item.observaciones && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {item.observaciones}
                    </Typography>
                  )}

                  {showUserInfo && item.usuarioResponsable && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {item.usuarioResponsable}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};
