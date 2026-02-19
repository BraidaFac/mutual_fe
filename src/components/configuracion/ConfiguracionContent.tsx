"use client";

import { ErrorAlert, LoadingSpinner, PageHeader } from "@/components/shared";
import {
  documentosService,
  flujosService,
  fuerzasService,
} from "@/services/index";
import {
  Documento,
  DocumentoRequerido,
  FlujoTramite,
  Fuerza,
  PasoTramite,
  TipoPrestamo,
} from "@/types/index";
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface PasoFormData {
  id?: number;
  nombre: string;
  descripcion: string;
  secuencia: number;
  diasMaximoSinAvance: number | string;
  color: string;
}

const coloresDisponibles = [
  { value: "#2196f3", label: "Azul", color: "#2196f3" },
  { value: "#4caf50", label: "Verde", color: "#4caf50" },
  { value: "#ff9800", label: "Naranja", color: "#ff9800" },
  { value: "#f44336", label: "Rojo", color: "#f44336" },
  { value: "#9c27b0", label: "Púrpura", color: "#9c27b0" },
  { value: "#607d8b", label: "Gris", color: "#607d8b" },
  { value: "#795548", label: "Marrón", color: "#795548" },
  { value: "#e91e63", label: "Rosa", color: "#e91e63" },
];

export default function ConfiguracionContent() {
  const [flujos, setFlujos] = useState<FlujoTramite[]>([]);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados para el flujo seleccionado
  const [flujoSeleccionado, setFlujoSeleccionado] =
    useState<FlujoTramite | null>(null);
  const [pasos, setPasos] = useState<PasoTramite[]>([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState<
    DocumentoRequerido[]
  >([]);

  // Estados para dialogs
  const [pasoDialogOpen, setPasoDialogOpen] = useState(false);
  const [pasoEditando, setPasoEditando] = useState<PasoFormData | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Estados para nuevo flujo
  const [nuevoFlujoOpen, setNuevoFlujoOpen] = useState(false);
  const [flujoFormData, setFlujoFormData] = useState({
    nombre: "",
    descripcion: "",
    fuerzaId: "",
    tipoPrestamo: "" as TipoPrestamo | "",
    activo: true,
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [flujosData, fuerzasData, documentosData] = await Promise.all([
        flujosService.getAll(),
        fuerzasService.getAll(),
        documentosService.getAll(),
      ]);

      setFlujos(flujosData);
      setFuerzas(fuerzasData);
      setDocumentos(documentosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetallesFlujo = useCallback(async () => {
    if (!flujoSeleccionado || !flujoSeleccionado.id) return;

    try {
      const [pasosData, documentosRequeridosData] = await Promise.all([
        flujosService.getPasos(flujoSeleccionado.id),
        flujosService.getDocumentos(flujoSeleccionado.id),
      ]);

      setPasos(pasosData.sort((a, b) => a.secuencia - b.secuencia));
      setDocumentosRequeridos(documentosRequeridosData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar detalles del flujo"
      );
    }
  }, [flujoSeleccionado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (flujoSeleccionado) {
      cargarDetallesFlujo();
    }
  }, [flujoSeleccionado, cargarDetallesFlujo]);

  // Funciones para gestión de flujos
  const handleNuevoFlujo = () => {
    setFlujoFormData({
      nombre: "",
      descripcion: "",
      fuerzaId: "",
      tipoPrestamo: TipoPrestamo.EXTRAORDINARIO,
      activo: true,
    });
    setNuevoFlujoOpen(true);
  };

  const handleCrearFlujo = async () => {
    try {
      setSaving(true);
      setError(null);

      await flujosService.create({
        nombre: flujoFormData.nombre,
        descripcion: flujoFormData.descripcion || undefined,
        fuerza: { id: Number(flujoFormData.fuerzaId) },
        tipoPrestamo: (flujoFormData.tipoPrestamo as TipoPrestamo) || undefined,
        activo: flujoFormData.activo,
        pasos: [],
        documentosRequeridos: [],
      });

      setNuevoFlujoOpen(false);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear flujo");
    } finally {
      setSaving(false);
    }
  };

  // Funciones para gestión de pasos
  const handleNuevoPaso = () => {
    const siguienteSecuencia =
      Math.max(...pasos.map((p) => p.secuencia), 0) + 1;
    setPasoEditando({
      nombre: "",
      descripcion: "",
      secuencia: siguienteSecuencia,
      diasMaximoSinAvance: "",
      color: "#2196f3",
    });
    setPasoDialogOpen(true);
  };

  const handleEditarPaso = (paso: PasoTramite) => {
    setPasoEditando({
      id: paso.id,
      nombre: paso.nombre,
      descripcion: paso.descripcion || "",
      secuencia: paso.secuencia,
      diasMaximoSinAvance: paso.diasMaximoSinAvance || "",
      color: paso.color,
    });
    setPasoDialogOpen(true);
  };

  const handleGuardarPaso = async () => {
    if (!pasoEditando || !flujoSeleccionado) return;

    try {
      setSaving(true);
      setError(null);

      const pasoData = {
        nombre: pasoEditando.nombre,
        descripcion: pasoEditando.descripcion || undefined,
        flujoId: flujoSeleccionado.id,
        secuencia: pasoEditando.secuencia,
        diasMaximoSinAvance:
          typeof pasoEditando.diasMaximoSinAvance === "number"
            ? pasoEditando.diasMaximoSinAvance
            : pasoEditando.diasMaximoSinAvance
            ? Number(pasoEditando.diasMaximoSinAvance)
            : undefined,
        color: pasoEditando.color,
      };

      if (pasoEditando.id) {
        // TODO: Implementar actualización de paso
      } else {
        // Crear nuevo paso
        // await flujosService.createPaso(pasoData); // TODO: Implementar cuando esté disponible
      }

      setPasoDialogOpen(false);
      setPasoEditando(null);
      await cargarDetallesFlujo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar paso");
    } finally {
      setSaving(false);
    }
  };

  // Funciones para gestión de documentos
  const handleToggleDocumento = async (
    documento: Documento,
    requerido: boolean
  ) => {
    if (!flujoSeleccionado) return;

    try {
      if (requerido && flujoSeleccionado.id && documento.id) {
        await flujosService.addDocumento(
          flujoSeleccionado.id,
          documento.id,
          true,
          false
        );
      } else {
        // TODO: Implementar eliminación de documento requerido
        console.log("Eliminar documento requerido:", documento.id);
      }
      await cargarDetallesFlujo();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar documento"
      );
    }
  };

  const isDocumentoRequerido = (documentoId: number) => {
    return documentosRequeridos.some((dr) => dr.documento.id === documentoId);
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Cargando configuración de flujos..."
        fullScreen={true}
        size={55}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Configuración de Flujos de Trámite"
        subtitle="Gestiona flujos, pasos, transiciones y documentos requeridos"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevoFlujo}
          >
            Nuevo Flujo
          </Button>
        }
      />

      {error && <ErrorAlert error={error} onRetry={cargarDatos} />}

      <Grid container spacing={3}>
        {/* Selección de Flujo */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Seleccionar Flujo para Configurar
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormControl fullWidth>
                    <InputLabel>Flujo de Trámite</InputLabel>
                    <Select
                      value={flujoSeleccionado?.id || ""}
                      label="Flujo de Trámite"
                      onChange={(e) => {
                        const flujo = flujos.find(
                          (f) => f.id === Number(e.target.value)
                        );
                        setFlujoSeleccionado(flujo || null);
                      }}
                    >
                      {flujos.map((flujo) => (
                        <MenuItem key={flujo.id} value={flujo.id}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography variant="body1">
                              {flujo.nombre}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {flujo.fuerza.nombre}{" "}
                              {flujo.tipoPrestamo && `• ${flujo.tipoPrestamo}`}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {flujoSeleccionado && (
                <Box mt={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Configurando:
                    </Typography>
                    <Chip
                      label={flujoSeleccionado.nombre}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={flujoSeleccionado.fuerza.nombre}
                      size="small"
                      color="secondary"
                    />
                    {flujoSeleccionado.tipoPrestamo && (
                      <Chip
                        label={flujoSeleccionado.tipoPrestamo}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      • {pasos.length} pasos • {documentosRequeridos.length}{" "}
                      documentos
                    </Typography>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración del Flujo Seleccionado */}
        {flujoSeleccionado && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue: number) => setTabValue(newValue)}
                >
                  <Tab label={`Pasos del Flujo (${pasos.length})`} />
                  <Tab
                    label={`Documentos Requeridos (${documentosRequeridos.length})`}
                  />
                  <Tab label="Vista de Flujo" />
                </Tabs>

                {/* Tab de Pasos */}
                {tabValue === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Pasos del Flujo</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleNuevoPaso}
                      >
                        Agregar Paso
                      </Button>
                    </Box>

                    {pasos.length === 0 ? (
                      <Alert severity="info">
                        No hay pasos configurados para este flujo. Agrega el
                        primer paso para comenzar.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {pasos.map((paso, index) => (
                          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={paso.id}>
                            <Paper
                              sx={{
                                p: 2,
                                border: 2,
                                borderColor: paso.color,
                                borderRadius: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={paso.secuencia}
                                    size="small"
                                    sx={{
                                      backgroundColor: paso.color,
                                      color: "white",
                                    }}
                                  />
                                  <Typography variant="h6" component="div">
                                    {paso.nombre}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditarPaso(paso)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Eliminar">
                                    <IconButton size="small" color="error">
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>

                              {paso.descripcion && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  {paso.descripcion}
                                </Typography>
                              )}

                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                sx={{ mt: 1 }}
                              >
                                {paso.diasMaximoSinAvance && (
                                  <Chip
                                    label={`${paso.diasMaximoSinAvance} días max`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>

                              {index < pasos.length - 1 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 2,
                                  }}
                                >
                                  <ArrowForwardIcon color="action" />
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {/* Tab de Documentos */}
                {tabValue === 1 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Documentos Requeridos para este Flujo
                    </Typography>

                    <List>
                      {documentos.map((documento) => (
                        <ListItem
                          key={documento.id}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor:
                              documento.id && isDocumentoRequerido(documento.id)
                                ? "primary.50"
                                : "transparent",
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={
                                documento.id
                                  ? isDocumentoRequerido(documento.id)
                                  : false
                              }
                              onChange={(e) =>
                                handleToggleDocumento(
                                  documento,
                                  e.target.checked
                                )
                              }
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={documento.nombre}
                            secondary={documento.descripcion}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {documentos.length === 0 && (
                      <Alert severity="info">
                        No hay documentos disponibles. Crea algunos documentos
                        primero.
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Tab de Vista de Flujo */}
                {tabValue === 2 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Vista Visual del Flujo
                    </Typography>

                    {pasos.length === 0 ? (
                      <Alert severity="info">
                        Configura algunos pasos primero para ver la vista del
                        flujo.
                      </Alert>
                    ) : (
                      <Paper sx={{ p: 3, backgroundColor: "grey.50" }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 2,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {pasos.map((paso, index) => (
                            <Box
                              key={paso.id}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Paper
                                sx={{
                                  p: 2,
                                  minWidth: 120,
                                  textAlign: "center",
                                  backgroundColor: paso.color,
                                  color: "white",
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">
                                  {paso.secuencia}
                                </Typography>
                                <Typography variant="caption">
                                  {paso.nombre}
                                </Typography>
                              </Paper>
                              {index < pasos.length - 1 && (
                                <ArrowForwardIcon
                                  sx={{ mx: 1, color: "text.secondary" }}
                                />
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog para Nuevo Flujo */}
      <Dialog
        open={nuevoFlujoOpen}
        onClose={() => setNuevoFlujoOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Flujo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre del Flujo *"
                value={flujoFormData.nombre}
                onChange={(e) =>
                  setFlujoFormData((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Fuerza *</InputLabel>
                <Select
                  value={flujoFormData.fuerzaId}
                  label="Fuerza *"
                  onChange={(e) =>
                    setFlujoFormData((prev) => ({
                      ...prev,
                      fuerzaId: e.target.value,
                    }))
                  }
                >
                  {fuerzas.map((fuerza) => (
                    <MenuItem key={fuerza.id} value={fuerza.id}>
                      {fuerza.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Préstamo</InputLabel>
                <Select
                  value={flujoFormData.tipoPrestamo}
                  label="Tipo de Préstamo"
                  onChange={(e) =>
                    setFlujoFormData((prev) => ({
                      ...prev,
                      tipoPrestamo: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="">General (todos los tipos)</MenuItem>
                  {Object.values(TipoPrestamo).map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={flujoFormData.descripcion}
                onChange={(e) =>
                  setFlujoFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNuevoFlujoOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCrearFlujo}
            variant="contained"
            disabled={
              !flujoFormData.nombre || !flujoFormData.fuerzaId || saving
            }
          >
            {saving ? "Creando..." : "Crear Flujo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Paso */}
      <Dialog
        open={pasoDialogOpen}
        onClose={() => setPasoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {pasoEditando?.id ? "Editar Paso" : "Nuevo Paso"}
        </DialogTitle>
        <DialogContent>
          {pasoEditando && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Nombre del Paso *"
                  value={pasoEditando.nombre}
                  onChange={(e) =>
                    setPasoEditando((prev) =>
                      prev ? { ...prev, nombre: e.target.value } : null
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Secuencia *"
                  value={pasoEditando.secuencia}
                  onChange={(e) =>
                    setPasoEditando((prev) =>
                      prev
                        ? { ...prev, secuencia: Number(e.target.value) }
                        : null
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Descripción"
                  value={pasoEditando.descripcion}
                  onChange={(e) =>
                    setPasoEditando((prev) =>
                      prev ? { ...prev, descripcion: e.target.value } : null
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Días Máximo Sin Avance"
                  value={pasoEditando.diasMaximoSinAvance}
                  onChange={(e) =>
                    setPasoEditando((prev) =>
                      prev
                        ? {
                            ...prev,
                            diasMaximoSinAvance: Number(e.target.value) || "",
                          }
                        : null
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={pasoEditando.color}
                    label="Color"
                    onChange={(e) =>
                      setPasoEditando((prev) =>
                        prev ? { ...prev, color: e.target.value } : null
                      )
                    }
                  >
                    {coloresDisponibles.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color.color,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                            }}
                          />
                          {color.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasoDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleGuardarPaso}
            variant="contained"
            disabled={!pasoEditando?.nombre || saving}
          >
            {saving
              ? "Guardando..."
              : pasoEditando?.id
              ? "Actualizar"
              : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
