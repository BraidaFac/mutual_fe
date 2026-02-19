"use client";

import { ErrorAlert, LoadingSpinner } from "@/components/shared";
import { fuerzasService } from "@/services/fuerzasService";
import { tramitesService } from "@/services/tramitesService";
import { EstadisticasDashboard, Fuerza, Tramite } from "@/types/index";
import { Add, Assessment, BarChart, ViewKanban } from "@mui/icons-material";
import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import AccionesRapidasDialog from "./AccionesRapidasDialog";
import DashboardStats from "./DashboardStats";
import FiltrosDashboard from "./FiltrosDashboard";
import TramitesPorFuerzaView from "./TramitesPorFuerzaView";
import TramitesPorPasoView from "./TramitesPorPasoView";
import TramitesPorTipoPrestamoView from "./TramitesPorTipoPrestamoView";

type VistaTab = "pasos" | "fuerzas" | "tipos";

export default function DashboardContent() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasDashboard | null>(null);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [fuerzaSeleccionada, setFuerzaSeleccionada] = useState<
    number | undefined
  >();
  const [tipoPrestamoSeleccionado, setTipoPrestamoSeleccionado] = useState<
    string | undefined
  >();
  const [vistaActual, setVistaActual] = useState<VistaTab>("pasos");

  // Estado para acciones rápidas
  const [dialogoAccionAbierto, setDialogoAccionAbierto] = useState(false);
  const [tramiteSeleccionado, setTramiteSeleccionado] =
    useState<Tramite | null>(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState<
    "avanzar" | "contactar" | null
  >(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar fuerzas y estadísticas en paralelo
      const [fuerzasData, estadisticasData] = await Promise.all([
        fuerzasService.getAll(),
        tramitesService.getEstadisticas({
          fuerzaId: fuerzaSeleccionada,
          tipoPrestamo: tipoPrestamoSeleccionado,
        }),
      ]);

      setFuerzas(fuerzasData);
      setEstadisticas(estadisticasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuerzaSeleccionada, tipoPrestamoSeleccionado]);

  const handleFuerzaChange = (fuerzaId?: number) => {
    setFuerzaSeleccionada(fuerzaId);
  };

  const handleTipoPrestamoChange = (tipoPrestamo?: string) => {
    setTipoPrestamoSeleccionado(tipoPrestamo);
  };

  const handleLimpiarFiltros = () => {
    setFuerzaSeleccionada(undefined);
    setTipoPrestamoSeleccionado(undefined);
  };

  const handleVerDetalle = (tramite: Tramite) => {
    // Navegar a la página de trámites con el trámite seleccionado
    router.push(`/tramites?id=${tramite.id}`);
  };

  const handleAvanzarPaso = (tramite: Tramite) => {
    setTramiteSeleccionado(tramite);
    setAccionSeleccionada("avanzar");
    setDialogoAccionAbierto(true);
  };

  const handleContactarCliente = (tramite: Tramite) => {
    setTramiteSeleccionado(tramite);
    setAccionSeleccionada("contactar");
    setDialogoAccionAbierto(true);
  };

  /*   const handleConfirmarAccion = async (
    tramite: Tramite,
    accion: "avanzar" | "contactar",
    datos?: { observaciones?: string },
  ) => {
    try {
      if (accion === "avanzar") {
        await tramitesService.avanzarPaso(tramite.id, tramite.pasoActual.id);
        enqueueSnackbar("Trámite avanzado correctamente", {
          variant: "success",
        });
      } else if (accion === "contactar") {
        await tramitesService.actualizarUltimoContacto(tramite.id);
        enqueueSnackbar("Contacto registrado correctamente", {
          variant: "success",
        });
      }

      // Recargar datos
      await cargarDatos();
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "Error al realizar la acción",
        { variant: "error" },
      );
    }
  }; */

  const handleNuevoTramite = () => {
    router.push("/tramites?nuevo=true");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert
        error={error}
        onRetry={cargarDatos}
        title="Error al cargar el dashboard"
      />
    );
  }

  if (!estadisticas) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary">
          No hay datos disponibles para mostrar
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Dashboard de Trámites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualización completa de todos los trámites en el sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNuevoTramite}
          size="large"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #63408b 100%)",
            },
          }}
        >
          Nuevo Trámite
        </Button>
      </Box>

      {/* Filtros */}
      <FiltrosDashboard
        fuerzas={fuerzas}
        fuerzaSeleccionada={fuerzaSeleccionada}
        tipoPrestamoSeleccionado={tipoPrestamoSeleccionado}
        onFuerzaChange={handleFuerzaChange}
        onTipoPrestamoChange={handleTipoPrestamoChange}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Estadísticas generales (KPIs) */}
      <Box mb={4}>
        <DashboardStats estadisticas={estadisticas} />
      </Box>

      {/* Tabs para diferentes vistas */}
      <Box mb={3}>
        <Tabs
          value={vistaActual}
          onChange={(_, newValue) => setVistaActual(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<ViewKanban />}
            iconPosition="start"
            label="Vista por Pasos"
            value="pasos"
          />
          <Tab
            icon={<Assessment />}
            iconPosition="start"
            label="Vista por Fuerza"
            value="fuerzas"
          />
          <Tab
            icon={<BarChart />}
            iconPosition="start"
            label="Vista por Tipo de Préstamo"
            value="tipos"
          />
        </Tabs>
      </Box>

      {/* Contenido según la vista seleccionada */}
      <Box mb={4}>
        {vistaActual === "pasos" && (
          <TramitesPorPasoView
            estadisticasPorPaso={estadisticas.porPaso}
            onVerDetalle={handleVerDetalle}
            onAvanzarPaso={handleAvanzarPaso}
            onContactarCliente={handleContactarCliente}
          />
        )}

        {vistaActual === "fuerzas" && (
          <TramitesPorFuerzaView
            estadisticasPorFuerza={estadisticas.porFuerza}
          />
        )}

        {vistaActual === "tipos" && (
          <TramitesPorTipoPrestamoView
            estadisticasPorTipoPrestamo={estadisticas.porTipoPrestamo}
          />
        )}
      </Box>

      {/* Diálogo de acciones rápidas */}
      <AccionesRapidasDialog
        open={dialogoAccionAbierto}
        tramite={tramiteSeleccionado}
        accion={accionSeleccionada}
        onClose={() => {
          setDialogoAccionAbierto(false);
          setTramiteSeleccionado(null);
          setAccionSeleccionada(null);
        }}
        onConfirmar={() => {}}
      />
    </Box>
  );
}
