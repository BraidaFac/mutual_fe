/**
 * Contenido principal de la página de Templates de Importación
 * Orquesta la lista, filtros y diálogos
 */

"use client";

import { ConfirmDialog, PageHeader } from "@/components/shared";
import { useImportTemplates } from "@/hooks/etl";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { provinciasService } from "@/services/provinciasService";
import { ImportTemplate, ImportTemplateFormData, Provincia } from "@/types/index";
import {
  Box
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import TemplateDetailDialog from "./TemplateDetailDialog";
import TemplateFormDialog from "./TemplateFormDialog";
import TemplatesList from "./TemplatesList";

export default function TemplatesContent() {
  // Estado de UI
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ImportTemplate | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");

  // Datos auxiliares
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  // Hooks
  const {
    templates,
    loading,
    entities,
    pagination,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useImportTemplates();

  const { handleError,  } = useErrorHandler();

  // Cargar provincias (solo una vez al montar)
  useEffect(() => {
    const loadProvincias = async () => {
      try {
        const data = await provinciasService.getAll();
        setProvincias(data);
      } catch (error) {
        handleError(error);
      }
    };
    
    loadProvincias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Solo se ejecuta una vez


  // Handlers de acciones
  const handleAdd = useCallback(() => {
    setSelectedTemplate(null);
    setModoEdicion(false);
    setFormDialogOpen(true);
  }, []);

  const handleView = useCallback((template: ImportTemplate) => {
    console.log(template);
    setSelectedTemplate(template);
    setDetailDialogOpen(true);
  }, []);

  const handleEdit = useCallback((template: ImportTemplate) => {
    setSelectedTemplate(template);
    setModoEdicion(true);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((template: ImportTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch  {
      // El error ya se maneja en el hook
    }
  }, [selectedTemplate, deleteTemplate]);

  const handleDuplicateClick = useCallback((template: ImportTemplate) => {
    setSelectedTemplate(template);
    setDuplicateName(`${template.nombre} (copia)`);
    setDuplicateDialogOpen(true);
  }, []);

  const handleFormSaved = useCallback(async (data: ImportTemplateFormData) => {

    if (modoEdicion ) {
      await updateTemplate(selectedTemplate?.id??0, data as Partial<ImportTemplateFormData>);
    } else {
      await createTemplate(data);
    }
    setFormDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    },
    [fetchTemplates, modoEdicion, selectedTemplate, updateTemplate, createTemplate]
  );

  const handlePageChange = useCallback(
    (page: number, rowsPerPage: number) => {
      fetchTemplates({
        page,
        limit: rowsPerPage,
      });
    },
    [fetchTemplates]
  );

  return (
    <Box>
      <PageHeader
        title="Templates de Importación"
        subtitle="Configura cómo mapear las columnas de archivos externos a las propiedades del sistema"
        showAddButton
        addButtonText="Nuevo Template"
        onAdd={handleAdd}
      />

      {/* Lista de templates */}
      <TemplatesList
        templates={templates}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        paginationMeta={pagination ?? undefined}
        onPageChange={handlePageChange}
      />

      {/* Diálogo de formulario */}
      <TemplateFormDialog
        open={formDialogOpen}
        template={selectedTemplate}
        modoEdicion={modoEdicion}
        onClose={() => setFormDialogOpen(false)}
        onGuardado={handleFormSaved}
        provincias={provincias}
        entities={entities}
      />

      {/* Diálogo de detalle */}
      <TemplateDetailDialog
        open={detailDialogOpen}
        template={selectedTemplate}
        onClose={() => setDetailDialogOpen(false)}
        onEdit={() => {
          setDetailDialogOpen(false);
          setModoEdicion(true);
          setFormDialogOpen(true);
        }}
      />

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Template"
        message={`¿Estás seguro de que deseas eliminar el template "${selectedTemplate?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Eliminar"
      />

    </Box>
  );
}
