"use client";

import {
  Action,
  Column,
  DataTable,
  ErrorAlert,
  LoadingSpinner,
  PageHeader,
  StatusChip,
} from "@/components/shared";
import { flujosService, fuerzasService } from "@/services/index";
import { FlujoTramite, Fuerza, TipoPrestamo } from "@/types/index";
import { Add as AddIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import FlujoDialog from "./FlujoDialog";
import FlujoVisualEditor from "./FlujoVisualEditor";

export default function FlujosContent() {
  const [flujos, setFlujos] = useState<FlujoTramite[]>([]);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para dialogs
  const [flujoDialogOpen, setFlujoDialogOpen] = useState(false);

  const [visualizacionDialogOpen, setVisualizacionDialogOpen] = useState(false);
  //const [pasosDialogOpen, setPasosDialogOpen] = useState(false);
  const [flujoSeleccionado, setFlujoSeleccionado] =
    useState<FlujoTramite | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [flujosData, fuerzasData] = await Promise.all([
        flujosService.getAll(),
        fuerzasService.getAll(),
      ]);

      setFlujos(flujosData);
      setFuerzas(fuerzasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar flujos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrar flujos por búsqueda
  const handleNuevoFlujo = () => {
    setFlujoSeleccionado(null);
    setFlujoDialogOpen(true);
  };

  const handleEditarFlujo = async (flujo: FlujoTramite) => {
    if (!flujo.id) return;
    try {
      const flujoData = await flujosService.getById(flujo.id);
      console.log("flujoData", flujoData);
      setFlujoSeleccionado(flujoData);
      setFlujoDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar flujo");
    }
  };

  const handleGestionarPasos = (flujo: FlujoTramite) => {
    setFlujoSeleccionado(flujo);
    //setPasosDialogOpen(true);
  };

  const handleEliminarFlujo = async (flujo: FlujoTramite) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el flujo "${flujo.nombre}"?`,
      )
    ) {
      try {
        await flujosService.delete(flujo.id!);
        await cargarDatos();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar flujo",
        );
      }
    }
  };

  const handleFlujoGuardado = () => {
    setFlujoDialogOpen(false);
    setFlujoSeleccionado(null);
    cargarDatos();
  };

  const getTipoPrestamoBadge = (tipoPrestamo?: TipoPrestamo) => {
    if (!tipoPrestamo) {
      return <StatusChip status="General" color="default" />;
    }

    const colorMap: Record<
      TipoPrestamo,
      "success" | "warning" | "info" | "default" | "urgent"
    > = {
      [TipoPrestamo.EXTRAORDINARIO]: "urgent",
      [TipoPrestamo.PORCAJA]: "warning",
      [TipoPrestamo.PORHABERES]: "success",
      [TipoPrestamo.PORHABERES_CON_CANCELACION_SMSV]: "info",
      [TipoPrestamo.PORHABERES_CON_CANCELACION_OTROS]: "info",
      [TipoPrestamo.TARJETA_DE_CREDITO]: "info",
      [TipoPrestamo.OTROS]: "default",
    };

    const labelMap: Record<TipoPrestamo, string> = {
      [TipoPrestamo.EXTRAORDINARIO]: "Extraordinario",
      [TipoPrestamo.PORCAJA]: "Por Caja",
      [TipoPrestamo.PORHABERES]: "Por Haberes",
      [TipoPrestamo.PORHABERES_CON_CANCELACION_SMSV]: "Haberes + Canc. SMSV",
      [TipoPrestamo.PORHABERES_CON_CANCELACION_OTROS]: "Haberes + Canc. Otros",
      [TipoPrestamo.TARJETA_DE_CREDITO]: "Tarjeta de Crédito",
      [TipoPrestamo.OTROS]: "Otros",
    };

    return (
      <StatusChip
        status={labelMap[tipoPrestamo]}
        color={colorMap[tipoPrestamo]}
      />
    );
  };

  const columns: Column[] = [
    {
      id: "nombre",
      label: "Nombre del Flujo",
      format: (value: string) => value,
    },
    {
      id: "fuerza",
      label: "Fuerza",
      format: (value: unknown, row: FlujoTramite) =>
        row.fuerza?.nombre || "Sin fuerza",
    },
    {
      id: "tipoPrestamo",
      label: "Tipo de Préstamo",
      format: (value: unknown, row: FlujoTramite) =>
        getTipoPrestamoBadge(row.tipoPrestamo),
    },
    {
      id: "pasos",
      label: "Pasos Configurados",
      format: (value: unknown, row: FlujoTramite) => {
        const cantidadPasos = row.pasos?.length || 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>
              {cantidadPasos} paso{cantidadPasos !== 1 ? "s" : ""}
            </span>
            <Tooltip title="Gestionar pasos">
              <IconButton
                size="small"
                onClick={() => handleGestionarPasos(row)}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      id: "documentos",
      label: "Documentos Requeridos",
      format: (value: unknown, row: FlujoTramite) => {
        const cantidadDocs = row.documentosRequeridos?.length || 0;
        return `${cantidadDocs} documento${cantidadDocs !== 1 ? "s" : ""}`;
      },
    },
    {
      id: "activo",
      label: "Estado",
      format: (value: unknown, row: FlujoTramite) =>
        row.activo ? (
          <StatusChip status="Activo" color="success" />
        ) : (
          <StatusChip status="Inactivo" color="warning" />
        ),
    },
  ];

  const actions: Action[] = [
    {
      type: "view",
      label: "Visualizar",
      onClick: (flujo: FlujoTramite) => handleVerVisualizacion(flujo),
    },
    {
      type: "edit",
      label: "Editar",
      onClick: (flujo: FlujoTramite) => handleEditarFlujo(flujo),
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: (flujo: FlujoTramite) => handleEliminarFlujo(flujo),
    },
  ];

  if (loading && flujos.length === 0) {
    return <LoadingSpinner />;
  }

  const handleVerVisualizacion = (flujo: FlujoTramite) => {
    setFlujoSeleccionado(flujo);
    setVisualizacionDialogOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Gestión de Flujos de Trámite"
        subtitle="Configuración de flujos, pasos y documentos requeridos por fuerza"
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

      <DataTable
        columns={columns}
        data={flujos}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron flujos configurados"
      />

      {/* Dialogs */}
      <FlujoDialog
        open={flujoDialogOpen}
        onClose={() => {
          setFlujoDialogOpen(false);
          setFlujoSeleccionado(null);
        }}
        onFlujoGuardado={handleFlujoGuardado}
        flujo={flujoSeleccionado as FlujoTramite}
        fuerzas={fuerzas}
      />
      <FlujoVisualEditor
        open={visualizacionDialogOpen}
        onClose={() => setVisualizacionDialogOpen(false)}
        flujo={flujoSeleccionado}
        onFlujoActualizado={cargarDatos}
      />
    </Box>
  );
}
