/**
 * Componente de carga de archivos para importación ETL
 * Soporta drag & drop y validación de tipo de archivo
 */

"use client";

import { FileType } from "@/types/index";
import {
  CheckCircle,
  CloudUpload,
  Delete,
  Description,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useCallback, useRef, useState } from "react";

interface FileUploaderProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  acceptedFileType?: FileType;
  disabled?: boolean;
  maxSizeMB?: number;
  error : string|null;
}

export default function FileUploader({
  file,
  onFileSelect,
  onClear,
  acceptedFileType,
  error,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);




  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    handleFileChange(selectedFile);
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFileType ? `${acceptedFileType},csv,xlsx` : 'csv,xlsx'}
        onChange={handleInputChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {!file ? (
        <Paper
          variant="outlined"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            p: 4,
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: isDragging ? "action.hover" : "background.paper",
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: isDragging
              ? "primary.main"
              : error
              ? "error.main"
              : "divider",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.6 : 1,
            "&:hover": !disabled
              ? {
                  backgroundColor: "action.hover",
                  borderColor: "primary.main",
                }
              : {},
          }}
          onClick={!disabled ? handleBrowseClick : undefined}
        >
          <Stack spacing={2} alignItems="center">
            <CloudUpload
              sx={{
                fontSize: 48,
                color: isDragging ? "primary.main" : "text.secondary",
              }}
            />

            <Box>
              <Typography variant="h6" gutterBottom>
                {isDragging
                  ? "Suelta el archivo aquí"
                  : "Arrastra un archivo o haz clic para seleccionar"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formatos aceptados: CSV, Excel (XLSX)
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Seleccionar archivo
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: error ? "error.lighter" : "success.lighter",
            borderColor: error ? "error.main" : "success.main",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Description
              sx={{
                fontSize: 40,
                color: error ? "error.main" : "success.main",
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 500 }}>
                  {file.name}
                </Typography>
                {error ? (
                  <ErrorIcon fontSize="small" color="error" />
                ) : (
                  <CheckCircle fontSize="small" color="success" />
                )}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {file.type.toUpperCase()}
                </Typography>
              </Stack>
            </Box>

            <IconButton color="error" onClick={onClear} disabled={disabled}>
              <Delete />
            </IconButton>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
