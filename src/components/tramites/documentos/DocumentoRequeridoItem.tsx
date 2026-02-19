import { TramiteDocumento } from "@/types/tramite.types";
import {
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Error as ErrorIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface DocumentoRequeridoItemProps {
  documentoCargado: TramiteDocumento;
  onCargarDocumento: (
    documentoRequerido: TramiteDocumento,
    files: FileList
  ) => void;
  onEliminarDocumento: (documentoId: number) => void;
  onVisualizarDocumento: (documento: TramiteDocumento) => void;
  loading?: boolean;
}

export const DocumentoRequeridoItem: React.FC<DocumentoRequeridoItemProps> = ({
  documentoCargado,
  onCargarDocumento,
  onEliminarDocumento,
  onVisualizarDocumento,
  loading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDocumentoCargado, setIsDocumentoCargado] = useState(
    documentoCargado.file !== undefined
  );

  const tiposPermitidos = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validaciones
    if (!tiposPermitidos.includes(file.type)) {
      alert(
        `Tipo de archivo no permitido: ${file.name}\nTipos permitidos: PDF, JPG, PNG, DOC, DOCX`
      );
      return;
    }

    if (file.size > maxFileSize) {
      alert(`Archivo demasiado grande: ${file.name}\nTamaño máximo: 10MB`);
      return;
    }

    onCargarDocumento(documentoCargado, files);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setIsDocumentoCargado(documentoCargado.file !== undefined);
  }, [documentoCargado.file]);

  /*   const getFileTypeLabel = (tipo: string): string => {
    const typeMap: { [key: string]: string } = {
      "application/pdf": "PDF",
      "image/jpeg": "JPG",
      "image/png": "PNG",
      "image/jpg": "JPG",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
    };
    return typeMap[tipo] || "ARCHIVO";
  }; */

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        border: "2px solid",
        borderColor: isDocumentoCargado ? "success.main" : "divider",

        backgroundColor: isDocumentoCargado ? "success.50" : "warning.50",
      }}
    >
      {loading && <LinearProgress />}

      <CardContent>
        {/* Header del documento */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <DocumentIcon color={isDocumentoCargado ? "success" : "action"} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                {documentoCargado?.documento?.nombre}
              </Typography>
              {documentoCargado?.documento?.descripcion && (
                <Typography variant="body2" color="text.secondary">
                  {documentoCargado?.documento?.descripcion}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Indicadores de estado */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isDocumentoCargado ? (
              <Chip
                icon={<CheckIcon />}
                label="Cargado"
                size="small"
                color="success"
              />
            ) : (
              <Chip
                icon={<ErrorIcon />}
                label="Pendiente"
                size="small"
                color="warning"
              />
            )}
          </Box>
        </Box>
        {isDocumentoCargado && (
          <Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => onVisualizarDocumento(documentoCargado)}
                size="small"
              >
                Ver Documento
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={handleUploadClick}
                size="small"
              >
                Reemplazar
              </Button>

              <IconButton
                color="error"
                onClick={() => onEliminarDocumento(documentoCargado.id!)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        )}
        {!isDocumentoCargado && (
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: 1,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "primary.50",
              "&:hover": {
                backgroundColor: "primary.100",
              },
            }}
            onClick={handleUploadClick}
          >
            <UploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="body1" color="primary.main" gutterBottom>
              Subir {documentoCargado.documento?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Haga clic aquí para seleccionar el archivo
              <br />
              Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
            </Typography>
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={loading}
        />
      </CardContent>
    </Card>
  );
};
