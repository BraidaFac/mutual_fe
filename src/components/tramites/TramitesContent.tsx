/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Action,
  Column,
  DataTable,
  ErrorAlert,
  PageHeader,
  SearchAndFilters,
  StatusChip,
} from "@/components/shared";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useTramiteManagement } from "@/hooks/useTramiteManagement";
import {
  fuerzasService,
  provinciasService,
  tramitesService,
} from "@/services/index";
import { TipoPaso } from "@/types/flujo.types";
import {
  FiltroTramites,
  Fuerza,
  Provincia,
  TipoPrestamo,
  tipoPrestamoOptions,
  Tramite,
} from "@/types/index";
import {
  Add as AddIcon,
  Delete,
  Edit as EditIcon,
  Print as PrintIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { FilterType } from "../shared/SearchAndFilters";
import { TramiteFormDialog } from "./TramiteFormDialog";
import { TramiteManager } from "./TramiteManager";

export default function TramitesContent() {
  const { showSuccess, handleError, showError } = useErrorHandler();
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltroTramites>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [nuevoTramiteOpen, setNuevoTramiteOpen] = useState(false);
  const [detalleTramiteOpen, setDetalleTramiteOpen] = useState(false);
  const [editarTramiteOpen, setEditarTramiteOpen] = useState(false);
  const [tramiteSeleccionado, setTramiteSeleccionado] =
    useState<Tramite | null>(null);

  const [tramiteState, tramiteActions] = useTramiteManagement();
  const { tramites, paginationMeta } = tramiteState;
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const { loadTramites } = tramiteActions;

  const loadProvincias = useCallback(async () => {
    try {
      setError(null);
      const provincias = await provinciasService.getAll();
      setProvincias(provincias);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar provincias",
      );
    } finally {
    }
  }, []);

  const loadFuerzas = useCallback(async () => {
    try {
      setError(null);
      const fuerzas = await fuerzasService.getAll();
      setFuerzas(fuerzas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fuerzas");
    } finally {
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      const filtrosConBusqueda = searchValue
        ? { ...filtros, search: searchValue }
        : filtros;

      await loadTramites(filtrosConBusqueda);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar trámites");
    } finally {
    }
  }, [filtros, searchValue, loadTramites]);

  useEffect(() => {
    loadProvincias();
    loadFuerzas();
  }, [loadProvincias, loadFuerzas]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  // Funciones para manejar acciones
  const handleEliminarTramite = async (tramite: Tramite) => {
    if (window.confirm("¿Estás seguro de querer eliminar este trámite?")) {
      await tramitesService.delete(tramite.id);
      cargarDatos();
    }
  };

  const handleEditarTramite = async (tramite: Tramite) => {
    setTramiteSeleccionado(tramite);
    setDetalleTramiteOpen(true);
  };

  const handleWhatsApp = (tramite: Tramite) => {
    if (tramite.cliente?.telefono) {
      // Limpiar el número de teléfono (remover espacios, guiones, etc.)
      const telefono = tramite.cliente.telefono.replace(/[^\d+]/g, "");
      const mensaje = encodeURIComponent(
        `Hola ${
          tramite.cliente.fullName
        }, me comunico respecto a su trámite por ${formatMonto(
          tramite.montoSolicitado || 0,
        )}. Paso actual: ${tramite.pasoActual?.nombre || "Sin paso"}.`,
      );
      const whatsappUrl = `https://wa.me/${telefono}?text=${mensaje}`;
      window.open(whatsappUrl, "_blank");
    } else {
      alert("Este cliente no tiene número de teléfono registrado");
    }
  };

  const handleNuevoTramite = () => {
    setNuevoTramiteOpen(true);
  };

  const handlePageChange = (page: number, rowsPerPage: number) => {
    setFiltros((prev) => ({ ...prev, page, limit: rowsPerPage }));
  };

  const handleImprimir = async () => {
    if (!filtros.fechaDesde || !filtros.tipoPaso) {
      showError(
        "Para generar el reporte debe especificar al menos Fecha Desde y Estado del trámite",
      );
      return;
    }
    try {
      const filtrosReporte = {
        ...filtros,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        tipoPaso: filtros.tipoPaso,
        tipoPrestamo: filtros.tipoPrestamo,
        provinciaId: filtros.provinciaId,
        fuerzaId: filtros.fuerzaId,
        search: searchValue || filtros.search,
      };
      const blob = await tramitesService.getReport(filtrosReporte);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-tramites-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("Reporte generado correctamente");
    } catch (err) {
      handleError(
        err instanceof Error ? err.message : "Error al generar el reporte",
      );
    }
  };

  // Colores pastel para el chip según tipo de paso
  const getChipColorForTipoPaso = (
    tipoPaso?: TipoPaso,
  ): "urgent" | "warning" | "success" | "info" | "default" => {
    switch (tipoPaso) {
      case TipoPaso.INICIAL:
        return "info";
      case TipoPaso.INTERMEDIO:
        return "warning";
      case TipoPaso.FINAL_EXITOSO:
        return "success";
      case TipoPaso.FINAL_RECHAZADO:
        return "urgent";
      default:
        return "default";
    }
  };

  // Colores pastel para el fondo de las filas según tipo de paso
  const COLORES_PASTEL_POR_TIPO: Record<TipoPaso, string> = {
    [TipoPaso.INICIAL]: "#e3f2fd", // Azul pastel
    [TipoPaso.INTERMEDIO]: "#fff8e1", // Ámbar pastel
    [TipoPaso.FINAL_EXITOSO]: "#e8f5e9", // Verde pastel
    [TipoPaso.FINAL_RECHAZADO]: "#ffebee", // Rojo pastel
  };

  const getRowSx = (row: Tramite) => {
    const tipoPaso = row.pasoActual?.tipoPaso;
    if (!tipoPaso || !(tipoPaso in COLORES_PASTEL_POR_TIPO)) {
      return {};
    }
    return {
      backgroundColor: COLORES_PASTEL_POR_TIPO[tipoPaso as TipoPaso],
      "&:hover": {
        backgroundColor: COLORES_PASTEL_POR_TIPO[tipoPaso as TipoPaso],
        filter: "brightness(0.97)",
      },
    };
  };

  const columns: Column[] = [
    {
      id: "numeroTramite",
      label: "Número de Trámite",
      format: (value, row: Tramite) =>
        row.numeroTramite ? `${row.numeroTramite}` : "Sin número de trámite",
    },
    {
      id: "cliente",
      label: "Cliente",
      format: (value, row: Tramite) =>
        row.cliente ? `${row.cliente.fullName}` : "Sin cliente",
    },
    {
      id: "telefono",
      label: "Teléfono",
      format: (value, row: Tramite) =>
        row.cliente?.telefono ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>{row.cliente.telefono}</span>
            <Tooltip title="Abrir WhatsApp">
              <IconButton
                size="small"
                onClick={() => handleWhatsApp(row)}
                sx={{
                  color: "#25D366", // Color de WhatsApp
                  "&:hover": { backgroundColor: "rgba(37, 211, 102, 0.1)" },
                }}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          "Sin teléfono"
        ),
    },
    {
      id: "montoSolicitado",
      label: "Monto",
      format: (value: number) => formatMonto(value),
    },
    {
      id: "pasoActual",
      label: "Paso Actual",
      format: (value: any, row: Tramite) =>
        row.pasoActual ? (
          <StatusChip
            status={row.pasoActual.nombre}
            color={getChipColorForTipoPaso(row.pasoActual.tipoPaso)}
          />
        ) : (
          "Sin paso"
        ),
    },
    {
      id: "fechaCreacion",
      label: "Fecha Creación",
      format: (value: Date, row: Tramite) =>
        new Date(row.createdAt).toLocaleDateString("es-AR"),
    },
  ];

  const actions: Action[] = [
    {
      type: "edit",
      label: "Editar",
      onClick: (tramite: Tramite) => handleEditarTramite(tramite),
      icon: <EditIcon />,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: (tramite: Tramite) => handleEliminarTramite(tramite),
      icon: <Delete />,
    },
  ];

  const tipoPasoFilterOptions = [
    { value: TipoPaso.INICIAL, label: "Trámites en Inicio" },
    { value: TipoPaso.INTERMEDIO, label: "Trámites en Proceso" },
    { value: TipoPaso.FINAL_EXITOSO, label: "Trámites Entregados" },
    { value: TipoPaso.FINAL_RECHAZADO, label: "Trámites Rechazados" },
  ];

  const filterOptions = [
    {
      key: "tipoPaso",
      label: "Estado",
      value: filtros.tipoPaso || "",
      options: tipoPasoFilterOptions,
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          tipoPaso: (value as TipoPaso) || undefined,
        })),
    },
    {
      key: "tipoPrestamo",
      label: "Tipo de Préstamo",
      value: filtros.tipoPrestamo || "",
      options: tipoPrestamoOptions.map((f) => ({
        value: f.value,
        label: f.label,
      })),
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          tipoPrestamo: (value as TipoPrestamo) || undefined,
        })),
    },
    {
      key: "provinciaId",
      label: "Provincia",
      value: filtros.provinciaId || "",
      options: provincias.map((f) => ({
        value: f.id,
        label: f.nombre,
      })),
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          provinciaId: (value as number) || undefined,
        })),
    },
    {
      key: "fuerzaId",
      label: "Fuerza",
      value: filtros.fuerzaId || "",
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          fuerzaId: (value as number) || undefined,
        })),
      options: fuerzas.map((f) => ({
        value: f.id,
        label: f.nombre,
      })),
    },
    {
      key: "fechaDesde",
      label: "Fecha Desde",
      type: "dateRange" as FilterType,
      value: filtros.fechaDesde || null,
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          fechaDesde: value as Date | null,
        })),
    },
    {
      key: "fechaHasta",
      label: "Fecha Hasta",
      type: "dateRange" as FilterType,
      value: filtros.fechaHasta || null,
      onChange: (value: string | number | Date | null) =>
        setFiltros((prev) => ({
          ...prev,
          fechaHasta: value as Date | null,
        })),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Gestión de Trámites"
        subtitle="Administracion de los trámites del sistema"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevoTramite}
          >
            Nuevo Trámite
          </Button>
        }
      />

      {error && <ErrorAlert error={error} onRetry={cargarDatos} />}

      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value as string)}
        searchPlaceholder="Buscar por cliente..."
        filters={filterOptions}
        onClearFilters={() => {
          setFiltros({ page: 1, limit: 10 });
          setSearchValue("");
        }}
        rightContent={
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleImprimir}
            size="small"
          >
            Imprimir
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={tramites}
        actions={actions}
        loading={tramiteState.loading}
        emptyMessage="No se encontraron trámites"
        serverSidePagination={true}
        paginationMeta={paginationMeta}
        onPageChange={handlePageChange}
        getRowSx={getRowSx}
      />

      {/* Dialogs */}
      <TramiteFormDialog
        open={nuevoTramiteOpen}
        onClose={() => setNuevoTramiteOpen(false)}
        onTramiteCreated={() => {
          setNuevoTramiteOpen(false);
          cargarDatos(); // Recargar la lista para mostrar el nuevo trámite
        }}
      />

      <TramiteManager
        open={detalleTramiteOpen}
        tramiteId={tramiteSeleccionado?.id || null}
        onClose={() => {
          setDetalleTramiteOpen(false);
          setTramiteSeleccionado(null);
        }}
        onTramiteUpdated={async (tramiteActualizado) => {
          // Actualizar el trámite en el estado del hook
          const tramiteActualizadoResponse = await tramiteActions.updateTramite(
            tramiteActualizado.id!,
            {
              observaciones: tramiteActualizado.observaciones,
              montoSolicitado: tramiteActualizado.montoSolicitado,
              fechaUltimoContacto: tramiteActualizado.fechaUltimoContacto,
            },
          );
          if (tramiteActualizadoResponse) {
            showSuccess("Trámite actualizado correctamente");
          } else {
            handleError("Error al actualizar el trámite");
          }
        }}
        onTramiteDeleted={async (tramiteId) => {
          // Eliminar el trámite de la lista
          const success = await tramiteActions.deleteTramite(tramiteId);
          if (success) {
            setDetalleTramiteOpen(false);
            setTramiteSeleccionado(null);
            cargarDatos();
            showSuccess("Trámite cancelado exitosamente");
          } else {
            handleError("Error al cancelar el trámite");
          }
        }}
      />

      <TramiteFormDialog
        open={editarTramiteOpen}
        tramite={tramiteSeleccionado}
        onClose={() => {
          setEditarTramiteOpen(false);
          setTramiteSeleccionado(null);
        }}
        onTramiteUpdated={(tramiteActualizado) => {
          setEditarTramiteOpen(false);
          setTramiteSeleccionado(null);

          // Actualizar el trámite en el estado del hook
          tramiteActions.updateTramite(tramiteActualizado.id, {
            observaciones: tramiteActualizado.observaciones,
            montoSolicitado: tramiteActualizado.montoSolicitado,
          });
        }}
      />
    </Box>
  );
}
