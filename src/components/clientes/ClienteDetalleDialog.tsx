"use client";

import { Cliente } from "@/types/index";
import {
  AccessTime,
  CalendarToday,
  Edit,
  Email,
  LocationOn,
  Notes,
  Person,
  Phone,
} from "@mui/icons-material";
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

interface ClienteDetalleDialogProps {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onEditar: () => void;
}

export default function ClienteDetalleDialog({
  open,
  cliente,
  onClose,
  onEditar,
}: ClienteDetalleDialogProps) {
  if (!cliente) return null;

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*  const diasSinContacto =
    cliente.tramites.length > 0 && cliente.tramites[0].fechaUltimoContacto
      ? Math.floor(
          (new Date().getTime() -
            new Date(cliente.tramites[0].fechaUltimoContacto).getTime()) /
            (1000 * 3600 * 24)
        )
      : null; */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalles del Cliente</Typography>
          <Button variant="outlined" startIcon={<Edit />} onClick={onEditar}>
            Editar
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              <Person sx={{ verticalAlign: "middle", mr: 1 }} />
              Información Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre Completo
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {cliente.fullName}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estado Actual
                </Typography>
                <Box>
                  {cliente.esSocio ? (
                    <Chip
                      label={cliente.esSocio ? "Socio" : "No socio"}
                      color={cliente.esSocio ? "success" : "error"}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin socio
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Información de Contacto */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Información de Contacto
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Email color="action" />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={cliente.email} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Phone color="action" />
                </ListItemIcon>
                <ListItemText primary="Teléfono" secondary={cliente.telefono} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <LocationOn color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Provincia"
                  secondary={
                    cliente.provincia
                      ? `${cliente.provincia.nombre}`
                      : "No especificada"
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Información de Fechas */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Fechas Importantes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Creación
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formatFecha(cliente.createdAt)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Último Contacto
                  </Typography>
                </Box>
                <Box>
                  {/* ? (
                    <>
                      <Typography variant="body1">
                        {formatFecha(cliente.)}
                      </Typography>
                      {diasSinContacto !== null && diasSinContacto > 0 && (
                        <Chip
                          label={`${diasSinContacto} día${
                            diasSinContacto > 1 ? "s" : ""
                          } sin contacto`}
                          size="small"
                          color={
                            diasSinContacto > 7
                              ? "error"
                              : diasSinContacto > 3
                              ? "warning"
                              : "default"
                          }
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </>
                  ) : */}

                  <Typography variant="body2" color="text.secondary">
                    Sin contacto registrado
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Observaciones */}
          {cliente.observaciones && (
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                <Notes sx={{ verticalAlign: "middle", mr: 1 }} />
                Observaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                  {cliente.observaciones}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Información del Representante */}
          {cliente.representante && (
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Representante Asignado
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ p: 2, backgroundColor: "primary.50", borderRadius: 1 }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {cliente.representante.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {cliente.representante?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Teléfono: {cliente.representante?.telefono}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
