/**
 * Paso 1 del formulario: Selección/Creación de Cliente
 * Componente especializado siguiendo Single Responsibility Principle
 */
import { FormField, LoadingSpinner } from "@/components/shared";
import {
  clientesService,
  fuerzasService,
  provinciasService,
} from "@/services/index";
import {
  Cliente,
  ClienteFormData,
  ClienteFormDataErrors,
  Fuerza,
  Provincia,
} from "@/types/index";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface TramiteFormStepClienteProps {
  tipoCliente: TipoCliente;
  cliente: Cliente | null;
  nuevoCliente: ClienteFormData;
  errors: ClienteFormDataErrors;
  onTipoClienteChange: (tipo: TipoCliente) => void;
  onClienteChange: (cliente: Cliente | null) => void;
  onNuevoClienteChange: (data: Partial<ClienteFormData>) => void;
  onSubmitNuevoCliente: () => void;
}

export enum TipoCliente {
  EXISTENTE = 0,
  NUEVO = 1,
}

export const TramiteFormStepCliente: React.FC<TramiteFormStepClienteProps> = ({
  tipoCliente,
  cliente,
  nuevoCliente,
  errors,
  onTipoClienteChange,
  onClienteChange,
  onNuevoClienteChange,
  onSubmitNuevoCliente,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteValue, setClienteValue] = useState<Cliente | null>(cliente);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const cargarDatosReferencia = useCallback(async () => {
    try {
      setLoading(true);
      const [fuerzasData, provinciasData] = await Promise.all([
        fuerzasService.getAll(),
        provinciasService.getAll(),
      ]);
      setFuerzas(fuerzasData);
      setProvincias(provinciasData);
    } catch (error) {
      console.error("Error cargando datos de referencia:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  // Cargar datos de referencia
  useEffect(() => {
    cargarDatosReferencia();
  }, [cargarDatosReferencia]);

  // Cargar clientes cuando se selecciona tipo existente
  useEffect(() => {
    if (tipoCliente === TipoCliente.EXISTENTE && clientes.length === 0) {
      const cargarClientes = async () => {
        try {
          setLoadingClientes(true);
          const clientesData = await clientesService.getAll();
          setClientes(clientesData);
        } catch (error) {
          console.error("Error cargando clientes:", error);
        } finally {
          setLoadingClientes(false);
        }
      };

      cargarClientes();
    }
  }, [tipoCliente, clientes.length]);

  useEffect(() => {
    if (tipoCliente === TipoCliente.NUEVO) {
      setClienteValue(null);
    }
  }, [tipoCliente]);

  const handleNuevoClienteFieldChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    onNuevoClienteChange({ [field]: value });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <PersonIcon color="primary" />
        <Typography variant="h6">Información del Cliente</Typography>
      </Box>

      {/* Selector de tipo de cliente */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tipo de Cliente
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant={
              tipoCliente === TipoCliente.EXISTENTE ? "contained" : "outlined"
            }
            onClick={() => onTipoClienteChange(TipoCliente.EXISTENTE)}
            startIcon={<PersonIcon />}
          >
            Cliente Existente
          </Button>
          <Button
            variant={
              tipoCliente === TipoCliente.NUEVO ? "contained" : "outlined"
            }
            onClick={() => onTipoClienteChange(TipoCliente.NUEVO)}
            startIcon={<AddIcon />}
          >
            Nuevo Cliente
          </Button>
        </Box>
      </Box>

      {/* Cliente existente */}
      {tipoCliente === TipoCliente.EXISTENTE && (
        <Box>
          {loadingClientes ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Autocomplete
              options={clientes}
              getOptionKey={(option) => option.id}
              value={clienteValue}
              onChange={(_, value) => {
                setClienteValue(value as Cliente | null);
                onClienteChange(value as Cliente | null);
              }}
              getOptionLabel={(option) => `${option.fullName}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar cliente"
                  placeholder="Escriba para buscar..."
                  fullWidth
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" key={key} {...rest}>
                    <Box>
                      <Typography variant="body1">{option.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.email} • {option.telefono || "Sin teléfono"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.fuerza?.nombre} •{" "}
                        {option.esSocio ? "Socio" : "No socio"}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              noOptionsText="No se encontraron clientes"
              loadingText="Cargando..."
            />
          )}

          {clienteValue && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Cliente seleccionado:</strong> {clienteValue.fullName}
                <br />
                <strong>Email:</strong> {clienteValue.email}
                <br />
                <strong>Teléfono:</strong>{" "}
                {clienteValue.telefono || "No especificado"}
                <br />
                <strong>Fuerza:</strong> {clienteValue.fuerza?.nombre}
                <br />
                <strong>Socio:</strong> {clienteValue.esSocio ? "Sí" : "No"}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Nuevo cliente */}
      {tipoCliente === TipoCliente.NUEVO && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="text"
              name="fullName"
              label="Nombre Completo"
              value={nuevoCliente.fullName}
              onChange={(value) =>
                handleNuevoClienteFieldChange("fullName", value)
              }
              required
              error={errors.fullName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="text"
              name="dni"
              label="DNI"
              value={nuevoCliente.dni?.toString() || ""}
              onChange={(value) => handleNuevoClienteFieldChange("dni", value)}
              error={errors.dni}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="email"
              name="email"
              label="Email"
              value={nuevoCliente.email}
              onChange={(value) =>
                handleNuevoClienteFieldChange("email", value)
              }
              required
              error={errors.email}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="tel"
              name="telefono"
              label="Teléfono"
              value={nuevoCliente.telefono}
              onChange={(value) =>
                handleNuevoClienteFieldChange("telefono", value)
              }
              required
              error={errors.telefono}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="select"
              name="fuerzaId"
              label="Fuerza"
              value={nuevoCliente.fuerzaId?.toString() || ""}
              onChange={(value) =>
                handleNuevoClienteFieldChange("fuerzaId", Number(value))
              }
              options={fuerzas.map((f) => ({
                value: f.id.toString(),
                label: f.nombre,
              }))}
              required
              error={errors.fuerzaId}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField
              type="select"
              name="provinciaId"
              label="Provincia"
              value={nuevoCliente.provinciaId?.toString() || ""}
              onChange={(value) =>
                handleNuevoClienteFieldChange("provinciaId", Number(value))
              }
              options={provincias.map((p) => ({
                value: p.id.toString(),
                label: p.nombre,
              }))}
              required
              error={errors.provinciaId}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={nuevoCliente.esSocio}
                  onChange={(e) =>
                    handleNuevoClienteFieldChange("esSocio", e.target.checked)
                  }
                />
              }
              label="Es socio"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="observaciones"
              label="Observaciones"
              value={nuevoCliente.observaciones}
              onChange={(e) =>
                handleNuevoClienteFieldChange("observaciones", e.target.value)
              }
              placeholder="Información adicional sobre el cliente..."
            />
          </Grid>
          <Button variant="contained" onClick={() => onSubmitNuevoCliente()}>
            Guardar
          </Button>
        </Grid>
      )}
    </Box>
  );
};
