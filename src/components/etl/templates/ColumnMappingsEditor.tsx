/**
 * Editor de mapeos de columnas
 * Permite agregar, editar y eliminar mapeos de columnas
 */

"use client";

import { ColumnMapping, EntityProperty } from "@/types/index";
import { Add } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ColumnMappingRow from "./ColumnMappingRow";

interface ColumnMappingsEditorProps {
  mappings: ColumnMapping[];
  entityProperties: EntityProperty[];
  onAddMapping: () => void;
  onUpdateMapping: (id: string, updates: Partial<ColumnMapping>) => void;
  onRemoveMapping: (id: string) => void;
  onClearMappings: () => void;
  disabled?: boolean;
  error?: string;
}

export default function ColumnMappingsEditor({
  mappings,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onClearMappings,
  entityProperties,
  disabled = false,
  error,
}: ColumnMappingsEditorProps) {

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">Mapeo de Columnas</Typography>
            <Typography variant="body2" color="text.secondary">
              Configura cómo se mapean las columnas del archivo a las
              propiedades del sistema
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            {mappings.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={onClearMappings}
                disabled={disabled}
              >
                Limpiar todo
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddMapping}
              disabled={disabled}
            >
              Agregar mapeo
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {/* Error general */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Lista de mapeos */}
        {mappings.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              backgroundColor: "action.hover",
              borderRadius: 1,
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              No hay mapeos configurados
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={onAddMapping}
              disabled={disabled}
              sx={{ mt: 1 }}
            >
              Agregar primer mapeo
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {mappings.map((mapping, index) => (
              <ColumnMappingRow
                key={mapping.temporalId || mapping.id?.toString() || index}
                mapping={mapping}
                availableProperties={entityProperties}
                onUpdate={(updates) => onUpdateMapping(mapping.id?.toString() || mapping.temporalId || "", updates)}
                onRemove={() => onRemoveMapping(mapping.id?.toString() || mapping.temporalId || "")}
                disabled={disabled}
              />
            ))}
          </Stack>
        )}

      </Stack>
    </Paper>
  );
}
