"use client";

import {
  Action,
  Column,
  ConfirmDialog,
  DataTable,
  ErrorAlert,
  LoadingSpinner,
  PageHeader,
  usePermission,
} from "@/components/shared";
import { fuerzasService } from "@/services/index";
import { Fuerza, Role } from "@/types/index";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import FuerzaDialog from "./FuerzaDialog";

export default function FuerzasContent() {
  const { hasAnyRole } = usePermission();
  const [fuerzas, setFuerzas] = useState<Fuerza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para diálogos
  const [fuerzaDialogOpen, setFuerzaDialogOpen] = useState(false);
  const [fuerzaSeleccionada, setFuerzaSeleccionada] = useState<Fuerza | null>(
    null,
  );
  const [modoEdicion, setModoEdicion] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fuerzaAEliminar, setFuerzaAEliminar] = useState<Fuerza | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError(null);
      const data = await fuerzasService.getAll();
      setFuerzas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fuerzas");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaFuerza = () => {
    setFuerzaSeleccionada(null);
    setModoEdicion(false);
    setFuerzaDialogOpen(true);
  };

  const handleEditarFuerza = (fuerza: Fuerza) => {
    setFuerzaSeleccionada(fuerza);
    setModoEdicion(true);
    setFuerzaDialogOpen(true);
  };

  const handleEliminarFuerza = (fuerza: Fuerza) => {
    setFuerzaAEliminar(fuerza);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!fuerzaAEliminar) return;

    try {
      await fuerzasService.delete(fuerzaAEliminar.id);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setFuerzaAEliminar(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar fuerza");
    }
  };

  const handleFuerzaGuardada = () => {
    setFuerzaDialogOpen(false);
    cargarDatos();
  };

  // Configuración de columnas para la tabla
  const columns: Column[] = [
    {
      id: "nombre",
      label: "Nombre",
      minWidth: 200,
    },
    {
      id: "descripcion",
      label: "Descripción",
      minWidth: 300,
      format: (value: string | undefined) => value || "Sin descripción",
    },
  ];

  // Configuración de acciones para la tabla
  const actions: Action[] = [
    {
      type: "edit",
      label: "Editar",
      onClick: handleEditarFuerza,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: handleEliminarFuerza,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Gestión de Fuerzas"
        subtitle="Administracion de las fuerzas del sistema"
        showAddButton={hasAnyRole([Role.ADMIN, Role.MANAGER])}
        onAdd={handleNuevaFuerza}
      />

      {error && (
        <ErrorAlert
          error={error}
          onRetry={cargarDatos}
          title="Error al cargar fuerzas"
        />
      )}

      <DataTable
        columns={columns}
        data={fuerzas}
        actions={hasAnyRole([Role.ADMIN, Role.MANAGER]) ? actions : []}
        loading={loading}
        emptyMessage="No hay fuerzas registradas"
        onRowClick={handleEditarFuerza}
      />

      {/* Diálogo para crear/editar fuerza */}
      <FuerzaDialog
        open={fuerzaDialogOpen}
        fuerza={fuerzaSeleccionada}
        modoEdicion={modoEdicion}
        onClose={() => setFuerzaDialogOpen(false)}
        onGuardado={handleFuerzaGuardada}
      />

      {/* Diálogo de confirmación para eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Fuerza"
        message={`¿Estás seguro de que deseas eliminar la fuerza "${fuerzaAEliminar?.nombre}"? Esta acción no se puede deshacer y puede afectar otros registros relacionados.`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setFuerzaAEliminar(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
}
