/**
 * Diálogo para ver los detalles de un template de importación
 */

"use client";

import { ImportTemplate } from "@/types/index";
import { ArrowForward, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TemplateDetailDialogProps {
  open: boolean;
  template: ImportTemplate | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function TemplateDetailDialog({
  open,
  template,
  onClose,
  onEdit,
}: TemplateDetailDialogProps) {
  if (!template) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{template.nombre}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={template.entity.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          {/* Descripción */}
          {template.descripcion && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Descripción
              </Typography>
              <Typography variant="body1">{template.descripcion}</Typography>
            </Box>
          )}

          {/* Información general */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Configuración del archivo
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Tipo de archivo
                </Typography>
                <Typography variant="body2">
                  {template.fileType.toUpperCase()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Tiene encabezados
                </Typography>
                <Typography variant="body2">
                  {template.headerRow === 0 ? "Sí" : "No"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Fila de inicio
                </Typography>
                <Typography variant="body2">{template.dataStartRow}</Typography>
              </Grid>
              {template.fileType === "csv" && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Delimitador
                  </Typography>
                  <Typography variant="body2">
                    {template.csvDelimiter === ","
                      ? "Coma (,)"
                      : template.csvDelimiter === ";"
                      ? "Punto y coma (;)"
                      : template.csvDelimiter === "\t"
                      ? "Tabulación"
                      : `"${template.csvDelimiter}"`}
                  </Typography>
                </Grid>
              )}
              {template.fileType === "xlsx" && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Hoja
                  </Typography>
                  <Typography variant="body2">
                    {template.xlsxSheet ?? "Primera hoja"}
                  </Typography>
                </Grid>
              )}
              {template.provincia && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Provincia
                  </Typography>
                  <Typography variant="body2">
                    {template.provincia.nombre}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Mapeo de columnas */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Mapeo de columnas ({template.columnMappings.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Columna origen</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Propiedad destino</TableCell>
                    <TableCell>Transformación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {template.columnMappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No hay mapeos configurados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    template.columnMappings.map((mapping, index) => (
                      <TableRow key={mapping.id || index}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mapping.sourceColumn}
                            size="small"
                            variant="outlined"
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {mapping.sourceColumn === "Header de Columna"
                              ? "Índice"
                              : "Header"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <ArrowForward fontSize="small" color="action" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mapping.targetProperty}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                              {mapping.defaultValue ? (
                            <Typography variant="body2">{mapping.defaultValue}</Typography>
                          ) : (
                            <Typography variant="body2">Ninguna</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Metadatos */}
          <Box>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Creado
                </Typography>
                <Typography variant="body2">
                  {formatDate(template.createdAt)}
                </Typography>
              </Box>
              {template.updatedAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Última modificación
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(template.updatedAt)}
                  </Typography>
                </Box>
              )}
              {template.createdBy && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Creado por
                  </Typography>
                  <Typography variant="body2">{template.createdBy}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" startIcon={<Edit />} onClick={onEdit}>
          Editar Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}
