"use client";

import { StatusChip } from "@/components/shared";
import { Tramite } from "@/types/index";
import {
  AccessTime,
  Business,
  Edit,
  Email,
  Phone,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

interface TramiteCardProps {
  tramite: Tramite;
  onEdit?: (tramite: Tramite) => void;
  onView?: (tramite: Tramite) => void;
}

export default function TramiteCard({
  tramite,
  onEdit,
  onView,
}: TramiteCardProps) {
  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const diasSinContacto = tramite.fechaUltimoContacto
    ? Math.floor(
        (new Date().getTime() -
          new Date(tramite.fechaUltimoContacto).getTime()) /
          (1000 * 3600 * 24)
      )
    : null;

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* Header con cliente y acciones */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography variant="h6" component="h3" noWrap>
              {tramite.cliente.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tramite.tipoPrestamo} -{" "}
              {formatMonto(tramite.montoSolicitado || 0)}
            </Typography>
          </Box>

          <Box display="flex" gap={0.5}>
            {onView && (
              <IconButton
                size="small"
                color="info"
                onClick={() => onView(tramite)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            )}
            {onEdit && (
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(tramite)}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Información de contacto */}
        <Stack spacing={1} mb={2}>
          {tramite.cliente?.telefono && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">
                {tramite.cliente.telefono}
              </Typography>
            </Box>
          )}

          {tramite.cliente?.email && (
            <Box display="flex" alignItems="center" gap={1}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" noWrap>
                {tramite.cliente.email}
              </Typography>
            </Box>
          )}

          {tramite.cliente.fuerza && (
            <Box display="flex" alignItems="center" gap={1}>
              <Business fontSize="small" color="action" />
              <Typography variant="body2">
                {tramite.cliente.fuerza?.nombre}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Estado y fecha */}
        <Box display="flex" flexDirection="column" gap={1}>
          {tramite.pasoActual && (
            <StatusChip
              status={tramite.pasoActual.nombre}
              color={
                tramite.pasoActual.color as
                  | "urgent"
                  | "warning"
                  | "success"
                  | "info"
                  | "default"
              }
            />
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Creado: {formatFecha(tramite.createdAt)}
            </Typography>
          </Box>

          {tramite.fechaUltimoContacto && (
            <Typography variant="caption" color="text.secondary">
              Último contacto: {formatFecha(tramite.fechaUltimoContacto)}
              {diasSinContacto !== null && diasSinContacto > 0 && (
                <Chip
                  label={`${diasSinContacto} día${
                    diasSinContacto > 1 ? "s" : ""
                  }`}
                  size="small"
                  color={
                    diasSinContacto > 7
                      ? "error"
                      : diasSinContacto > 3
                      ? "warning"
                      : "default"
                  }
                  sx={{ ml: 1, fontSize: "0.65rem" }}
                />
              )}
            </Typography>
          )}
        </Box>

        {/* Observaciones si las hay */}
        {tramite.observaciones && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {tramite.observaciones}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
