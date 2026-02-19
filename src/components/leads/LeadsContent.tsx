"use client";

import { PermissionError, usePermission } from "@/components/shared/Permisson";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  ApiError,
  fuerzasService,
  isPermissionError,
  provinciasService,
  representantesService,
} from "@/services/index";
import { leadsService } from "@/services/leadsService";
import { Role } from "@/types/auth.types";
import {
  Cliente,
  FiltroClientes,
  Fuerza,
  PaginationMeta,
  Provincia,
  Representante,
} from "@/types/index";
import { EstadoLead, Lead } from "@/types/lead.type";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Action, Column } from "../shared";
import ConfirmDialog from "../shared/ConfirmDialog";
import DataTable from "../shared/DataTable";
import ErrorAlert from "../shared/ErrorAlert";
import PageHeader from "../shared/PageHeader";
import SearchAndFilters from "../shared/SearchAndFilters";
import LeadDialog from "./LeadsDialog";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

export default function LeadsContent() {
  const { showSuccess, handleError } = useErrorHandler();
  const { hasAnyRole } = usePermission();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [representanteAsignacionId, setRepresentanteAsignacionId] = useState<
    number | ""
  >("");
  const [asignando, setAsignando] = useState(false);

  // Estados para filtros y paginación
  const [filtros, setFiltros] = useState<FiltroClientes>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState<string | number>("");
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Estados para diálogos
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null);

  // Estado para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadAEliminar, setLeadAEliminar] = useState<Lead | null>(null);
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar filtro de búsqueda
      const filtrosConBusqueda = searchValue
        ? { ...filtros, search: searchValue.toString() }
        : filtros;

      const [leadsResponse, fuerzasData, provinciasData, representantesData] =
        await Promise.all([
          leadsService.getPaginated(filtrosConBusqueda),
          fuerzasService.getAll(),
          provinciasService.getAll(),
          representantesService.getAll(),
        ]);
      setLeads(leadsResponse.data);
      setFuerzas(fuerzasData);
      setProvincias(provinciasData);
      setRepresentantes(representantesData);
      setPaginationMeta(leadsResponse.meta);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Error al cargar leads"),
      );
    } finally {
      setLoading(false);
    }
  }, [filtros, searchValue]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const confirmarEliminacion = async () => {
    if (!leadAEliminar) return;

    try {
      await leadsService.delete(leadAEliminar.id!);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setLeadAEliminar(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Error al eliminar lead"),
      );
    }
  };

  const handleLeadGuardado = () => {
    showSuccess("Cliente creado correctamente");
    setLeadDialogOpen(false);
    cargarDatos();
  };

  const handleClearFilters = () => {
    setFiltros({ page: 1, limit: 10 });
    setSearchValue("");
  };

  const handlePageChange = (page: number, rowsPerPage: number) => {
    setFiltros((prev) => ({ ...prev, page, limit: rowsPerPage }));
  };

  const hasTelefono = (lead: Lead) => Boolean(lead.telefono?.trim());

  const selectableLeadIds = leads
    .filter((lead) => lead.estado === EstadoLead.PENDIENTE && lead.id)
    .map((lead) => lead.id as number);
  const isAllSelected =
    selectableLeadIds.length > 0 &&
    selectableLeadIds.every((id) => selectedLeadIds.includes(id));
  const isIndeterminate =
    selectableLeadIds.length > 0 &&
    selectedLeadIds.some((id) => selectableLeadIds.includes(id)) &&
    !isAllSelected;

  useEffect(() => {
    setSelectedLeadIds((prev) => {
      const allowed = new Set(selectableLeadIds);
      const next = prev.filter((id) => allowed.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [leads, selectableLeadIds]);

  const handleActualizarEstadoLead = async (
    lead: Lead,
    nuevoEstado: Lead["estado"],
  ) => {
    if (!lead.id || !nuevoEstado) return;
    const estadoAnterior = lead.estado;

    try {
      if (nuevoEstado === EstadoLead.CALIFICADO) {
        setLeadSeleccionado(lead);
        setLeadDialogOpen(true);
        return;
      }
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, estado: nuevoEstado } : item,
        ),
      );
      await leadsService.updateLead(lead.id, { estado: nuevoEstado });
      showSuccess("Estado actualizado correctamente");
    } catch (err) {
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, estado: estadoAnterior } : item,
        ),
      );
      handleError(err);
    }
  };

  const getEstadoChipProps = (estado?: Lead["estado"]) => {
    switch (estado) {
      case EstadoLead.PENDIENTE:
        return { label: "Pendiente", color: "warning" as ChipColor };
      case EstadoLead.CONTACTADO:
        return { label: "Contactado", color: "info" as ChipColor };
      case EstadoLead.NO_CONTACTADO:
        return { label: "No contactado", color: "error" as ChipColor };
      case EstadoLead.CALIFICADO:
        return { label: "Calificado", color: "success" as ChipColor };
      case EstadoLead.NO_CALIFICADO:
        return { label: "No calificado", color: "secondary" as ChipColor };
      default:
        return { label: "-", color: "default" as ChipColor };
    }
  };

  // Configuración de columnas para la tabla
  const columns: Column[] = [
    {
      id: "whatsapp",
      label: "",
      align: "center",
      format: (value: unknown, row: Lead) => (
        <IconButton
          size="small"
          color="success"
          onClick={(event) => {
            event.stopPropagation();
            handleContactarLead(row);
          }}
          disabled={!hasTelefono(row)}
          title="Contactar por WhatsApp"
        >
          <WhatsAppIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      id: "fullName",
      label: "Nombre",
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "telefono",
      label: "Teléfono",
    },
    {
      id: "fuerza",
      label: "Fuerza",
      format: (value, row: Lead) => row.fuerza?.nombre || "-",
    },
    {
      id: "provincia",
      label: "Provincia",
      format: (value, row: Cliente) => row.provincia?.nombre || "-",
    },
    {
      id: "representante",
      label: "Representante",
      format: (value, row: Lead) => row.representante?.fullName || "-",
    },
    {
      id: "estado",
      label: "Estado",
      format: (value: Lead["estado"], row: Lead) => {
        const selectedValue = value ?? "";
        return (
          <Select
            size="small"
            value={selectedValue}
            displayEmpty
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => {
              event.stopPropagation();
              handleActualizarEstadoLead(
                row,
                event.target.value as Lead["estado"],
              );
            }}
            renderValue={(selected) => {
              const { label, color } = getEstadoChipProps(
                selected as Lead["estado"],
              );
              return <Chip label={label} color={color} size="small" />;
            }}
          >
            {Object.values(EstadoLead).map((estado) => {
              const { label, color } = getEstadoChipProps(estado);
              return (
                <MenuItem key={estado} value={estado}>
                  <Chip label={label} color={color} size="small" />
                </MenuItem>
              );
            })}
          </Select>
        );
      },
    },
  ];

  const handleCrearCliente = (lead: Lead) => {
    setLeadSeleccionado(lead);
    setLeadDialogOpen(true);
  };

  const handleContactarLead = (lead: Lead) => {
    //Abrime whatsapp con el numero de telefono del lead
    const telefono = lead.telefono?.replace(/[^\d+]/g, "");
    if (telefono) {
      window.open(`https://wa.me/${telefono}`, "_blank");
    }
  };

  const handleToggleLeadSelection = (lead: Lead) => {
    if (!lead.id || lead.estado !== EstadoLead.PENDIENTE) return;
    setSelectedLeadIds((prev) =>
      prev.includes(lead.id!)
        ? prev.filter((id) => id !== lead.id)
        : [...prev, lead.id!],
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedLeadIds(() => (isAllSelected ? [] : selectableLeadIds));
  };

  const handleOpenAsignacion = () => {
    setAssignDialogOpen(true);
  };

  const handleCloseAsignacion = () => {
    setAssignDialogOpen(false);
    setRepresentanteAsignacionId("");
  };

  const handleConfirmAsignacion = async () => {
    if (!representanteAsignacionId || selectedLeadIds.length === 0) return;
    try {
      setAsignando(true);
      await leadsService.assignToRepresentante({
        leadIds: selectedLeadIds,
        representanteId: representanteAsignacionId as number,
      });
      showSuccess("Leads asignados correctamente");
      setSelectedLeadIds([]);
      handleCloseAsignacion();
      cargarDatos();
    } catch (err) {
      handleError(err);
    } finally {
      setAsignando(false);
    }
  };
  const handleEliminarLead = (lead: Lead) => {
    setLeadSeleccionado(lead);
    setDeleteDialogOpen(true);
  };

  // Configuración de acciones para la tabla
  const actions: Action[] = [
    {
      type: "add",
      label: "Crear Cliente",
      onClick: handleCrearCliente,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: handleEliminarLead,
    },
  ];

  // Configuración de filtros
  const filterOptions = [
    {
      key: "provinciaId",
      label: "Provincia",
      value: filtros.provinciaId || "",
      options: provincias.map((l) => ({
        value: l.id,
        label: l.nombre,
      })),
      onChange: (value: string | number | null | Date) =>
        setFiltros((prev) => ({
          ...prev,
          provinciaId: (value as number) || undefined,
        })),
    },
    {
      key: "fuerzaId",
      label: "Fuerza",
      value: filtros.fuerzaId || "",
      options: fuerzas.map((f) => ({
        value: f.id,
        label: f.nombre,
      })),
      onChange: (value: string | number | null | Date) =>
        setFiltros((prev) => ({
          ...prev,
          fuerzaId: (value as number) || undefined,
        })),
    },
    {
      key: "estado",
      label: "Estado",
      value: filtros.estado || "",
      options: Object.values(EstadoLead).map((estado) => ({
        value: estado,
        label: getEstadoChipProps(estado).label,
      })),
      onChange: (value: string | number | null | Date) =>
        setFiltros((prev) => ({
          ...prev,
          estado: (value as EstadoLead) || undefined,
        })),
    },
  ];

  if (isPermissionError(error)) {
    return (
      <PermissionError
        title="Acceso Denegado"
        message="No tienes permisos para acceder a esta sección."
      />
    );
  }

  const canCreateLead = hasAnyRole([Role.ADMIN, Role.MANAGER]);
  const canAssignLeads = canCreateLead;
  return (
    <Box>
      <PageHeader
        title="Gestión de Leads"
        subtitle="Administra la información de los Leads del sistema"
        showAddButton={canCreateLead}
      />

      {error && (
        <ErrorAlert
          error={error.message}
          onRetry={cargarDatos}
          title="Error al cargar clientes"
        />
      )}

      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por nombre, fuerza, provincia o teléfono..."
        filters={filterOptions}
        onClearFilters={handleClearFilters}
      />

      {canAssignLeads && selectedLeadIds.length > 0 && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleOpenAsignacion}>
            Asignar a representante
          </Button>
        </Box>
      )}

      <DataTable
        columns={columns}
        data={leads}
        actions={actions}
        loading={loading}
        selection={
          canAssignLeads
            ? {
                enabled: true,
                showSelectAll: true,
                isRowSelectable: (row: Lead) =>
                  row.estado === EstadoLead.PENDIENTE,
                isRowSelected: (row: Lead) =>
                  row.id ? selectedLeadIds.includes(row.id) : false,
                onToggleRow: handleToggleLeadSelection,
                onToggleAll: handleToggleSelectAll,
                isAllSelected,
                isIndeterminate,
              }
            : undefined
        }
        emptyMessage="No se encontraron Leads"
        onRowClick={handleCrearCliente}
        serverSidePagination={true}
        paginationMeta={paginationMeta}
        onPageChange={handlePageChange}
      />

      {/* Diálogo para crear/editar cliente */}
      <LeadDialog
        open={leadDialogOpen}
        lead={leadSeleccionado}
        onClose={() => setLeadDialogOpen(false)}
        onGuardado={handleLeadGuardado}
        provincias={provincias}
        fuerzas={fuerzas}
        representantes={representantes}
      />

      {/* Diálogo de confirmación para eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al lead "${leadAEliminar?.fullName}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setLeadAEliminar(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />

      {canAssignLeads && (
        <Dialog
          open={assignDialogOpen}
          onClose={handleCloseAsignacion}
          fullWidth
        >
          <DialogTitle>Asignar a representante</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="representante-asignacion-label">
                Representante
              </InputLabel>
              <Select
                labelId="representante-asignacion-label"
                label="Representante"
                value={representanteAsignacionId}
                onChange={(event) =>
                  setRepresentanteAsignacionId(event.target.value as number)
                }
              >
                {representantes.map((representante) => (
                  <MenuItem key={representante.id} value={representante.id}>
                    {representante.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAsignacion}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleConfirmAsignacion}
              disabled={!representanteAsignacionId || asignando}
            >
              Confirmar asignación
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
