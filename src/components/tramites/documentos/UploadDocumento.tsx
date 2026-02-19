/**
 * Componente para subir documentos con drag & drop y validaciones
 */
import { TramiteDocumento } from "@/types/index";
import { CloudUpload as UploadIcon } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

interface UploadDocumentoProps {
  documentoCargado: TramiteDocumento;
  onCargarDocumento: (documento: TramiteDocumento, files: File) => void;
}

const TIPOS_PERMITIDOS: { [key: string]: string } = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/png": "PNG",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

const MAX_FILE_SIZE_MB = 10;

export const UploadDocumento: React.FC<UploadDocumentoProps> = ({
  documentoCargado,
  onCargarDocumento,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB`;
    }

    // Validar tipo
    if (!TIPOS_PERMITIDOS[file.type]) {
      return `Tipo de archivo no permitido. Formatos aceptados: ${Object.values(
        TIPOS_PERMITIDOS
      ).join(", ")}`;
    }

    return null;
  };

  const processFile = async (files: FileList) => {
    setError(null);

    // Validar archivo
    const validationError = validateFile(files[0]);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    onCargarDocumento(documentoCargado, files[0]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files?.[0];
    if (file) {
      processFile(files);
    }
    // Reset input para permitir seleccionar el mismo archivo otra vez
    event.target.value = "";
  };

  const getAcceptAttribute = () => {
    return Object.keys(TIPOS_PERMITIDOS).join(",");
  };

  return (
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
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptAttribute()}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={false}
      />
    </Box>
  );
};
