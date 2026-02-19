"use client";

import { EstadisticasPorFuerza } from "@/types/index";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Paper,
  Typography,
} from "@mui/material";

interface TramitesPorFuerzaViewProps {
  estadisticasPorFuerza: EstadisticasPorFuerza[];
}

export default function TramitesPorFuerzaView({
  estadisticasPorFuerza,
}: TramitesPorFuerzaViewProps) {
  if (estadisticasPorFuerza.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No hay datos de fuerzas para mostrar
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" mb={3}>
        Trámites por Fuerza
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {estadisticasPorFuerza.map((estadistica) => (
          <Accordion
            key={estadistica.fuerzaId}
            defaultExpanded={estadistica.cantidad > 0}
            sx={{
              border: "1px solid #e0e0e0",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f5f5f5",
                "&:hover": {
                  backgroundColor: "#eeeeee",
                },
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                pr={2}
              >
                <Typography variant="h6" fontWeight="bold">
                  {estadistica.fuerzaNombre}
                </Typography>
                <Chip
                  label={`${estadistica.cantidad} trámites`}
                  color="primary"
                  size="small"
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3 }}>
              {estadistica.porPaso.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                  No hay trámites para esta fuerza
                </Typography>
              ) : (
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                  gap={2}
                >
                  {estadistica.porPaso.map((paso) => (
                    <Paper
                      key={paso.pasoId}
                      sx={{
                        p: 2,
                        border: `2px solid ${paso.pasoColor}40`,
                        backgroundColor: `${paso.pasoColor}10`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: paso.pasoColor,
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                        noWrap
                      >
                        {paso.pasoNombre}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        {paso.cantidad}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {paso.cantidad === 1 ? "trámite" : "trámites"}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
