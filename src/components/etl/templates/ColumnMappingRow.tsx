/**
 * Fila individual de mapeo de columna
 * Permite configurar origen y destino de un mapeo
 */

"use client";

import {
  ColumnMapping,
  EntityProperty,
  RelationProperty,
  TargetProperty,
} from "@/types/index";
import { Delete } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

interface ColumnMappingRowProps {
  mapping: ColumnMapping;
  availableProperties: EntityProperty[];
  onUpdate: (updates: Partial<ColumnMapping>) => void;
  onRemove: () => void;
  disabled?: boolean;
  error?: string;
}

export default function ColumnMappingRow({
  mapping,
  availableProperties,
  onUpdate,
  onRemove,
  disabled = false,
  error,
}: ColumnMappingRowProps) {
  // Encontrar la propiedad seleccionada actual para incluirla en las opciones
  const currentProperty = availableProperties.find(
    (p) => p.name === mapping.targetProperty,
  );

  // Las propiedades disponibles más la actual (si está seleccionada)
  const propertyOptions =
    mapping.targetProperty && !currentProperty
      ? [
          ...availableProperties,
          {
            name: mapping.targetProperty,
            displayName: mapping.targetProperty,
            type: "string" as const,
            isRequired: true,
          },
        ]
      : availableProperties;

  const onUpdateTargetProperty = (property: TargetProperty) => {
    if (property === TargetProperty.PROVINCIA) {
      onUpdate({
        targetProperty: property,
        relationProperty: RelationProperty.PROVINCIA,
      });
    } else if (property === TargetProperty.FUERZA) {
      onUpdate({
        targetProperty: property,
        relationProperty: RelationProperty.FUERZA,
      });
    } else if (property === TargetProperty.REPRESENTANTE) {
      onUpdate({
        targetProperty: property,
        relationProperty: RelationProperty.REPRESENTANTE,
      });
    } else {
      onUpdate({ targetProperty: property, relationProperty: undefined });
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: error ? "error.main" : "divider",
        borderRadius: 1,
        backgroundColor: error ? "error.lighter" : "background.paper",
        "&:hover": {
          backgroundColor: error ? "error.lighter" : "action.hover",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Columna origen */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "space-between",
            minWidth: 150,
          }}
        >
          <TextField
            label={"Nombre de columna"}
            value={mapping.sourceColumn ?? ""}
            placeholder={"Ej: nombre, apellido, email..."}
            size="small"
            disabled={disabled}
            type={"text"}
            onChange={(e) => {
              onUpdate({ sourceColumn: e.target.value ?? "" });
            }}
          />
        </Box>

        {/* Flecha indicadora */}
        <Box sx={{ pt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            →
          </Typography>
        </Box>

        {/* Propiedad destino */}
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <FormControl fullWidth size="small" error={!!error}>
            <InputLabel>Propiedad destino</InputLabel>
            <Select
              value={mapping.targetProperty ?? ""}
              label="Propiedad destino"
              onChange={(e) => {
                const value = e.target.value as string;
                onUpdateTargetProperty(value as TargetProperty);
              }}
              disabled={disabled}
            >
              <MenuItem value="">
                <em>Seleccionar...</em>
              </MenuItem>
              {propertyOptions.map((prop, index) => (
                <MenuItem
                  key={`${prop.name}-${index}`}
                  value={prop.name as TargetProperty}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{prop.displayName}</span>
                    {prop.isRequired && (
                      <Typography
                        variant="caption"
                        color="error"
                        component="span"
                      >
                        *
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="span"
                    >
                      ({prop.type})
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        </Box>

        {/* Botón eliminar */}
        <Box sx={{ pt: 1 }}>
          <Tooltip title="Eliminar mapeo">
            <IconButton
              size="small"
              color="error"
              onClick={onRemove}
              disabled={disabled}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
    </Box>
  );
}
