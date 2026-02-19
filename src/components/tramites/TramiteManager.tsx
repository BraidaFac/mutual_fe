"use client";

import { ErrorAlert, LoadingSpinner } from "@/components/shared";
import { useTramiteManagement } from "@/hooks/useTramiteManagement";
import {
  EstadoDocumento,
  HistorialPaso,
  PasoTramite,
  TipoPaso,
  tipoPrestamoOptions,
  Tramite,
  TramiteDocumento,
} from "@/types/index";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney,
  Call as CallIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  FileViewer,
  UploadDocumentoDialog,
} from "@/components/tramites/documentos";
import { useDocumentosManager } from "@/hooks/useDocumentosManager";
import { clientesService } from "@/services/clientesService";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TramiteManagerProps {
  open: boolean;
  tramiteId: number | null;
  onClose: () => void;
  onTramiteUpdated: (tramite: Partial<Tramite>) => void;
  onTramiteDeleted: (tramiteId: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tramite-manager-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Modal para avanzar trámite
interface ConfirmarAvanceRetrocesoTramiteModalProps {
  open: boolean;
  paso: PasoTramite;
  tramite: Tramite;
  onClose: () => void;
  onConfirm: (montoAutorizado?: number) => void;
}
const ConfirmarAvanceRetrocesoTramiteModal: React.FC<
  ConfirmarAvanceRetrocesoTramiteModalProps
> = ({ open, paso, tramite, onClose, onConfirm }) => {
  const [montoAutorizado, setMontoAutorizado] = useState<number>(
    tramite?.montoSolicitado ?? 0,
  );

  // Sincronizar montoAutorizado cuando cambia el trámite
  useEffect(() => {
    setMontoAutorizado(tramite?.montoSolicitado ?? 0);
  }, [tramite?.montoSolicitado, open]);

  const handleConfirm = () => {
    if (paso.tipoPaso === TipoPaso.FINAL_EXITOSO) {
      onConfirm(montoAutorizado);
    } else {
      onConfirm();
    }
  };

  const formatMonto = (monto?: number) => {
    if (!monto) return "N/A";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const getTipoPrestamoLabel = () => {
    const tipo = tipoPrestamoOptions.find(
      (opt) => opt.value === tramite.tipoPrestamo,
    );
    return tipo?.label || "N/A";
  };

  if (!tramite || !paso) return;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Movimiento</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {paso.tipoPaso === TipoPaso.FINAL_EXITOSO && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Detalle final del trámite
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Cliente:</Typography>
                  <Typography fontWeight={500}>
                    {tramite.cliente?.fullName || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Fuerza:</Typography>
                  <Typography fontWeight={500}>
                    {tramite.cliente?.fuerza?.nombre || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    Tipo de trámite:
                  </Typography>
                  <Typography fontWeight={500}>
                    {getTipoPrestamoLabel()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    Monto solicitado:
                  </Typography>
                  <Typography fontWeight={600}>
                    {formatMonto(tramite?.montoSolicitado ?? 0)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">
                    Importe autorizado:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={montoAutorizado || ""}
                    onChange={(e) =>
                      setMontoAutorizado(Number(e.target.value) || 0)
                    }
                    slotProps={{
                      htmlInput: { min: 0, step: 1000 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ width: 140 }}
                  />
                </Box>
              </Box>
            </Paper>
          )}
          {paso.tipoPaso === TipoPaso.FINAL_RECHAZADO && (
            <Box>
              <Typography variant="body1">
                Si acepta el tramite se rechazara.
              </Typography>
            </Box>
          )}

          {paso.tipoPaso === TipoPaso.INTERMEDIO && (
            <Box>
              Confirma el avance al paso <strong>{paso.nombre}</strong>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={
            paso?.tipoPaso === TipoPaso.FINAL_EXITOSO
              ? "success"
              : paso?.tipoPaso === TipoPaso.FINAL_RECHAZADO
                ? "error"
                : "primary"
          }
        >
          {paso?.tipoPaso === TipoPaso.FINAL_EXITOSO
            ? "Confirmar Tramite"
            : paso?.tipoPaso === TipoPaso.FINAL_RECHAZADO
              ? "Rechazar Tramite"
              : "Avanzar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AvanzarTramiteModalProps {
  open: boolean;
  pasosSiguientes: PasoTramite[];
  onClose: () => void;
  onConfirm: (pasoTramite: PasoTramite) => void;
}
const AvanzarTramiteModal: React.FC<AvanzarTramiteModalProps> = ({
  open,
  pasosSiguientes,
  onClose,
  onConfirm,
}) => {
  const [pasoSiguienteSeleccionado, setPasoSiguienteSeleccionado] =
    useState<PasoTramite | null>(null);

  const handleConfirm = () => {
    if (pasoSiguienteSeleccionado) {
      onConfirm(pasoSiguienteSeleccionado);
      setPasoSiguienteSeleccionado(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Avanzar Trámite</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            select
            label="Seleccionar Destino"
            value={pasoSiguienteSeleccionado?.id || ""}
            onChange={(e) =>
              setPasoSiguienteSeleccionado(
                pasosSiguientes.find((p) => p.id === Number(e.target.value)) ||
                  null,
              )
            }
            fullWidth
          >
            {pasosSiguientes.map((pasoSiguiente) => (
              <MenuItem key={pasoSiguiente.id} value={pasoSiguiente.id}>
                <Box>
                  <Typography variant="body1">
                    {pasoSiguiente.nombre}
                  </Typography>
                  {pasoSiguiente.descripcion && (
                    <Typography variant="caption" color="text.secondary">
                      {pasoSiguiente.descripcion}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={
            pasoSiguienteSeleccionado?.tipoPaso === TipoPaso.FINAL_EXITOSO
              ? "success"
              : pasoSiguienteSeleccionado?.tipoPaso === TipoPaso.FINAL_RECHAZADO
                ? "error"
                : "primary"
          }
          disabled={!pasoSiguienteSeleccionado}
        >
          {pasoSiguienteSeleccionado?.tipoPaso === TipoPaso.FINAL_EXITOSO
            ? "Confirmar Tramite"
            : pasoSiguienteSeleccionado?.tipoPaso === TipoPaso.FINAL_RECHAZADO
              ? "Rechazar Tramite"
              : "Avanzar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal para retroceder trámite
interface RetrocederModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

const RetrocederModal: React.FC<RetrocederModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = useState("");

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo);
      setMotivo("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Retroceder Trámite
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            El trámite retrocederá al paso anterior. Esta acción debe estar
            justificada.
          </Alert>
          <TextField
            label="Motivo (obligatorio)"
            multiline
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            fullWidth
            required
            placeholder="Explique el motivo del retroceso..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={!motivo.trim()}
        >
          Retroceder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const TramiteManager: React.FC<TramiteManagerProps> = ({
  open,
  tramiteId,
  onClose,
  onTramiteUpdated,
  onTramiteDeleted,
}) => {
  const [tramiteState, tramiteActions] = useTramiteManagement();
  const {
    documentosCargados,
    documentosPendientes,
    error: errorDocumentos,
    loading: loadingDocumentos,
    actions: documentosAction,
  } = useDocumentosManager();

  const { setTramiteId, limpiarDocumentos } = documentosAction;
  const [activeTab, setActiveTab] = useState(0);
  const [avanzarModalOpen, setAvanzarModalOpen] = useState(false);
  const [retrocederModalOpen, setRetrocederModalOpen] = useState(false);
  const [observacionesEditables, setObservacionesEditables] = useState("");
  const [documentoObservaciones, setDocumentoObservaciones] = useState<{
    [key: number]: string;
  }>({});

  // Estado unificado para edición de campos del header (teléfono, email, monto, fecha)
  const [headerEditData, setHeaderEditData] = useState({
    telefono: "",
    email: "",
    monto: 0,
    fechaUltimoContacto: null as Date | null,
  });
  const [canEdit, setCanEdit] = useState(false);

  // Estados para subida de documentos
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentoParaSubir, setDocumentoParaSubir] =
    useState<TramiteDocumento | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentoParaVisualizar, setDocumentoParaVisualizar] =
    useState<TramiteDocumento | null>(null);

  const [
    confirmarTramitePasoFinaDialogOpen,
    setConfirmarTramitePasoFinaDialogOpen,
  ] = useState(false);
  const [pasoSiguienteSeleccionado, setPasoSiguienteSeleccionado] =
    useState<PasoTramite | null>(null);

  const {
    currentTramite,
    historial,
    loading,
    error,
    canAdvance,
    canGoBack,
    availableTransitionsForward,
    availableTransitionsBackward,
  } = tramiteState;

  const { loadTramiteById, clearError, avanzarPaso, agregarDocumentoATramite } =
    tramiteActions;

  // Cargar datos del trámite
  useEffect(() => {
    if (open && tramiteId) {
      loadTramiteById(tramiteId);
      setTramiteId(tramiteId);
    }
  }, [open, tramiteId, loadTramiteById, setTramiteId]); // Solo cuando cambia open o tramiteId

  useEffect(() => {
    if (currentTramite) {
      setCanEdit(
        !(
          currentTramite.pasoActual.tipoPaso === TipoPaso.FINAL_EXITOSO ||
          currentTramite.pasoActual.tipoPaso === TipoPaso.FINAL_RECHAZADO
        ),
      );
      setObservacionesEditables(currentTramite.observaciones || "");
      setHeaderEditData({
        telefono: currentTramite.cliente?.telefono || "",
        email: currentTramite.cliente?.email || "",
        monto: currentTramite.montoSolicitado || 0,
        fechaUltimoContacto: currentTramite.fechaUltimoContacto
          ? new Date(currentTramite.fechaUltimoContacto)
          : null,
      });
    }
  }, [currentTramite]);

  const handleClose = () => {
    clearError();
    setActiveTab(0);
    setTramiteId(null);
    limpiarDocumentos();
    setHeaderEditData({
      telefono: "",
      email: "",
      monto: 0,
      fechaUltimoContacto: null,
    });
    onClose();
  };

  const handleRefresh = () => {
    if (tramiteId) {
      loadTramiteById(tramiteId);
      setTramiteId(tramiteId);
    }
  };

  const handleCancelarTramite = async () => {
    if (!currentTramite) return;
    await onTramiteDeleted(currentTramite.id);
  };

  const handleAvanzarTramite = async (pasoSiguiente: PasoTramite) => {
    if (!currentTramite) return;

    setPasoSiguienteSeleccionado(pasoSiguiente);
    setConfirmarTramitePasoFinaDialogOpen(true);
  };

  const handleConfirmarPasoFinal = async (montoAutorizado?: number) => {
    if (!currentTramite || !pasoSiguienteSeleccionado) return;

    setConfirmarTramitePasoFinaDialogOpen(false);
    setAvanzarModalOpen(false);

    if (
      pasoSiguienteSeleccionado.tipoPaso === TipoPaso.FINAL_EXITOSO &&
      montoAutorizado !== undefined
    ) {
      await onTramiteUpdated({
        ...currentTramite,
        montoSolicitado: montoAutorizado,
      });
    }

    await avanzarPaso(currentTramite.id, pasoSiguienteSeleccionado!.id!);
    setPasoSiguienteSeleccionado(null);
    handleRefresh();
  };

  const handleRetrocederTramite = async (motivo: string) => {
    if (!currentTramite) return;
    // TODO: Implementar endpoint de retroceso
    console.log("Retroceder trámite:", motivo);
  };

  const handleGuardarObservaciones = async () => {
    if (!currentTramite) return;
    await onTramiteUpdated({
      ...currentTramite,
      observaciones: observacionesEditables,
    });
  };

  const handleGuardarDatosCliente = async () => {
    if (!currentTramite?.cliente) return;

    const clienteActualizado = await clientesService.update(
      currentTramite.cliente.id,
      {
        telefono: headerEditData.telefono,
        email: headerEditData.email,
      },
    );
    if (clienteActualizado) {
      toast.success("Datos del cliente actualizados");
      handleRefresh();
    } else {
      toast.error("Error al actualizar datos del cliente");
    }
  };

  const handleGuardarDatosTramite = async () => {
    if (!currentTramite) return;
    await onTramiteUpdated({
      ...currentTramite,
      montoSolicitado: Number(headerEditData.monto),
      fechaUltimoContacto: headerEditData.fechaUltimoContacto || undefined,
    });
    handleRefresh();
  };

  const handleCambiarEstadoDocumento = async (
    documentoId: number,
    nuevoEstado: EstadoDocumento,
  ) => {
    if (!currentTramite) return;

    await onTramiteUpdated({
      ...currentTramite,
      documentos: currentTramite.documentos.map((doc) =>
        doc.id === documentoId ? { ...doc, estado: nuevoEstado } : doc,
      ),
    });
  };

  const handleSubirArchivo = (documento: TramiteDocumento) => {
    setDocumentoParaSubir(documento);
    setUploadDialogOpen(true);
  };

  const handleConfirmarSubida = async (
    documento: TramiteDocumento,
    file: File,
  ) => {
    if (!currentTramite) return;

    setUploadLoading(true);
    try {
      documento.file = file;

      const newDocumento = await agregarDocumentoATramite(documento);

      if (newDocumento) {
        toast.success(`Archivo ${file.name} subido exitosamente`);
      } else {
        toast.error("Error al subir el archivo");
      }
      handleRefresh();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.error("Error al subir el archivo");
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleVerArchivo = (documento: TramiteDocumento) => {
    setDocumentoParaVisualizar(documento);
  };

  const handleAgregarObservacionDocumento = (
    documentoId: number,
    observacion: string,
  ) => {
    // TODO: Implementar guardar observación de documento
    console.log("Agregar observación:", documentoId, observacion);
  };

  const getTipoPrestamo = () => {
    const tipo = tipoPrestamoOptions.find(
      (opt) => opt.value === currentTramite?.tipoPrestamo,
    );
    return tipo?.label || "N/A";
  };

  const formatDateOnly = (date?: Date | string) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  // Verificar documentos faltantes

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      sx={{
        height: "95vh",
        minHeight: "95vh",
        PaperProps: {
          sx: { height: "95vh", minHeight: "95vh", maxWidth: "xl" },
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Fila 1: Título + acciones */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" component="div">
              Gestión de Trámite #{currentTramite?.id || tramiteId}
              {!canEdit &&
                currentTramite?.pasoActual.tipoPaso ===
                  TipoPaso.FINAL_EXITOSO && (
                  <span style={{ color: "green" }}> - Autorizado</span>
                )}
              {!canEdit &&
                currentTramite?.pasoActual.tipoPaso ===
                  TipoPaso.FINAL_RECHAZADO && (
                  <span style={{ color: "red" }}> - Rechazado</span>
                )}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Fila 2: Datos + Acciones en una sola fila ocupando todo el ancho */}
          {currentTramite && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              {/* Sección: Datos del Cliente */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  minWidth: 220,
                  flex: "1 1 220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Datos del Cliente
                </Typography>
                <TextField
                  size="small"
                  label="Cliente"
                  value={currentTramite.cliente?.fullName || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Teléfono"
                  value={headerEditData.telefono}
                  onChange={(e) =>
                    setHeaderEditData((prev) => ({
                      ...prev,
                      telefono: e.target.value,
                    }))
                  }
                  fullWidth
                  disabled={!canEdit}
                />
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  value={headerEditData.email}
                  onChange={(e) =>
                    setHeaderEditData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  fullWidth
                  disabled={!canEdit}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarDatosCliente}
                  sx={{ alignSelf: "flex-start", mt: 0.5 }}
                  disabled={!canEdit}
                >
                  Guardar
                </Button>
              </Paper>

              {/* Sección: Datos del Trámite */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  minWidth: 220,
                  flex: "1 1 220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Datos del Trámite
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Monto"
                    fullWidth
                    disabled={!canEdit}
                    slotProps={{
                      htmlInput: { min: 0, step: 1000 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Guardar monto">
                              <IconButton
                                size="small"
                                onClick={handleGuardarDatosTramite}
                                color="primary"
                                sx={{ p: 0.25 }}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      },
                    }}
                    value={headerEditData.monto || ""}
                    onChange={(e) =>
                      setHeaderEditData((prev) => ({
                        ...prev,
                        monto: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="Monto"
                  />
                </Box>
                <TextField
                  size="small"
                  label="Tipo Préstamo"
                  value={getTipoPrestamo()}
                  disabled
                  fullWidth
                />
                <DatePicker
                  value={headerEditData.fechaUltimoContacto}
                  disabled={!canEdit}
                  onChange={(date) =>
                    setHeaderEditData((prev) => ({
                      ...prev,
                      fechaUltimoContacto: date,
                    }))
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      label: "Último contacto",
                      fullWidth: true,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarDatosTramite}
                  sx={{ alignSelf: "flex-start", mt: 0.5 }}
                  disabled={!canEdit}
                >
                  Guardar
                </Button>
              </Paper>

              {/* Panel de Acciones (integrado en el header) */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  minWidth: 200,
                  width: { xs: "100%", md: 260 },
                  flex: { xs: "1 1 100%", md: "0 0 260px" },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  bgcolor: "background.default",
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Acciones
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<ArrowForwardIcon />}
                  disabled={!canAdvance || !canEdit}
                  onClick={() => setAvanzarModalOpen(true)}
                >
                  Avanzar Trámite
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<UndoIcon />}
                  disabled={!canGoBack || !canEdit}
                  onClick={() => setRetrocederModalOpen(true)}
                >
                  Retroceder
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {(headerEditData.telefono ||
                    currentTramite.cliente?.telefono) && (
                    <>
                      <Tooltip title="WhatsApp">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            const telefono = (
                              headerEditData.telefono ||
                              currentTramite.cliente?.telefono ||
                              ""
                            ).replace(/[^\d+]/g, "");
                            window.open(`https://wa.me/${telefono}`, "_blank");
                          }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Llamar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            window.open(
                              `tel:${headerEditData.telefono || currentTramite.cliente?.telefono}`,
                              "_blank",
                            )
                          }
                        >
                          <CallIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {(headerEditData.email || currentTramite.cliente?.email) && (
                    <Tooltip title="Email">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          window.open(
                            `mailto:${headerEditData.email || currentTramite.cliente?.email}`,
                            "_blank",
                          )
                        }
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  disabled={!canEdit}
                  onClick={handleCancelarTramite}
                >
                  Cancelar Trámite
                </Button>
                {currentTramite.pasoActual && (
                  <Chip
                    label={currentTramite.pasoActual.nombre}
                    size="small"
                    sx={{
                      mt: 0.5,
                      backgroundColor: currentTramite.pasoActual.color,
                      color: "white",
                      alignSelf: "flex-start",
                    }}
                  />
                )}
              </Paper>
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: "flex", height: "calc(100% - 120px)" }}
      >
        {error && (
          <Box
            sx={{
              width: "100%",
              position: "absolute",
              top: 30,
              left: 0,
              zIndex: 1000,
            }}
          >
            <ErrorAlert error={error} onRetry={handleRefresh} />
          </Box>
        )}

        {loading && !currentTramite ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              height: "100%",
              minHeight: "100%",
              maxHeight: "100%",
              backgroundColor: "background.white",
              alignItems: "center",
              width: "100%",
            }}
          >
            <LoadingSpinner />
          </Box>
        ) : (
          currentTramite && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Contenido principal - ahora ocupa todo el ancho */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Stepper */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Stepper
                    activeStep={
                      currentTramite.flujo?.pasos
                        .sort((a, b) => a.orden - b.orden)
                        .findIndex(
                          (p) => p.id === currentTramite.pasoActual?.id,
                        ) || 0
                    }
                    alternativeLabel
                  >
                    {currentTramite.flujo?.pasos
                      .sort((a, b) => a.orden - b.orden)
                      .map((paso) => (
                        <Step key={paso.id}>
                          <StepLabel
                            sx={{
                              "& .MuiStepLabel-label": {
                                fontSize: "0.875rem",
                                fontWeight:
                                  paso.id === currentTramite.pasoActual?.id
                                    ? 700
                                    : 400,
                              },
                            }}
                          >
                            <Tooltip title={paso.descripcion || ""}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight:
                                      paso.id === currentTramite.pasoActual?.id
                                        ? 700
                                        : 400,
                                  }}
                                >
                                  {paso.nombre}
                                </Typography>
                                {paso.id === currentTramite.pasoActual?.id && (
                                  <Chip
                                    label="Actual"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      backgroundColor: paso.color,
                                      color: "white",
                                      height: 20,
                                      fontSize: "0.65rem",
                                    }}
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          </StepLabel>
                        </Step>
                      ))}
                  </Stepper>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                  >
                    <Tab
                      label={
                        <Badge
                          badgeContent={documentosPendientes?.length || 0}
                          color="error"
                        >
                          Documentos Pendientes
                        </Badge>
                      }
                    />
                    <Tab
                      label={
                        <Badge
                          badgeContent={documentosCargados?.length || 0}
                          color="error"
                        >
                          Documentos Cargados
                        </Badge>
                      }
                    />
                    <Tab label="Historial" />
                    <Tab label="Observaciones" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  {/* Tab Documentos */}
                  <TabPanel value={activeTab} index={0}>
                    {errorDocumentos && (
                      <Box>
                        <ErrorAlert
                          error={errorDocumentos}
                          onRetry={handleRefresh}
                        />
                      </Box>
                    )}
                    {/* Documentos Pendientes */}
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Documento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha Subida</TableCell>
                            <TableCell>Archivo</TableCell>
                            <TableCell>Observaciones</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingDocumentos ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <LoadingSpinner />
                              </TableCell>
                            </TableRow>
                          ) : documentosPendientes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography color="text.secondary">
                                  No hay documentos pendientes
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            documentosPendientes.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <DescriptionIcon color="action" />
                                    <Typography variant="body2">
                                      {doc?.documento?.nombre || "Sin nombre"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={doc.estado}
                                    size="small"
                                    color={
                                      doc.estado === EstadoDocumento.PENDIENTE
                                        ? "warning"
                                        : doc.estado ===
                                            EstadoDocumento.RECIBIDO
                                          ? "info"
                                          : doc.estado ===
                                              EstadoDocumento.RECHAZADO
                                            ? "error"
                                            : "success"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatDateOnly(doc.fechaSubida)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      maxWidth: 150,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {doc.archivoNombre || "Sin archivo"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    placeholder="Agregar observación"
                                    value={
                                      documentoObservaciones[Number(doc.id)] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setDocumentoObservaciones({
                                        ...documentoObservaciones,
                                        [doc.id!]: e.target.value,
                                      })
                                    }
                                    onBlur={() =>
                                      handleAgregarObservacionDocumento(
                                        Number(doc.id),
                                        documentoObservaciones[
                                          Number(doc.id)
                                        ] || "",
                                      )
                                    }
                                    sx={{ minWidth: 200 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 0.5,
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Tooltip title="Subir archivo">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleSubirArchivo(doc)}
                                        color="primary"
                                        disabled={!canEdit}
                                      >
                                        <UploadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    {doc.archivoNombre && canEdit && (
                                      <Tooltip title="Ver archivo">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleVerArchivo(doc)}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Tab Documentos */}
                  <TabPanel value={activeTab} index={1}>
                    {errorDocumentos && (
                      <Box>
                        <ErrorAlert
                          error={errorDocumentos}
                          onRetry={handleRefresh}
                        />
                      </Box>
                    )}
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Documento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha Subida</TableCell>
                            <TableCell>Archivo</TableCell>
                            <TableCell>Observaciones</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingDocumentos ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <LoadingSpinner />
                              </TableCell>
                            </TableRow>
                          ) : documentosCargados.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography color="text.secondary">
                                  No hay documentos cargados
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            documentosCargados.map((doc: TramiteDocumento) => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <DescriptionIcon color="action" />
                                    <Typography variant="body2">
                                      {doc?.documento?.nombre || "Sin nombre"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={doc.estado}
                                    onChange={(e) =>
                                      handleCambiarEstadoDocumento(
                                        doc.id!,
                                        e.target.value as EstadoDocumento,
                                      )
                                    }
                                    size="small"
                                    sx={{ minWidth: 120 }}
                                    disabled={!canEdit}
                                  >
                                    <MenuItem value={EstadoDocumento.PENDIENTE}>
                                      <Chip
                                        label="Pendiente"
                                        size="small"
                                        color="warning"
                                      />
                                    </MenuItem>
                                    <MenuItem value={EstadoDocumento.RECIBIDO}>
                                      <Chip
                                        label="Recibido"
                                        size="small"
                                        color="info"
                                      />
                                    </MenuItem>
                                    <MenuItem value={EstadoDocumento.RECHAZADO}>
                                      <Chip
                                        label="Rechazado"
                                        size="small"
                                        color="error"
                                      />
                                    </MenuItem>
                                    <MenuItem value={EstadoDocumento.ACEPTADO}>
                                      <Chip
                                        label="Aceptado"
                                        size="small"
                                        color="success"
                                      />
                                    </MenuItem>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatDateOnly(doc.fechaSubida)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      maxWidth: 150,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {doc.archivoNombre || "Sin archivo"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    placeholder="Agregar observación"
                                    value={
                                      documentoObservaciones[Number(doc.id)] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setDocumentoObservaciones({
                                        ...documentoObservaciones,
                                        [doc.id!]: e.target.value,
                                      })
                                    }
                                    onBlur={() =>
                                      handleAgregarObservacionDocumento(
                                        Number(doc.id),
                                        documentoObservaciones[
                                          Number(doc.id)
                                        ] || "",
                                      )
                                    }
                                    sx={{ minWidth: 200 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 0.5,
                                      justifyContent: "center",
                                    }}
                                  >
                                    {doc.archivoNombre && canEdit && (
                                      <Tooltip title="Ver archivo">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleVerArchivo(doc)}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TabPanel>

                  {/* Tab Historial */}
                  <TabPanel value={activeTab} index={2}>
                    {historial.length === 0 ? (
                      <Alert severity="info">
                        No hay historial de pasos registrado
                      </Alert>
                    ) : (
                      <Timeline position="alternate">
                        {historial.map((item: HistorialPaso, index: number) => (
                          <TimelineItem key={item.id}>
                            <TimelineOppositeContent color="text.secondary">
                              <Typography variant="body2">
                                {formatDateOnly(item.fechaInicio)}
                              </Typography>
                              {item.fechaFin && (
                                <Typography variant="caption">
                                  Fin: {formatDateOnly(item.fechaFin)}
                                </Typography>
                              )}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                              <TimelineDot
                                color={
                                  index === 0
                                    ? "primary"
                                    : item.fechaFin
                                      ? "success"
                                      : "grey"
                                }
                              >
                                {index === 0 ? <CheckIcon /> : null}
                              </TimelineDot>
                              {index < historial.length - 1 && (
                                <TimelineConnector />
                              )}
                            </TimelineSeparator>
                            <TimelineContent>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    {item.paso?.nombre}
                                  </Typography>
                                  {item.usuarioResponsable && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Responsable: {item.usuarioResponsable}
                                    </Typography>
                                  )}
                                  {item.observaciones && (
                                    <Typography
                                      variant="body2"
                                      sx={{ mt: 1, fontStyle: "italic" }}
                                    >
                                      {item.observaciones}
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    )}
                  </TabPanel>

                  {/* Tab Observaciones */}
                  <TabPanel value={activeTab} index={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Observaciones del Trámite
                      </Typography>
                      <TextField
                        multiline
                        rows={10}
                        fullWidth
                        value={observacionesEditables}
                        onChange={(e) =>
                          setObservacionesEditables(e.target.value)
                        }
                        placeholder="Agregar observaciones generales del trámite..."
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleGuardarObservaciones}
                        disabled={
                          observacionesEditables ===
                          (currentTramite.observaciones || "")
                        }
                      >
                        Guardar Observaciones
                      </Button>
                    </Box>
                  </TabPanel>
                </Box>
              </Box>
            </Box>
          )
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: "divider" }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Cerrar
        </Button>
      </DialogActions>

      {/* Modales */}

      <ConfirmarAvanceRetrocesoTramiteModal
        open={confirmarTramitePasoFinaDialogOpen}
        paso={pasoSiguienteSeleccionado!}
        tramite={currentTramite!}
        onClose={() => setConfirmarTramitePasoFinaDialogOpen(false)}
        onConfirm={(montoAutorizado) =>
          handleConfirmarPasoFinal(montoAutorizado)
        }
      />
      {canAdvance && (
        <AvanzarTramiteModal
          open={avanzarModalOpen}
          pasosSiguientes={availableTransitionsForward}
          onClose={() => setAvanzarModalOpen(false)}
          onConfirm={handleAvanzarTramite}
        />
      )}

      {canGoBack && (
        <RetrocederModal
          open={retrocederModalOpen}
          onClose={() => setRetrocederModalOpen(false)}
          onConfirm={handleRetrocederTramite}
        />
      )}

      {/* Dialog de subida de documentos */}
      <UploadDocumentoDialog
        open={uploadDialogOpen}
        documento={documentoParaSubir}
        onClose={() => {
          setUploadDialogOpen(false);
          setDocumentoParaSubir(null);
        }}
        onConfirm={handleConfirmarSubida}
        loading={uploadLoading}
      />

      {/* Visor de documentos */}
      <FileViewer
        documento={documentoParaVisualizar}
        open={!!documentoParaVisualizar}
        onClose={() => setDocumentoParaVisualizar(null)}
      />
    </Dialog>
  );
};
