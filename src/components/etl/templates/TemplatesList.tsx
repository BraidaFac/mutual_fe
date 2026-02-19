/**
 * Lista de templates de importación
 * Muestra los templates en tabla con acciones
 */

"use client";

import DataTable, { Column } from "@/components/shared/DataTable";
import { ImportTemplate, Provincia } from "@/types/index";
import {
  ContentCopy,
  Delete,
  Edit,
  MoreVert,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface TemplatesListProps {
  templates: ImportTemplate[];
  loading: boolean;
  onView: (template: ImportTemplate) => void;
  onEdit: (template: ImportTemplate) => void;
  onDelete: (template: ImportTemplate) => void;
  onDuplicate: (template: ImportTemplate) => void;
  paginationMeta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number, rowsPerPage: number) => void;
}

export default function TemplatesList({
  templates,
  loading,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  paginationMeta,
  onPageChange,
}: TemplatesListProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ImportTemplate | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    template: ImportTemplate,
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTemplate(null);
  };

  const handleAction = (action: "view" | "edit" | "delete" | "duplicate") => {
    if (!selectedTemplate) return;

    switch (action) {
      case "view":
        onView(selectedTemplate);
        break;
      case "edit":
        onEdit(selectedTemplate);
        break;
      case "delete":
        onDelete(selectedTemplate);
        break;
      case "duplicate":
        onDuplicate(selectedTemplate);
        break;
    }
    handleMenuClose();
  };

  const columns: Column[] = [
    {
      id: "nombre",
      label: "Nombre",
      minWidth: 200,
    },
    {
      id: "entityType",
      label: "Tipo",
      minWidth: 100,
      format: (value: string) => {
        return (
          <Chip
            label={value.toUpperCase()}
            size="small"
            color={"primary"}
            variant="outlined"
          />
        );
      },
    },
    {
      id: "fileType",
      label: "Formato",
      minWidth: 80,
      format: (value: string) => (
        <Chip
          label={value.toUpperCase()}
          size="small"
          variant="filled"
          color={value === "csv" ? "success" : "warning"}
        />
      ),
    },
    {
      id: "provincia",
      label: "Provincia",
      minWidth: 120,
      format: (value: Provincia | undefined) => value?.nombre || "-",
    },
    {
      id: "columnMappings",
      label: "Mapeos",
      minWidth: 80,
      align: "center",
      format: (value: unknown[]) => (
        <Tooltip title={`${value?.length || 0} columnas mapeadas`}>
          <Chip
            label={value?.length || 0}
            size="small"
            color={value?.length > 0 ? "success" : "default"}
          />
        </Tooltip>
      ),
    },
    {
      id: "createdAt",
      label: "Creado",
      minWidth: 120,
      format: (value: string | Date) => {
        if (!value) return "-";
        const date = typeof value === "string" ? new Date(value) : value;
        return format(date, "dd/MM/yyyy", { locale: es });
      },
    },
    {
      id: "actions",
      label: "",
      minWidth: 50,
      align: "right",
      format: (_: unknown, row: ImportTemplate) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        emptyMessage="No hay templates de importación configurados"
        onRowClick={onView}
        serverSidePagination={!!paginationMeta}
        paginationMeta={paginationMeta}
        onPageChange={onPageChange}
      />

      {/* Menú contextual */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleAction("view")}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("edit")}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("duplicate")}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleAction("delete")}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
