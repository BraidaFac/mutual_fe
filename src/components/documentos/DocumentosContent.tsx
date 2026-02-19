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
import { documentosService } from "@/services/index";
import { Documento } from "@/types/index";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import DocumentoDialog from "./DocumentoDialog";

export default function DocumentosContent() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState<Documento[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [documentoDialogOpen, setDocumentoDialogOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<Documento | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] =
    useState<Documento | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchValue.trim()) {
      const filtered = documentos.filter(
        (doc) =>
          doc.nombre?.toLowerCase().includes(searchValue.toLowerCase()) ||
          (doc.descripcion &&
            doc.descripcion.toLowerCase().includes(searchValue.toLowerCase())),
      );
      setDocumentosFiltrados(filtered);
    } else {
      setDocumentosFiltrados(documentos);
    }
  }, [documentos, searchValue]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentosService.getAll();
      setDocumentos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar documentos",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoDocumento = () => {
    setDocumentoSeleccionado(null);
    setModoEdicion(false);
    setDocumentoDialogOpen(true);
  };

  const handleEditarDocumento = (documento: Documento) => {
    setDocumentoSeleccionado(documento);
    setModoEdicion(true);
    setDocumentoDialogOpen(true);
  };

  const handleEliminarDocumento = (documento: Documento) => {
    setDocumentoAEliminar(documento);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!documentoAEliminar) return;
    try {
      await documentosService.delete(documentoAEliminar.id!);
      await cargarDatos();
      setDeleteDialogOpen(false);
      setDocumentoAEliminar(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar documento",
      );
    }
  };

  const columns: Column[] = [
    { id: "nombre", label: "Nombre", minWidth: 200 },
    {
      id: "descripcion",
      label: "Descripción",
      minWidth: 300,
      format: (value: string | undefined) => value || "Sin descripción",
    },
  ];

  const actions: Action[] = [
    { type: "edit", label: "Editar", onClick: handleEditarDocumento },
    { type: "delete", label: "Eliminar", onClick: handleEliminarDocumento },
  ];

  if (loading && documentos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Gestión de Documentos"
        subtitle="Administra los tipos de documentos del sistema"
        showAddButton
        addButtonText="Nuevo Documento"
        onAdd={handleNuevoDocumento}
      />

      {error && <ErrorAlert error={error} onRetry={cargarDatos} />}

      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={(value) => setSearchValue(value as string)}
        searchPlaceholder="Buscar documentos..."
      />

      <DataTable
        columns={columns}
        data={documentosFiltrados}
        actions={actions}
        loading={loading}
        emptyMessage="No hay documentos registrados"
        onRowClick={handleEditarDocumento}
      />

      <DocumentoDialog
        open={documentoDialogOpen}
        documento={documentoSeleccionado}
        modoEdicion={modoEdicion}
        onClose={() => setDocumentoDialogOpen(false)}
        onGuardado={() => {
          setDocumentoDialogOpen(false);
          cargarDatos();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Documento"
        message={`¿Eliminar el documento "${documentoAEliminar?.nombre}"?`}
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDocumentoAEliminar(null);
        }}
        severity="error"
      />
    </Box>
  );
}
