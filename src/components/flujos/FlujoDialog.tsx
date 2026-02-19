"use client";

import { ConfirmDialog, DataTable, FormField } from "@/components/shared";
import { deepClone } from "@/lib/clone";
import { documentosService, flujosService } from "@/services/index";
import {
  Documento,
  DocumentoRequerido,
  FlujoDto,
  FlujoTramite,
  Fuerza,
  PasoTramite,
  TipoPrestamo,
  tipoPrestamoOptions,
} from "@/types/index";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import PasoDialog, { PasoFormData } from "./PasoDialog";
import { getColorPaso } from "./colores";
interface FlujoDialogProps {
  open: boolean;
  onClose: () => void;
  onFlujoGuardado: () => void;
  flujo: FlujoTramite;
  fuerzas: Fuerza[];
}

interface FlujoFormData {
  nombre: string;
  descripcion: string;
  fuerzaId: number | "";
  tipoPrestamo: TipoPrestamo | "";
  activo: boolean;
  pasos: PasoTramite[];
  documentosRequeridos: DocumentoRequerido[];
}

export default function FlujoDialog({
  open,
  onClose,
  onFlujoGuardado,
  flujo,
  fuerzas,
}: FlujoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pasoDialogOpen, setPasoDialogOpen] = useState(false);
  const [pasoSeleccionado, setPasoSeleccionado] = useState<PasoTramite | null>(
    null,
  );
  const [esEdicionPaso, setEsEdicionPaso] = useState(false);

  // Estados para TransferList
  const [documentosDisponibles, setDocumentosDisponibles] = useState<
    Documento[]
  >([]);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<
    Documento[]
  >([]);
  const [documentosSeleccionadosIzq, setDocumentosSeleccionadosIzq] = useState<
    number[]
  >([]);
  const [documentosSeleccionadosDer, setDocumentosSeleccionadosDer] = useState<
    number[]
  >([]);

  const [formData, setFormData] = useState<FlujoFormData>({
    nombre: "",
    descripcion: "",
    fuerzaId: "",
    tipoPrestamo: "" as TipoPrestamo | "",
    activo: true,
    pasos: [],
    documentosRequeridos: [],
  });

  const esEdicion = !!flujo;

  const cargarDocumentos = useCallback(async () => {
    const documentosRequeridos = await documentosService.getAll();
    if (flujo) {
      setDocumentosSeleccionados(
        flujo.documentosRequeridos.map((dr) => dr.documento),
      );
      setDocumentosDisponibles(
        documentosRequeridos.filter(
          (doc) =>
            !flujo.documentosRequeridos.some(
              (dr) => dr.documento.id === doc.id,
            ),
        ),
      );
    } else {
      setDocumentosSeleccionados([]);
      setDocumentosDisponibles(documentosRequeridos);
    }
  }, [flujo]);

  useEffect(() => {
    setTabValue(0);
  }, [open]);

  useEffect(() => {
    //Es Documentos
    if (tabValue === 2) {
      cargarDocumentos();
    }
  }, [tabValue, cargarDocumentos]);

  useEffect(() => {
    if (open) {
      if (flujo) {
        // Modo edición - Hacer copias profundas para evitar mutaciones
        setFormData({
          nombre: flujo.nombre,
          descripcion: flujo.descripcion || "",
          fuerzaId: flujo.fuerza.id,
          tipoPrestamo: flujo.tipoPrestamo || "",
          activo: flujo.activo,
          pasos: deepClone(
            flujo.pasos.map((p) => ({ ...p, temporalId: crypto.randomUUID() })),
          ),
          documentosRequeridos: deepClone(
            flujo.documentosRequeridos.map((dr) => ({
              ...dr,
              temporalId: crypto.randomUUID(),
            })),
          ),
        });
      } else {
        // Modo creación
        setFormData({
          nombre: "",
          descripcion: "",
          fuerzaId: "",
          tipoPrestamo: "",
          activo: true,
          pasos: [],
          documentosRequeridos: [],
        });
      }
      setError(null);
    }
  }, [open, flujo]);

  const handleFieldChange = (
    field: keyof FlujoFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.pasos.length > 0 &&
      formData.nombre.trim() !== "" &&
      formData.fuerzaId !== "" &&
      formData.documentosRequeridos.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Por favor complete todos los campos obligatorios");
      return;
    }

    const flujoData: FlujoDto = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      fuerza: { id: +formData.fuerzaId },
      tipoPrestamo: formData.tipoPrestamo as TipoPrestamo,
      activo: formData.activo,
      pasos: formData.pasos,
      documentosRequeridos: formData.documentosRequeridos,
    };
    try {
      setLoading(true);
      setError(null);

      if (esEdicion && flujo) {
        await flujosService.update(flujo.id!, flujoData);
      } else {
        await flujosService.create(flujoData);
      }

      onFlujoGuardado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el flujo",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoPaso = () => {
    setPasoSeleccionado(null);
    setEsEdicionPaso(false);
    setPasoDialogOpen(true);
  };

  const handleEditarPaso = (paso: PasoTramite) => {
    setPasoSeleccionado(paso);
    setEsEdicionPaso(true);
    setPasoDialogOpen(true);
  };

  const handleBorrarPaso = (paso: PasoTramite) => {
    const nuevosPasos = formData.pasos.filter(
      (p) => p.temporalId !== paso.temporalId,
    );
    setFormData((prev) => ({ ...prev, pasos: nuevosPasos }));
    setDeleteDialogOpen(false);
    setPasoSeleccionado(null);
  };

  const handlePasoGuardado = (paso: PasoFormData) => {
    if (esEdicionPaso && pasoSeleccionado) {
      // Actualizar paso existente - crear nueva copia
      const nuevosPasos = [...formData.pasos];
      const index = nuevosPasos.findIndex(
        (p) => p.temporalId === paso.temporalId,
      );
      if (index !== -1) {
        nuevosPasos[index] = {
          ...paso,
          flujo: flujo,
          color: getColorPaso(paso.tipoPaso),
        };
      }
      setFormData((prev) => ({ ...prev, pasos: nuevosPasos }));
    } else {
      // Agregar nuevo paso - crear nueva copia
      const nuevosPasos = [
        ...formData.pasos,
        { ...paso, flujo: flujo, color: getColorPaso(paso.tipoPaso) },
      ];
      setFormData((prev) => ({ ...prev, pasos: nuevosPasos }));
    }
  };

  const handleToggleDocumentoRequeridoNoNecesarioSiEsSocio = (
    documento: Documento,
    noNecesarioSiEsSocio: boolean,
  ) => {
    const nuevosDocRequeridos = formData.documentosRequeridos.map((dr) =>
      dr.documento.id === documento.id ? { ...dr, noNecesarioSiEsSocio } : dr,
    );
    setFormData((prev) => ({
      ...prev,
      documentosRequeridos: nuevosDocRequeridos,
    }));
  };

  const isDocumentoRequeridoNoNecesarioSiEsSocio = (documentoId: number) => {
    return formData.documentosRequeridos.some(
      (dr) => dr.documento.id === documentoId && dr.noNecesarioSiEsSocio,
    );
  };

  // Funciones para TransferList
  const handleToggleDocumentoIzq = (documentoId: number) => {
    setDocumentosSeleccionadosIzq((prev) =>
      prev.includes(documentoId)
        ? prev.filter((id) => id !== documentoId)
        : [...prev, documentoId],
    );
  };

  const handleToggleDocumentoDer = (documentoId: number) => {
    setDocumentosSeleccionadosDer((prev) =>
      prev.includes(documentoId)
        ? prev.filter((id) => id !== documentoId)
        : [...prev, documentoId],
    );
  };

  const handleMoverDerecha = () => {
    if (documentosSeleccionadosIzq.length === 0) return;

    const docsAMover = documentosDisponibles.filter(
      (doc) => doc.id && documentosSeleccionadosIzq.includes(doc.id),
    );

    // Crear nuevos documentos requeridos
    const nuevosDocRequeridos = docsAMover.map((doc) => ({
      documento: doc,
      obligatorio: true,
      noNecesarioSiEsSocio: false,
    })) as DocumentoRequerido[];

    // Actualizar estados
    setFormData((prev) => ({
      ...prev,
      documentosRequeridos: [
        ...prev.documentosRequeridos,
        ...nuevosDocRequeridos,
      ],
    }));

    setDocumentosDisponibles((prev) =>
      prev.filter(
        (doc) => !doc.id || !documentosSeleccionadosIzq.includes(doc.id),
      ),
    );
    setDocumentosSeleccionados((prev) => [...prev, ...docsAMover]);
    setDocumentosSeleccionadosIzq([]);
  };

  const handleMoverIzquierda = () => {
    if (documentosSeleccionadosDer.length === 0) return;

    const docsAMover = documentosSeleccionados.filter(
      (doc) => doc.id && documentosSeleccionadosDer.includes(doc.id),
    );

    // Filtrar documentos requeridos
    const nuevosDocRequeridos = formData.documentosRequeridos.filter(
      (dr) => !docsAMover.some((doc) => doc.id === dr.documento.id),
    );

    // Actualizar estados
    setFormData((prev) => ({
      ...prev,
      documentosRequeridos: nuevosDocRequeridos,
    }));

    setDocumentosSeleccionados((prev) =>
      prev.filter(
        (doc) => !doc.id || !documentosSeleccionadosDer.includes(doc.id),
      ),
    );
    setDocumentosDisponibles((prev) => [...prev, ...docsAMover]);
    setDocumentosSeleccionadosDer([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { minHeight: "90vh" },
        },
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {esEdicion ? "Editar Flujo" : "Crear Nuevo Flujo"}
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label={`Datos del Flujo`} />
          <Tab label={`Pasos (${formData?.pasos?.length ?? 0})`} />
          <Tab
            label={`Documentos (${
              formData?.documentosRequeridos?.length ?? 0
            })`}
          />
        </Tabs>
        {/* Tab de Datos del Flujo */}
        {tabValue === 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormField
                type="text"
                name="nombre"
                label="Nombre del Flujo *"
                value={formData.nombre}
                onChange={(value) => handleFieldChange("nombre", value)}
                placeholder="Ej: Flujo Préstamo Estándar"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormField
                type="select"
                name="fuerzaId"
                label="Fuerza *"
                value={formData.fuerzaId}
                onChange={(value) => handleFieldChange("fuerzaId", value)}
                options={fuerzas.map((fuerza) => ({
                  value: fuerza.id.toString(),
                  label: fuerza.nombre,
                }))}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormField
                type="select"
                name="tipoPrestamo"
                label="Tipo de Préstamo"
                value={formData.tipoPrestamo || ""}
                onChange={(value) => handleFieldChange("tipoPrestamo", value)}
                options={tipoPrestamoOptions.map((option) => ({
                  value: option.value as TipoPrestamo,
                  label: option.label,
                }))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormField
                type="text"
                name="descripcion"
                label="Descripción"
                value={formData.descripcion}
                onChange={(value) => handleFieldChange("descripcion", value)}
                placeholder="Descripción opcional del flujo..."
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        )}

        {/* Tab de Pasos */}
        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Pasos del Flujo ({formData?.pasos?.length ?? 0})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNuevoPaso}
              >
                Nuevo Paso
              </Button>
            </Box>

            {formData?.pasos?.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="textSecondary" variant="body1">
                  No hay pasos configurados para este flujo
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  Haga clic en &quot;Nuevo Paso&quot; para comenzar a configurar
                  el flujo
                </Typography>
              </Paper>
            ) : (
              <DataTable
                data={formData?.pasos?.sort((a, b) => a.orden - b.orden)}
                columns={[
                  {
                    id: "secuencia",
                    label: "Secuencia",
                    format: (value: unknown, row: PasoTramite) => (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: row.color,
                            borderRadius: "50%",
                          }}
                        />
                        <span>{row.orden}</span>
                      </Box>
                    ),
                  },
                  {
                    id: "nombre",
                    label: "Nombre",
                  },
                  {
                    id: "descripcion",
                    label: "Descripción",
                    format: (value: unknown, row: PasoTramite) => (
                      <Typography variant="body2" color="textSecondary">
                        {row.descripcion || "Sin descripción"}
                      </Typography>
                    ),
                  },
                  {
                    id: "diasMaximoSinAvance",
                    label: "Días Máximo",
                    format: (value: unknown, row: PasoTramite) => (
                      <span>{row.diasMaximoSinAvance || "Sin límite"}</span>
                    ),
                  },
                ]}
                actions={[
                  {
                    type: "edit",
                    label: "Editar",
                    onClick: (paso: PasoTramite) => handleEditarPaso(paso),
                  },
                  {
                    type: "delete",
                    label: "Eliminar",
                    onClick: (paso: PasoTramite) => {
                      setPasoSeleccionado(paso);
                      setDeleteDialogOpen(true);
                    },
                  },
                ]}
                loading={false}
                emptyMessage="No hay pasos configurados para este flujo"
              />
            )}
          </Box>
        )}

        {/* Tab de Documentos */}
        {tabValue === 2 && (
          <Paper sx={{ p: 2, mt: 2, maxHeight: 500, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Documentos Requeridos para este Flujo
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              {/* Lista Izquierda - Documentos Disponibles */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Documentos Disponibles ({documentosDisponibles.length})
                </Typography>
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                  {documentosDisponibles.length === 0 ? (
                    <Typography
                      color="textSecondary"
                      align="center"
                      sx={{ py: 4 }}
                    >
                      Todos los documentos ya están agregados
                    </Typography>
                  ) : (
                    documentosDisponibles.map((documento) => (
                      <ListItem key={documento.id} disablePadding>
                        <ListItemButton
                          dense
                          className="hover:bg-primary/10"
                          onClick={() =>
                            documento.id &&
                            handleToggleDocumentoIzq(documento.id)
                          }
                          selected={
                            documento.id
                              ? documentosSeleccionadosIzq.includes(
                                  documento.id,
                                )
                              : false
                          }
                        >
                          <Checkbox
                            checked={
                              documento.id
                                ? documentosSeleccionadosIzq.includes(
                                    documento.id,
                                  )
                                : false
                            }
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText
                            primary={documento.nombre}
                            secondary={documento.descripcion}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>

              {/* Botones de Transferencia */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMoverDerecha}
                  disabled={documentosSeleccionadosIzq.length === 0}
                  startIcon={<ChevronRightIcon />}
                >
                  Agregar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMoverIzquierda}
                  disabled={documentosSeleccionadosDer.length === 0}
                  startIcon={<ChevronLeftIcon />}
                >
                  Quitar
                </Button>
              </Box>

              {/* Lista Derecha - Documentos Requeridos */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Documentos Requeridos ({documentosSeleccionados.length})
                </Typography>
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                  {documentosSeleccionados.length === 0 ? (
                    <Typography
                      color="textSecondary"
                      align="center"
                      sx={{ py: 4 }}
                    >
                      No hay documentos requeridos configurados
                    </Typography>
                  ) : (
                    documentosSeleccionados.map((documento) => (
                      <ListItem key={documento.id} disablePadding>
                        <ListItemButton
                          dense
                          onClick={() =>
                            documento.id &&
                            handleToggleDocumentoDer(documento.id)
                          }
                          selected={
                            documento.id
                              ? documentosSeleccionadosDer.includes(
                                  documento.id,
                                )
                              : false
                          }
                        >
                          <Checkbox
                            checked={
                              documento.id
                                ? documentosSeleccionadosDer.includes(
                                    documento.id,
                                  )
                                : false
                            }
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText
                            primary={documento.nombre}
                            secondary={documento.descripcion}
                          />
                          <Box
                            sx={{
                              ml: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="No Necesario para Socios">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  cursor: "pointer",
                                  p: 0.5,
                                  borderRadius: 1,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (documento.id) {
                                    handleToggleDocumentoRequeridoNoNecesarioSiEsSocio(
                                      documento,
                                      !isDocumentoRequeridoNoNecesarioSiEsSocio(
                                        documento.id,
                                      ),
                                    );
                                  }
                                }}
                              >
                                <PersonIcon
                                  sx={{
                                    fontSize: 16,
                                    color: documento.id
                                      ? isDocumentoRequeridoNoNecesarioSiEsSocio(
                                          documento.id,
                                        )
                                        ? "warning.main"
                                        : "text.secondary"
                                      : "text.secondary",
                                    transition: "color 0.2s",
                                  }}
                                />
                                <Switch
                                  size="small"
                                  checked={
                                    documento.id
                                      ? isDocumentoRequeridoNoNecesarioSiEsSocio(
                                          documento.id,
                                        )
                                      : false
                                  }
                                  onChange={(e) => {
                                    if (documento.id) {
                                      handleToggleDocumentoRequeridoNoNecesarioSiEsSocio(
                                        documento,
                                        e.target.checked,
                                      );
                                    }
                                  }}
                                  sx={{
                                    "& .MuiSwitch-switchBase": {
                                      color: "grey.400",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                      color: "warning.main",
                                    },
                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                      {
                                        backgroundColor: "warning.main",
                                      },
                                    "& .MuiSwitch-root": {
                                      width: 32,
                                      height: 16,
                                    },
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label="Socio"
                                  variant={
                                    documento.id &&
                                    isDocumentoRequeridoNoNecesarioSiEsSocio(
                                      documento.id,
                                    )
                                      ? "filled"
                                      : "outlined"
                                  }
                                  color={
                                    documento.id &&
                                    isDocumentoRequeridoNoNecesarioSiEsSocio(
                                      documento.id,
                                    )
                                      ? "warning"
                                      : "default"
                                  }
                                  sx={{
                                    fontSize: "0.65rem",
                                    height: 18,
                                    minWidth: 40,
                                    "& .MuiChip-label": {
                                      px: 0.5,
                                      fontWeight: 500,
                                    },
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Box>
          </Paper>
        )}

        {error && (
          <div style={{ color: "red", marginTop: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isFormValid()}
        >
          {loading ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>

      {/* Dialog para crear/editar pasos */}
      <PasoDialog
        open={pasoDialogOpen}
        onClose={() => setPasoDialogOpen(false)}
        onPasoGuardado={handlePasoGuardado}
        paso={pasoSeleccionado}
        esEdicion={esEdicionPaso}
        pasosExistentes={formData.pasos}
      />

      {/* Diálogo de confirmación para eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Paso"
        message={`¿Estás seguro de que deseas eliminar al paso "${pasoSeleccionado?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => handleBorrarPaso(pasoSeleccionado!)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setPasoSeleccionado(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />
    </Dialog>
  );
}
