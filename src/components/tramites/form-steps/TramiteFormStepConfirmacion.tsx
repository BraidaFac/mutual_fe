/**
 * Paso 4 del formulario: Confirmación de datos
 * Componente para revisar todos los datos antes de crear/actualizar el trámite
 */
import {
  Cliente,
  ClienteFormData,
  EstadoDocumento,
  TramiteDocumento,
  TramiteFormData,
  tipoPrestamoOptions,
} from "@/types/index";
import {
  AccountBalance as BankIcon,
  CheckCircle as CheckIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { TipoCliente } from "./TramiteFormStepCliente";

interface FormData {
  cliente: Cliente | null;
  nuevoCliente: ClienteFormData;
  tramite: TramiteFormData;
  documentos: TramiteDocumento[];
  tipoCliente: TipoCliente;
}

interface TramiteFormStepConfirmacionProps {
  formData: FormData;
  isEditMode: boolean;
}

export const TramiteFormStepConfirmacion: React.FC<
  TramiteFormStepConfirmacionProps
> = ({ formData, isEditMode }) => {
  useEffect(() => {}, [formData]);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <CheckIcon color="success" />
        <Typography variant="h6">
          {isEditMode ? "Confirmar Cambios" : "Confirmar Nuevo Trámite"}
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {isEditMode
            ? "Revise los cambios antes de actualizar el trámite."
            : "Revise todos los datos antes de crear el trámite. Una vez creado, algunos datos no podrán modificarse."}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Información del Cliente */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <PersonIcon color="primary" />
                <Typography variant="h6">Cliente</Typography>
                <Chip
                  label={
                    formData.tipoCliente === TipoCliente.EXISTENTE
                      ? "Existente"
                      : "Nuevo"
                  }
                  size="small"
                  color={
                    formData.tipoCliente === TipoCliente.EXISTENTE
                      ? "primary"
                      : "secondary"
                  }
                />
              </Box>

              {formData.tipoCliente === TipoCliente.EXISTENTE &&
              formData.cliente ? (
                <Box>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {formData.cliente.fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Email:</strong> {formData.cliente.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Teléfono:</strong>{" "}
                    {formData.cliente.telefono || "No especificado"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Fuerza:</strong> {formData.cliente.fuerza?.nombre}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={formData.cliente.esSocio ? "Socio" : "No Socio"}
                      size="small"
                      color={formData.cliente.esSocio ? "success" : "default"}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {formData.nuevoCliente.fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>DNI:</strong>{" "}
                    {formData.nuevoCliente.dni || "No especificado"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Email:</strong> {formData.nuevoCliente.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Teléfono:</strong> {formData.nuevoCliente.telefono}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={
                        formData.nuevoCliente.esSocio ? "Socio" : "No Socio"
                      }
                      size="small"
                      color={
                        formData.nuevoCliente.esSocio ? "success" : "default"
                      }
                      variant="outlined"
                    />
                    <Chip
                      label="Nuevo Cliente"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  {formData.nuevoCliente.observaciones && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Observaciones:</strong>{" "}
                        {formData.nuevoCliente.observaciones}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Trámite */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <BankIcon color="primary" />
                <Typography variant="h6">Datos del Trámite</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Tipo de Préstamo:</strong>
                </Typography>
                <Chip
                  label={
                    tipoPrestamoOptions.find(
                      (opt) => opt.value === formData.tramite.tipoPrestamo,
                    )?.label || "No especificado"
                  }
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Monto Solicitado:</strong>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" color="success.main">
                    {formatMonto(formData.tramite.montoSolicitado || 0)}
                  </Typography>
                </Box>
              </Box>

              {formData.tramite.observaciones && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Observaciones:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formData.tramite.observaciones}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DocumentIcon color="primary" />
                <Typography variant="h6">Documentos</Typography>
                <Chip
                  label={`${
                    formData.documentos.filter(
                      (doc) => doc.estado === EstadoDocumento.RECIBIDO,
                    ).length
                  } archivo${
                    formData.documentos.filter(
                      (doc) => doc.estado === EstadoDocumento.RECIBIDO,
                    ).length > 1
                      ? "s"
                      : ""
                  }`}
                  size="small"
                  color="secondary"
                />
              </Box>

              {(formData.documentos?.some(
                (doc) => doc.estado === EstadoDocumento.RECIBIDO,
              ) ?? false) ? (
                <Box>
                  <List dense>
                    {formData.documentos
                      .filter((doc) => doc.estado === EstadoDocumento.RECIBIDO)
                      .map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <DocumentIcon color="secondary" />
                          </ListItemIcon>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body1">
                              {doc.documento!.nombre}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <Chip
                                label={doc.archivoNombre || "ARCHIVO"}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              ) : (
                <Alert severity="info">
                  No se han subido documentos en esta etapa.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
