"use client";

import { Tramite } from "@/types/index";
import {
  ArrowForward,
  CalendarToday,
  Call,
  Info,
  MoreVert,
  Person,
  Warning,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface TramiteMiniCardProps {
  tramite: Tramite;
  onVerDetalle?: (tramite: Tramite) => void;
  onAvanzarPaso?: (tramite: Tramite) => void;
  onContactarCliente?: (tramite: Tramite) => void;
}

export default function TramiteMiniCard({
  tramite,
  onVerDetalle,
  onAvanzarPaso,
  onContactarCliente,
}: TramiteMiniCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getDiasDesdeCreacion = (fecha: Date) => {
    const hoy = new Date();
    const fechaCreacion = new Date(fecha);
    const diffTime = Math.abs(hoy.getTime() - fechaCreacion.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dias = getDiasDesdeCreacion(tramite.createdAt);
  const esUrgente =
    tramite.pasoActual.diasMaximoSinAvance &&
    dias > tramite.pasoActual.diasMaximoSinAvance;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVerDetalle = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onVerDetalle?.(tramite);
  };

  const handleAvanzarPaso = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onAvanzarPaso?.(tramite);
  };

  const handleContactarCliente = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onContactarCliente?.(tramite);
  };

  return (
    <Card
      sx={{
        transition: "all 0.2s ease",
        border: esUrgente ? "2px solid #d32f2f" : "1px solid #e0e0e0",
        borderLeft: `4px solid ${tramite.pasoActual.color || "#1976d2"}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
          borderColor: esUrgente
            ? "#d32f2f"
            : tramite.pasoActual.color || "#1976d2",
        },
        position: "relative",
      }}
    >
      {esUrgente && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: 8,
            backgroundColor: "#d32f2f",
            color: "white",
            borderRadius: "12px",
            px: 1,
            py: 0.5,
            fontSize: "0.7rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            boxShadow: 2,
          }}
        >
          <Warning sx={{ fontSize: 14 }} />
          URGENTE
        </Box>
      )}

      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header con ID y menú */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            #{tramite.id}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={handleVerDetalle}>
              <Info sx={{ mr: 1, fontSize: 18 }} />
              Ver Detalles
            </MenuItem>
            <MenuItem onClick={handleAvanzarPaso}>
              <ArrowForward sx={{ mr: 1, fontSize: 18 }} />
              Avanzar Paso
            </MenuItem>
            <MenuItem onClick={handleContactarCliente}>
              <Call sx={{ mr: 1, fontSize: 18 }} />
              Contactar Cliente
            </MenuItem>
          </Menu>
        </Box>

        {/* Cliente */}
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Person sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
            {tramite.cliente.fullName}
          </Typography>
        </Box>

        {/* Tipo de préstamo */}
        <Chip
          label={tramite.tipoPrestamo}
          size="small"
          sx={{
            mb: 1.5,
            backgroundColor: `${tramite.pasoActual.color}20`,
            color: tramite.pasoActual.color || "#1976d2",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />

        {/* Monto solicitado */}
        {tramite.montoSolicitado && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            <strong>Monto:</strong> ${tramite.montoSolicitado.toLocaleString()}
          </Typography>
        )}

        {/* Fecha de creación */}
        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {format(new Date(tramite.createdAt), "dd/MM/yyyy", { locale: es })}
          </Typography>
        </Box>

        {/* Estado del tiempo */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color={esUrgente ? "error" : "text.secondary"}
            fontWeight={esUrgente ? 600 : 400}
          >
            {dias} {dias === 1 ? "día" : "días"} en el sistema
            {tramite.pasoActual.diasMaximoSinAvance && (
              <> (máx: {tramite.pasoActual.diasMaximoSinAvance})</>
            )}
          </Typography>
        </Box>

        {/* Botones de acción rápida */}
        <Box display="flex" gap={1} mt={2}>
          <Tooltip title="Ver detalles completos">
            <IconButton
              size="small"
              onClick={handleVerDetalle}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "primary.main",
                color: "primary.main",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white",
                },
              }}
            >
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Avanzar al siguiente paso">
            <IconButton
              size="small"
              onClick={handleAvanzarPaso}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "success.main",
                color: "success.main",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "success.light",
                  color: "white",
                },
              }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Contactar cliente">
            <IconButton
              size="small"
              onClick={handleContactarCliente}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "info.main",
                color: "info.main",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "info.light",
                  color: "white",
                },
              }}
            >
              <Call fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}

