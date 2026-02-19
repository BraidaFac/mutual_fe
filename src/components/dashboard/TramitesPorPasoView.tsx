"use client";

import { EstadisticasPorPaso, Tramite } from "@/types/index";
import { Box, Paper, Typography } from "@mui/material";
import TramiteMiniCard from "./TramiteMiniCard";

interface TramitesPorPasoViewProps {
  estadisticasPorPaso: EstadisticasPorPaso[];
  onVerDetalle?: (tramite: Tramite) => void;
  onAvanzarPaso?: (tramite: Tramite) => void;
  onContactarCliente?: (tramite: Tramite) => void;
}

export default function TramitesPorPasoView({
  estadisticasPorPaso,
  onVerDetalle,
  onAvanzarPaso,
  onContactarCliente,
}: TramitesPorPasoViewProps) {
  if (estadisticasPorPaso.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No hay trámites para mostrar con los filtros seleccionados
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Vista Kanban - Trámites por Paso
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {estadisticasPorPaso.length} pasos activos
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 2,
          minHeight: "70vh",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#555",
            },
          },
        }}
      >
        {estadisticasPorPaso.map((estadistica) => (
          <Paper
            key={estadistica.pasoId}
            elevation={2}
            sx={{
              minWidth: 320,
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fafafa",
              border: `3px solid ${estadistica.pasoColor}40`,
              borderRadius: 2,
            }}
          >
            {/* Header del paso */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${estadistica.pasoColor} 0%, ${estadistica.pasoColor}dd 100%)`,
                color: "white",
                p: 2.5,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {estadistica.pasoNombre}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">
                  {estadistica.cantidad}{" "}
                  {estadistica.cantidad === 1 ? "trámite" : "trámites"}
                </Typography>
              </Box>
            </Box>

            {/* Lista de trámites */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flex: 1,
                overflowY: "auto",
                maxHeight: "calc(70vh - 100px)",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: estadistica.pasoColor || "#1976d2",
                  borderRadius: "3px",
                },
              }}
            >
              {estadistica.tramites.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    opacity: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No hay trámites en este paso
                  </Typography>
                </Box>
              ) : (
                estadistica.tramites.map((tramite) => (
                  <TramiteMiniCard
                    key={tramite.id}
                    tramite={tramite}
                    onVerDetalle={onVerDetalle}
                    onAvanzarPaso={onAvanzarPaso}
                    onContactarCliente={onContactarCliente}
                  />
                ))
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
