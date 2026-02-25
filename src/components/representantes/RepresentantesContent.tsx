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
import { representantesService } from "@/services/index";
import { Representante, Role } from "@/types/index";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import RepresentanteDialog from "./RepresentanteDialog";

export default function RepresentantesContent() {
  const { hasAnyRole } = usePermission();
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [representanteDialogOpen, setRepresentanteDialogOpen] = useState(false);
  const [representanteSeleccionado, setRepresentanteSeleccionado] =
    useState<Representante | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [representanteAEliminar, setRepresentanteAEliminar] =
    useState<Representante | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError(null);
      const data = await representantesService.getAll();
      setRepresentantes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar representantes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoRepresentante = () => {
    setRepresentanteSeleccionado(null);
    setModoEdicion(false);
    setRepresentanteDialogOpen(true);
  };

  const handleEditarRepresentante = (representante: Representante) => {
    setRepresentanteSeleccionado(representante);
    setModoEdicion(true);
    setRepresentanteDialogOpen(true);
  };

  const handleEliminarRepresentante = (representante: Representante) => {
    setRepresentanteAEliminar(representante);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!representanteAEliminar) return;

    try {
      await representantesService.delete(representanteAEliminar.id);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setRepresentanteAEliminar(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar representante"
      );
    }
  };

  const handleRepresentanteGuardado = () => {
    setRepresentanteDialogOpen(false);
    cargarDatos();
  };

  const columns: Column[] = [
    {
      id: "fullName",
      label: "Nombre",
      minWidth: 200,
    },
    {
      id: "email",
      label: "Email",
      minWidth: 220,
    },
    {
      id: "telefono",
      label: "Teléfono",
      minWidth: 140,
      format: (value: string | undefined) => value || "-",
    },
    {
      id: "username",
      label: "Usuario",
      minWidth: 140,
      format: (_value, row: Representante) =>
        row.user?.username || "-",
    },
  ];

  const actions: Action[] = [
    {
      type: "edit",
      label: "Editar",
      onClick: handleEditarRepresentante,
    },
    {
      type: "delete",
      label: "Eliminar",
      onClick: handleEliminarRepresentante,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Gestión de Representantes"
        subtitle="Administración de representantes del sistema"
        showAddButton={hasAnyRole([Role.ADMIN, Role.MANAGER])}
        onAdd={handleNuevoRepresentante}
      />

      {error && (
        <ErrorAlert
          error={error}
          onRetry={cargarDatos}
          title="Error al cargar representantes"
        />
      )}

      <DataTable
        columns={columns}
        data={representantes}
        actions={hasAnyRole([Role.ADMIN, Role.MANAGER]) ? actions : []}
        loading={loading}
        emptyMessage="No hay representantes registrados"
        onRowClick={handleEditarRepresentante}
      />

      <RepresentanteDialog
        open={representanteDialogOpen}
        representante={representanteSeleccionado}
        modoEdicion={modoEdicion}
        onClose={() => setRepresentanteDialogOpen(false)}
        onGuardado={handleRepresentanteGuardado}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Representante"
        message={`¿Estás seguro de que deseas eliminar a "${representanteAEliminar?.fullName}"? Esta acción no se puede deshacer y puede afectar clientes y leads asignados.`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRepresentanteAEliminar(null);
        }}
        severity="error"
        confirmText="Eliminar"
      />
    </Box>
  );
}
