"use client";

import { Fuerza, tipoPrestamoOptions } from "@/types/index";
import { Clear } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

interface FiltrosDashboardProps {
  fuerzas: Fuerza[];
  fuerzaSeleccionada?: number;
  tipoPrestamoSeleccionado?: string;
  onFuerzaChange: (fuerzaId?: number) => void;
  onTipoPrestamoChange: (tipoPrestamo?: string) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosDashboard({
  fuerzas,
  fuerzaSeleccionada,
  tipoPrestamoSeleccionado,
  onFuerzaChange,
  onTipoPrestamoChange,
  onLimpiarFiltros,
}: FiltrosDashboardProps) {
  const handleFuerzaChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value;
    onFuerzaChange(value ? Number(value) : undefined);
  };

  const handleTipoPrestamoChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onTipoPrestamoChange(value || undefined);
  };

  const hayFiltrosActivos = fuerzaSeleccionada || tipoPrestamoSeleccionado;

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Filtros de Visualización
        </Typography>
        {hayFiltrosActivos && (
          <Button
            startIcon={<Clear />}
            onClick={onLimpiarFiltros}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            variant="outlined"
          >
            Limpiar Filtros
          </Button>
        )}
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <FormControl
          sx={{
            minWidth: 200,
            backgroundColor: "white",
            borderRadius: 1,
          }}
          size="small"
        >
          <InputLabel>Fuerza</InputLabel>
          <Select
            value={fuerzaSeleccionada || ""}
            onChange={handleFuerzaChange}
            label="Fuerza"
          >
            <MenuItem value="">Todas las fuerzas</MenuItem>
            {fuerzas.map((fuerza) => (
              <MenuItem key={fuerza.id} value={fuerza.id}>
                {fuerza.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: 250,
            backgroundColor: "white",
            borderRadius: 1,
          }}
          size="small"
        >
          <InputLabel>Tipo de Préstamo</InputLabel>
          <Select
            value={tipoPrestamoSeleccionado || ""}
            onChange={handleTipoPrestamoChange}
            label="Tipo de Préstamo"
          >
            {tipoPrestamoOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {hayFiltrosActivos && (
        <Box mt={2}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Filtros activos:{" "}
            {fuerzaSeleccionada &&
              `Fuerza: ${
                fuerzas.find((f) => f.id === fuerzaSeleccionada)?.nombre ||
                "N/A"
              }`}
            {fuerzaSeleccionada && tipoPrestamoSeleccionado && " | "}
            {tipoPrestamoSeleccionado &&
              `Tipo: ${
                tipoPrestamoOptions.find(
                  (t) => t.value === tipoPrestamoSeleccionado
                )?.label || "N/A"
              }`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
