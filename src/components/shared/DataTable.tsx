/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Delete, Edit, Visibility } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: any, row?: any) => React.ReactNode;
}

export interface Action {
  type: "view" | "edit" | "delete" | "custom" | "add";
  label?: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  disabled?: (row: any) => boolean;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectionConfig {
  enabled?: boolean;
  isRowSelectable?: (row: any) => boolean;
  isRowSelected?: (row: any) => boolean;
  onToggleRow?: (row: any) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  showSelectAll?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  selection?: SelectionConfig;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  // Props para paginación del servidor
  serverSidePagination?: boolean;
  paginationMeta?: PaginationMeta;
  onPageChange?: (page: number, rowsPerPage: number) => void;
}

export default function DataTable({
  columns,
  data,
  actions = [],
  selection,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25],
  emptyMessage = "No hay datos para mostrar",
  onRowClick,
  loading = false,
  serverSidePagination = false,
  paginationMeta,
  onPageChange,
}: DataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  // Usar valores del servidor si está habilitada la paginación del servidor
  const currentPage =
    serverSidePagination && paginationMeta ? paginationMeta.page - 1 : page;
  const currentRowsPerPage =
    serverSidePagination && paginationMeta ? paginationMeta.limit : rowsPerPage;
  const totalCount =
    serverSidePagination && paginationMeta
      ? paginationMeta.total
      : (data?.length ?? 0);

  const handleChangePage = (event: unknown, newPage: number) => {
    if (serverSidePagination && onPageChange) {
      // Para paginación del servidor, llamar al callback con página 1-indexed
      onPageChange(newPage + 1, currentRowsPerPage);
    } else {
      // Para paginación local
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (serverSidePagination && onPageChange) {
      // Para paginación del servidor, resetear a página 1
      onPageChange(1, newRowsPerPage);
    } else {
      // Para paginación local
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    }
  };

  const getActionIcon = (action: Action) => {
    if (action.icon) return action.icon;

    switch (action.type) {
      case "view":
        return <Visibility />;
      case "edit":
        return <Edit />;
      case "delete":
        return <Delete />;
      default:
        return <Edit />;
    }
  };

  const getActionColor = (action: Action) => {
    if (action.color) return action.color;

    switch (action.type) {
      case "delete":
        return "error";
      case "view":
        return "info";
      default:
        return "primary";
    }
  };

  // Para paginación del servidor, los datos ya vienen paginados
  // Para paginación local, aplicar paginación en el cliente
  const paginatedData =
    serverSidePagination || !pagination
      ? data
      : data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasSelection = Boolean(selection?.enabled);
  const extraColumns = (actions.length > 0 ? 1 : 0) + (hasSelection ? 1 : 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: "bold" }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              )}
              {hasSelection && (
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  {selection?.showSelectAll ? (
                    <Checkbox
                      size="small"
                      checked={Boolean(selection?.isAllSelected)}
                      indeterminate={Boolean(selection?.isIndeterminate)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => selection?.onToggleAll?.()}
                      inputProps={{ "aria-label": "Seleccionar todos" }}
                    />
                  ) : null}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + extraColumns}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {actions.length > 0 && (
                    <TableCell align="right">
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        {actions.map((action, actionIndex) => (
                          <IconButton
                            key={actionIndex}
                            size="small"
                            color={getActionColor(action)}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            disabled={
                              action.disabled ? action.disabled(row) : false
                            }
                            title={action.label}
                          >
                            {getActionIcon(action)}
                          </IconButton>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                  {hasSelection && (
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={Boolean(selection?.isRowSelected?.(row))}
                        disabled={
                          selection?.isRowSelectable
                            ? !selection.isRowSelectable(row)
                            : false
                        }
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => selection?.onToggleRow?.(row)}
                        inputProps={{ "aria-label": "Seleccionar fila" }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && totalCount > 0 && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalCount}
          rowsPerPage={currentRowsPerPage}
          page={currentPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
}
