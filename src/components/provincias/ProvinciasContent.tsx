"use client";

import {
  Action,
  Column,
  ConfirmDialog,
  DataTable,
  ErrorAlert,
  LoadingSpinner,
  PageHeader,
  SearchAndFilters,
} from "@/components/shared";
import { provinciasService } from "@/services/index";
import { Provincia } from "@/types/index";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ProvinciaDialog from "./ProvinciaDialog";

export default function LocalidadesContent() {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [provinciasFiltradas, setProvinciasFiltradas] = useState<Provincia[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string | number>("");

  // Estados para diálogos
  const [provinciaDialogOpen, setProvinciaDialogOpen] = useState(false);
  const [provinciaSeleccionada, setProvinciaSeleccionada] =
    useState<Provincia | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [provinciaAEliminar, setProvinciaAEliminar] =
    useState<Provincia | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Filtrar provincias por búsqueda
    if (searchValue.toString().trim()) {
      const filtered = provincias.filter((provincia) =>
        provincia.nombre
          .toLowerCase()
          .includes(searchValue.toString().toLowerCase()),
      );
      setProvinciasFiltradas(filtered);
    } else {
      setProvinciasFiltradas(provincias);
    }
  }, [provincias, searchValue]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await provinciasService.getAll();
      setProvincias(data);
      setProvinciasFiltradas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar provincias",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaProvincia = () => {
    setProvinciaSeleccionada(null);
    setModoEdicion(false);
    setProvinciaDialogOpen(true);
  };

  const handleEditarProvincia = (provincia: Provincia) => {
    setProvinciaSeleccionada(provincia);
    setModoEdicion(true);
    setProvinciaDialogOpen(true);
  };

  const handleEliminarProvincia = (provincia: Provincia) => {
    setProvinciaAEliminar(provincia);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!provinciaAEliminar) return;

    try {
      await provinciasService.delete(provinciaAEliminar.id);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setProvinciaAEliminar(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar provincia",
      );
    }
  };

  const handleProvinciaGuardada = () => {
    setProvinciaDialogOpen(false);
    cargarDatos();
  };

  // Configuración de columnas para la tabla
  const columns: Column[] = [
    {
      id: "nombre",
      label: "Nombre",
      minWidth: 200,
    },
  ];

  // Configuración de acciones para la tabla
  const actions: Action[] = [
    {
      type: "edit",
      label: "Editar",
      onClick: handleEditarProvincia,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: handleEliminarProvincia,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Gestión de Provincias"
        subtitle="Administra las provincias del sistema"
        showAddButton
        addButtonText="Nueva Provincia"
        onAdd={handleNuevaProvincia}
      />

      {error && (
        <ErrorAlert
          error={error}
          onRetry={cargarDatos}
          title="Error al cargar provincias"
        />
      )}

      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Buscar por nombre de provincia..."
      />

      <DataTable
        columns={columns}
        data={provinciasFiltradas}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron provincias"
        onRowClick={handleEditarProvincia}
      />

      {/* Diálogo para crear/editar provincia */}
      <ProvinciaDialog
        open={provinciaDialogOpen}
        provincia={provinciaSeleccionada}
        modoEdicion={modoEdicion}
        onClose={() => setProvinciaDialogOpen(false)}
        onGuardado={handleProvinciaGuardada}
      />

      {/* Diálogo de confirmación para eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Provincia"
        message={`¿Estás seguro de que deseas eliminar la provincia "${provinciaAEliminar?.nombre}"? Esta acción no se puede deshacer y puede afectar otros registros relacionados.`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProvinciaAEliminar(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
}
