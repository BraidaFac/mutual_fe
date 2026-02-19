/**
 * Componente para las acciones disponibles en un trámite
 * Maneja transiciones, edición y otras operaciones
 */
import { LoadingSpinner } from "@/components/shared";
import { PasoTramite, Tramite } from "@/types/index";
import {
  PlayArrow as AdvanceIcon,
  NavigateBefore as BackIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

interface TramiteActionsProps {
  tramite: Tramite;
  canAdvance?: boolean;
  canGoBack?: boolean;
  canCancel?: boolean;
  canEdit?: boolean;
  loading?: boolean;
  onAdvance?: (observaciones?: string) => void;
  onGoBack?: (observaciones?: string) => void;
  onCancel?: (motivo?: string) => void;
  onEdit?: () => void;
  onContact?: (tipo: "whatsapp" | "phone" | "email") => void;
  nextStep?: PasoTramite | null;
  previousStep?: PasoTramite | null;
}

export const TramiteActions: React.FC<TramiteActionsProps> = ({
  tramite,
  canAdvance = false,
  canGoBack = false,
  canCancel = true,
  canEdit = true,
  loading = false,
  onAdvance,
  onGoBack,
  onCancel,
  onEdit,
  onContact,
  nextStep,
  previousStep,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "advance" | "back" | "cancel" | null;
    open: boolean;
  }>({ type: null, open: false });
  const [actionComment, setActionComment] = useState("");

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleActionClick = (type: "advance" | "back" | "cancel") => {
    setActionDialog({ type, open: true });
    setActionComment("");
    handleMenuClose();
  };

  const handleActionConfirm = () => {
    const { type } = actionDialog;

    switch (type) {
      case "advance":
        onAdvance?.(actionComment || undefined);
        break;
      case "back":
        onGoBack?.(actionComment || undefined);
        break;
      case "cancel":
        onCancel?.(actionComment || undefined);
        break;
    }

    setActionDialog({ type: null, open: false });
    setActionComment("");
  };

  const handleActionCancel = () => {
    setActionDialog({ type: null, open: false });
    setActionComment("");
  };

  const handleContact = (tipo: "whatsapp" | "phone" | "email") => {
    onContact?.(tipo);
    handleMenuClose();
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const getActionDialogTitle = () => {
    switch (actionDialog.type) {
      case "advance":
        return `Avanzar a: ${nextStep?.nombre}`;
      case "back":
        return `Retroceder a: ${previousStep?.nombre}`;
      case "cancel":
        return "Cancelar Trámite";
      default:
        return "";
    }
  };

  const getActionDialogContent = () => {
    switch (actionDialog.type) {
      case "advance":
        return `¿Confirma que desea avanzar el trámite al paso "${nextStep?.nombre}"?`;
      case "back":
        return `¿Confirma que desea retroceder el trámite al paso "${previousStep?.nombre}"?`;
      case "cancel":
        return "¿Confirma que desea cancelar este trámite? Esta acción no se puede deshacer.";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <LoadingSpinner size={24} />
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
      >
        {/* Acciones principales */}
        {canAdvance && nextStep && (
          <Button
            variant="contained"
            startIcon={<AdvanceIcon />}
            onClick={() => handleActionClick("advance")}
            disabled={loading}
            color="primary"
          >
            Avanzar
          </Button>
        )}

        {canGoBack && previousStep && (
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => handleActionClick("back")}
            disabled={loading}
            color="secondary"
          >
            Retroceder
          </Button>
        )}

        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            disabled={loading}
          >
            Editar
          </Button>
        )}

        {/* Acciones de contacto rápidas */}
        {tramite.cliente.telefono && (
          <Tooltip title="WhatsApp">
            <IconButton
              color="success"
              onClick={() => handleContact("whatsapp")}
              disabled={loading}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
        )}

        {tramite.cliente.telefono && (
          <Tooltip title="Llamar">
            <IconButton
              color="info"
              onClick={() => handleContact("phone")}
              disabled={loading}
            >
              <PhoneIcon />
            </IconButton>
          </Tooltip>
        )}

        {tramite.cliente.email && (
          <Tooltip title="Email">
            <IconButton
              color="info"
              onClick={() => handleContact("email")}
              disabled={loading}
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Menú de acciones adicionales */}
        <IconButton onClick={handleMenuOpen} disabled={loading}>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {canCancel && (
          <MenuItem onClick={() => handleActionClick("cancel")}>
            <CancelIcon sx={{ mr: 1 }} color="error" />
            Cancelar Trámite
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de confirmación de acciones */}
      <Dialog
        open={actionDialog.open}
        onClose={handleActionCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{getActionDialogTitle()}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getActionDialogContent()}
          </Typography>

          {actionDialog.type === "advance" &&
            nextStep?.requiereIntervencionManual && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                El siguiente paso requiere intervención manual.
              </Alert>
            )}

          {actionDialog.type === "cancel" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Cliente:</strong> {tramite.cliente.fullName}
                <br />
                <strong>Monto:</strong>{" "}
                {formatMonto(tramite.montoSolicitado || 0)}
                <br />
                <strong>Paso actual:</strong> {tramite.pasoActual?.nombre}
              </Typography>
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label={
              actionDialog.type === "cancel"
                ? "Motivo de cancelación"
                : "Observaciones (opcional)"
            }
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            required={actionDialog.type === "cancel"}
            placeholder={
              actionDialog.type === "cancel"
                ? "Indique el motivo de la cancelación..."
                : "Agregue observaciones sobre esta transición..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionCancel}>Cancelar</Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            color={actionDialog.type === "cancel" ? "error" : "primary"}
            disabled={actionDialog.type === "cancel" && !actionComment.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
