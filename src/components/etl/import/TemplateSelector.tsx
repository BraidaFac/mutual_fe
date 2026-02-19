/**
 * Selector de templates para importación
 * Muestra los templates disponibles con información relevante
 */

"use client";

import { ImportTemplate } from "@/types/index";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface TemplateSelectorProps {
  templates: ImportTemplate[];
  selectedTemplate: ImportTemplate | null;
  onSelect: (template: ImportTemplate | null) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
  loading = false,
  disabled = false,
  error,
}: TemplateSelectorProps) {
  return (
    <Autocomplete
      value={selectedTemplate}
      onChange={(_, newValue) => onSelect(newValue)}
      options={templates}
      getOptionLabel={(option) => option.nombre}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Template de importación"
          placeholder="Selecciona un template..."
          error={!!error}
          helperText={
            error ||
            "Selecciona el template que define cómo procesar el archivo"
          }
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        return (
          <Box component="li" key={key} {...restProps} sx={{ py: 1.5 }}>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {option.nombre}
                </Typography>
                <Chip
                  label={option.fileType.toUpperCase()}
                  size="small"
                  color={option.fileType === "csv" ? "success" : "warning"}
                  sx={{ height: 20 }}
                />
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {option.entity.displayName.toUpperCase()}
                </Typography>
                {option.provincia?.nombre && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.provincia?.nombre.toUpperCase()}
                    </Typography>
                  </>
                )}
              </Stack>

              {option.descripcion && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.descripcion}
                </Typography>
              )}
            </Stack>
          </Box>
        );
      }}
      noOptionsText={
        loading ? "Cargando templates..." : "No hay templates disponibles"
      }
      fullWidth
    />
  );
}
