/**
 * Componente para mostrar el estado actual de un trámite de forma visual
 * Siguiendo principios de Single Responsibility
 */
import { StatusChip } from "@/components/shared";
import { Tramite } from "@/types/index";
import {
  AccountBalance as BankIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@mui/material";
import React from "react";

interface TramiteStatusCardProps {
  tramite: Tramite;
  showProgress?: boolean;
  compact?: boolean;
}

export const TramiteStatusCard: React.FC<TramiteStatusCardProps> = ({
  tramite,
  showProgress = true,
  compact = false,
}) => {
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const calculateProgress = () => {
    if (!tramite.flujo || !tramite.pasoActual) return 0;

    const totalPasos = tramite.flujo.pasos.length;
    const pasoActualSecuencia = tramite.pasoActual.orden;

    return Math.round((pasoActualSecuencia / totalPasos) * 100);
  };

  const progress = calculateProgress();

  if (compact) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: "16px !important" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                {tramite.cliente.fullName}
              </Typography>
            </Box>
            <StatusChip
              status={tramite.pasoActual?.nombre || "Sin paso"}
              color={
                tramite.pasoActual?.color as
                  | "urgent"
                  | "warning"
                  | "success"
                  | "info"
                  | "default"
              }
              size="small"
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {formatMonto(tramite.montoSolicitado || 0)}
            </Typography>
            {showProgress && (
              <Box
                sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Trámite #{tramite.id}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="body1" fontWeight="medium">
                {tramite.cliente.fullName}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {tramite.cliente.email}
            </Typography>
          </Box>
          <StatusChip
            status={tramite.pasoActual?.nombre || "Sin paso"}
            color={
              tramite.pasoActual?.color as
                | "urgent"
                | "warning"
                | "success"
                | "info"
                | "default"
            }
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BankIcon color="secondary" fontSize="small" />
            <Typography variant="body2">
              <strong>Monto:</strong>{" "}
              {formatMonto(tramite.montoSolicitado || 0)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimelineIcon color="secondary" fontSize="small" />
            <Typography variant="body2">
              <strong>Flujo:</strong> {tramite.flujo?.nombre || "Sin flujo"}
            </Typography>
          </Box>
        </Box>

        {showProgress && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Progreso del trámite
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress}% completado
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {tramite.observaciones && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Observaciones:</strong>
            </Typography>
            <Typography variant="body2">{tramite.observaciones}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Creado:{" "}
            {new Date(tramite.createdAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          {tramite.fechaUltimoContacto && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Último contacto:{" "}
              {new Date(tramite.fechaUltimoContacto).toLocaleDateString(
                "es-AR",
              )}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
