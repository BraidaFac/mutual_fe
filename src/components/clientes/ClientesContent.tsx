"use client";

import { PermissionError, usePermission } from "@/components/shared/Permisson";
import {
  ApiError,
  clientesService,
  fuerzasService,
  isPermissionError,
  provinciasService,
  representantesService,
} from "@/services/index";
import { Role } from "@/types/auth.types";
import {
  Cliente,
  FiltroClientes,
  Fuerza,
  PaginationMeta,
  Provincia,
  Representante,
} from "@/types/index";
import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Action, Column } from "../shared";
import ConfirmDialog from "../shared/ConfirmDialog";
import DataTable from "../shared/DataTable";
import ErrorAlert from "../shared/ErrorAlert";
import PageHeader from "../shared/PageHeader";
import SearchAndFilters from "../shared/SearchAndFilters";
import ClienteDetalleDialog from "./ClienteDetalleDialog";
import ClienteDialog from "./ClienteDialog";

export default function ClientesContent() {
  const { hasAnyRole } = usePermission();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

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
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [clienteDetalleOpen, setClienteDetalleOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(
    null,
  );
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar filtro de búsqueda
      const filtrosConBusqueda = searchValue
        ? { ...filtros, search: searchValue.toString() }
        : filtros;

      const [
        clientesResponse,
        fuerzasData,
        provinciasData,
        representantesData,
      ] = await Promise.all([
        clientesService.getPaginated(filtrosConBusqueda),
        fuerzasService.getAll(),
        provinciasService.getAll(),
        representantesService.getAll(),
      ]);
      setClientes(clientesResponse.data);
      setPaginationMeta(clientesResponse.meta);
      setFuerzas(fuerzasData);
      setProvincias(provinciasData);
      setRepresentantes(representantesData);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Error al cargar clientes"),
      );
    } finally {
      setLoading(false);
    }
  }, [filtros, searchValue]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleNuevoCliente = () => {
    setClienteSeleccionado(null);
    setModoEdicion(false);
    setClienteDialogOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModoEdicion(true);
    setClienteDialogOpen(true);
  };

  const handleVerDetalle = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteDetalleOpen(true);
  };

  const handleEliminarCliente = (cliente: Cliente) => {
    setClienteAEliminar(cliente);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!clienteAEliminar) return;

    try {
      await clientesService.delete(clienteAEliminar.id);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setClienteAEliminar(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(500, "Error al eliminar cliente"),
      );
    }
  };

  const handleClienteGuardado = () => {
    setClienteDialogOpen(false);
    cargarDatos();
  };

  const handleClearFilters = () => {
    setFiltros({ page: 1, limit: 10 });
    setSearchValue("");
  };

  const handlePageChange = (page: number, rowsPerPage: number) => {
    setFiltros((prev) => ({ ...prev, page, limit: rowsPerPage }));
  };

  // Configuración de columnas para la tabla
  const columns: Column[] = [
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
      id: "provincia",
      label: "Provincia",
      format: (value, row: Cliente) => row.provincia?.nombre || "-",
    },
    {
      id: "createdAt",
      label: "Fecha Creación",
      format: (value: Date) => new Date(value).toLocaleDateString("es-AR"),
    },
    {
      id: "fechaUltimoContacto",
      label: "Último Contacto",
      format: (value: Date | null) =>
        value ? new Date(value).toLocaleDateString("es-AR") : "Sin contacto",
    },
  ];

  // Configuración de acciones para la tabla
  const actions: Action[] = [
    {
      type: "view",
      label: "Ver detalles",
      onClick: handleVerDetalle,
    },
    {
      type: "edit",
      label: "Editar",
      onClick: handleEditarCliente,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: handleEliminarCliente,
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
  ];

  if (isPermissionError(error)) {
    return (
      <PermissionError
        title="Acceso Denegado"
        message="No tienes permisos para acceder a esta sección."
      />
    );
  }

  const canCreateCliente = hasAnyRole([Role.ADMIN, Role.MANAGER]);
  return (
    <Box>
      <PageHeader
        title="Gestión de Clientes"
        subtitle="Administra la información de los clientes del sistema"
        showAddButton={canCreateCliente}
        addButtonText="Nuevo Cliente"
        onAdd={handleNuevoCliente}
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

      <DataTable
        columns={columns}
        data={clientes}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron clientes"
        onRowClick={handleVerDetalle}
        serverSidePagination={true}
        paginationMeta={paginationMeta}
        onPageChange={handlePageChange}
      />

      {/* Diálogo para crear/editar cliente */}
      <ClienteDialog
        open={clienteDialogOpen}
        cliente={clienteSeleccionado}
        modoEdicion={modoEdicion}
        onClose={() => setClienteDialogOpen(false)}
        onGuardado={handleClienteGuardado}
        provincias={provincias}
        fuerzas={fuerzas}
        representantes={representantes}
      />

      {/* Diálogo para ver detalles del cliente */}
      <ClienteDetalleDialog
        open={clienteDetalleOpen}
        cliente={clienteSeleccionado}
        onClose={() => setClienteDetalleOpen(false)}
        onEditar={() => {
          setClienteDetalleOpen(false);
          handleEditarCliente(clienteSeleccionado!);
        }}
      />

      {/* Diálogo de confirmación para eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${clienteAEliminar?.fullName}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setClienteAEliminar(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
}
