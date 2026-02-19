/**
 * Panel de resultados de una importación ETL
 * Muestra estado, estadísticas y errores
 */

"use client";

import { ImportExecution, ImportStatus } from "@/types/index";
import {
  Cancel,
  CheckCircle,
  Download,
  Error as ErrorIcon,
  HourglassBottom,
  Refresh,
  Warning,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
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
import { useState } from "react";

interface ImportResultPanelProps {
  execution: ImportExecution;
  onCancel?: () => void;
  onRetry?: () => void;
  onDownloadErrors?: () => void;
  cancelling?: boolean;
}

const STATUS_CONFIG: Record<
  ImportStatus,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "warning"
      | "info";
    icon: React.ReactNode;
    showProgress: boolean;
  }
> = {
  pending: {
    label: "Pendiente",
    color: "default",
    icon: <HourglassBottom />,
    showProgress: false,
  },
  validating: {
    label: "Validando archivo",
    color: "info",
    icon: <CircularProgress size={20} />,
    showProgress: true,
  },
  processing: {
    label: "Procesando",
    color: "primary",
    icon: <CircularProgress size={20} />,
    showProgress: true,
  },
  completed: {
    label: "Completado",
    color: "success",
    icon: <CheckCircle />,
    showProgress: false,
  },
  completed_with_errors: {
    label: "Completado con errores",
    color: "warning",
    icon: <Warning />,
    showProgress: false,
  },
  failed: {
    label: "Fallido",
    color: "error",
    icon: <ErrorIcon />,
    showProgress: false,
  },
};

export default function ImportResultPanel({
  execution,
  onCancel,
  onRetry,
  onDownloadErrors,
  cancelling = false,
}: ImportResultPanelProps) {
  const [showErrors, setShowErrors] = useState(false);

  const statusConfig = STATUS_CONFIG[execution.status];
  const { stats } = execution;
  const isInProgress = ["pending", "validating", "processing"].includes(
    execution.status
  );
  const hasErrors = stats.errors > 0 || execution.errorDetails?.length;

  // Calcular porcentaje de progreso
  const progressPercent =
    stats.totalRead > 0
      ? Math.round(((stats.inserted + stats.errors) / stats.totalRead) * 100)
      : 0;

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "dd/MM/yyyy HH:mm:ss", { locale: es });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          {/* Header con estado */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ color: `${statusConfig.color}.main` }}>
                {statusConfig.icon}
              </Box>
              <Box>
                <Typography variant="h6">
                  Importación #{execution.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {execution.fileName}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              icon={
                isInProgress ? (
                  <CircularProgress size={14} color="inherit" />
                ) : undefined
              }
            />
          </Stack>

          {/* Barra de progreso */}
          {isInProgress && (
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Procesando registros...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          )}

          <Divider />

          {/* Estadísticas */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard label="Leídos" value={stats.totalRead} color="info" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Insertados"
                value={stats.inserted}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Duplicados (archivo)"
                value={stats.duplicatesInFile}
                color="warning"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Ya existentes"
                value={stats.existingInDb}
                color="warning"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard label="Errores" value={stats.errors} color="error" />
            </Grid>
            {execution.duration !== undefined && (
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <StatCard
                  label="Duración"
                  value={formatDuration(execution.duration)}
                  color="default"
                />
              </Grid>
            )}
          </Grid>

          {/* Alertas según estado */}
          {execution.status === "completed" && (
            <Alert severity="success" icon={<CheckCircle />}>
              La importación se completó exitosamente. Se insertaron{" "}
              {stats.inserted} de {stats.totalRead} registros.
            </Alert>
          )}

          {execution.status === "completed_with_errors" && (
            <Alert severity="warning" icon={<Warning />}>
              La importación se completó con {stats.errors} errores.
              {hasErrors &&
                " Puedes revisar los detalles o descargar el reporte de errores."}
            </Alert>
          )}

          {execution.status === "failed" && (
            <Alert severity="error" icon={<ErrorIcon />}>
              La importación falló. Por favor, revisa los errores e intenta
              nuevamente.
            </Alert>
          )}

          {/* Detalles de errores */}
          {hasErrors &&
            execution.errorDetails &&
            execution.errorDetails.length > 0 && (
              <Box>
                <Button
                  size="small"
                  onClick={() => setShowErrors(!showErrors)}
                  sx={{ mb: 1 }}
                >
                  {showErrors
                    ? "Ocultar errores"
                    : `Ver errores (${execution.errorDetails.length})`}
                </Button>

                <Collapse in={showErrors}>
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ maxHeight: 300 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Fila</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {execution.errorDetails.map((detail, index) => (
                          <TableRow key={`error-${index}`}>
                            <TableCell>{detail.rowNumber}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  detail.status === "duplicate_file"
                                    ? "Duplicado"
                                    : detail.status === "duplicate_db"
                                    ? "Ya existe"
                                    : "Error"
                                }
                                size="small"
                                color={
                                  detail.status === "error"
                                    ? "error"
                                    : "warning"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {detail.error || "-"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            )}

          {/* Metadatos */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ color: "text.secondary" }}
          >
            <Typography variant="caption">
              Template: {execution.templateName}
            </Typography>
            <Typography variant="caption">
              Iniciado: {formatDateTime(execution.startedAt)}
            </Typography>
            {execution.completedAt && (
              <Typography variant="caption">
                Finalizado: {formatDateTime(execution.completedAt)}
              </Typography>
            )}
          </Stack>

          <Divider />

          {/* Acciones */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {isInProgress && onCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={
                  cancelling ? <CircularProgress size={16} /> : <Cancel />
                }
                onClick={onCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelando..." : "Cancelar"}
              </Button>
            )}

            {hasErrors && onDownloadErrors && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={onDownloadErrors}
              >
                Descargar errores
              </Button>
            )}

            {(execution.status === "completed_with_errors" ||
              execution.status === "failed") &&
              onRetry && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={onRetry}
                >
                  Reintentar fallidos
                </Button>
              )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Componente auxiliar para mostrar estadísticas
interface StatCardProps {
  label: string;
  value: number | string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorMap = {
    default: "text.primary",
    primary: "primary.main",
    secondary: "secondary.main",
    success: "success.main",
    error: "error.main",
    warning: "warning.main",
    info: "info.main",
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        textAlign: "center",
        borderColor: color !== "default" ? colorMap[color] : undefined,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: colorMap[color],
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}
