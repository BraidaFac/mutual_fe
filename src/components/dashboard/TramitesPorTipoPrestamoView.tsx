"use client";

import { EstadisticasPorTipoPrestamo } from "@/types/index";
import { Box, Paper, Typography } from "@mui/material";

interface TramitesPorTipoPrestamoViewProps {
  estadisticasPorTipoPrestamo: EstadisticasPorTipoPrestamo[];
}

export default function TramitesPorTipoPrestamoView({
  estadisticasPorTipoPrestamo,
}: TramitesPorTipoPrestamoViewProps) {
  if (estadisticasPorTipoPrestamo.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No hay datos de tipos de préstamo para mostrar
        </Typography>
      </Paper>
    );
  }

  const colores = [
    "#1976d2",
    "#2e7d32",
    "#d32f2f",
    "#ed6c02",
    "#9c27b0",
    "#0288d1",
    "#c62828",
    "#7b1fa2",
  ];

  const total = estadisticasPorTipoPrestamo.reduce(
    (acc, stat) => acc + stat.cantidad,
    0
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>
        Trámites por Tipo de Préstamo
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
          gap={2}
          mb={3}
        >
          {estadisticasPorTipoPrestamo.map((estadistica, index) => {
            const color = colores[index % colores.length];
            const porcentaje =
              total > 0 ? (estadistica.cantidad / total) * 100 : 0;

            return (
              <Paper
                key={estadistica.tipoPrestamo}
                sx={{
                  p: 2,
                  border: `2px solid ${color}40`,
                  backgroundColor: `${color}10`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 4,
                    backgroundColor: color,
                    borderRadius: 1,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                  noWrap
                  title={estadistica.tipoPrestamo}
                >
                  {estadistica.tipoPrestamo}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={color}>
                  {estadistica.cantidad}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {porcentaje.toFixed(1)}% del total
                </Typography>
              </Paper>
            );
          })}
        </Box>

        {/* Barra de progreso visual */}
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Distribución Visual
          </Typography>
          <Box
            display="flex"
            height={40}
            borderRadius={2}
            overflow="hidden"
            border="1px solid #e0e0e0"
          >
            {estadisticasPorTipoPrestamo.map((estadistica, index) => {
              const color = colores[index % colores.length];
              const porcentaje =
                total > 0 ? (estadistica.cantidad / total) * 100 : 0;

              if (porcentaje === 0) return null;

              return (
                <Box
                  key={estadistica.tipoPrestamo}
                  sx={{
                    width: `${porcentaje}%`,
                    backgroundColor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      opacity: 0.8,
                      filter: "brightness(1.1)",
                    },
                  }}
                  title={`${estadistica.tipoPrestamo}: ${
                    estadistica.cantidad
                  } (${porcentaje.toFixed(1)}%)`}
                >
                  {porcentaje > 5 && `${porcentaje.toFixed(0)}%`}
                </Box>
              );
            })}
          </Box>

          {/* Leyenda */}
          <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
            {estadisticasPorTipoPrestamo.map((estadistica, index) => {
              const color = colores[index % colores.length];
              return (
                <Box
                  key={estadistica.tipoPrestamo}
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: color,
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {estadistica.tipoPrestamo}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
