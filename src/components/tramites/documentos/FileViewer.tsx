import { tramitesService } from "@/services/tramitesService";
import { TramiteDocumento } from "@/types/index";
import { DocumentoTipo } from "@/types/tramite.types";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  RotateRight as RotateIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
interface FileViewerProps {
  documento: TramiteDocumento | null;
  open: boolean;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  documento,
  open,
  onClose,
}) => {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fetchDocumento = useCallback(async () => {
    if (documento && open) {
      setLoading(true);
      setError("");
      setZoom(100);
      setRotation(0);

      try {
        let url = "";
        if (documento.file) {
          url = URL.createObjectURL(documento.file);
        } else {
          const documentoBlob = await tramitesService.getFileById(
            documento!.id!
          );
          url = URL.createObjectURL(documentoBlob);
        }

        if (!url) {
          setError("Error al cargar el archivo");
          setLoading(false);
          return;
        }

        setFileUrl(url);
        setLoading(false);
      } catch {
        setError("Error al cargar el archivo");
        setLoading(false);
      }
    }
  }, [documento, open]);

  useEffect(() => {
    fetchDocumento();
  }, [fetchDocumento]);

  const handleDownload = () => {
    if (!documento) return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = documento.documento!.nombre!;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const renderFileContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!documento || !fileUrl) return null;

    // Renderizar según el tipo de archivo
    if (documento.archivoTipo === DocumentoTipo.pdf) {
      return (
        <Box sx={{ height: "70vh", width: "100%" }}>
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title={documento.documento!.nombre!}
          />
        </Box>
      );
    }

    if (
      documento.archivoTipo === DocumentoTipo.jpeg ||
      documento.archivoTipo === DocumentoTipo.png ||
      documento.archivoTipo === DocumentoTipo.jpg
    ) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            overflow: "auto",
            backgroundColor: "grey.100",
          }}
        >
          <Box sx={{ position: "relative", width: "100%", height: "500px" }}>
            <Image
              src={fileUrl}
              alt={documento.documento!.nombre!}
              fill
              style={{
                objectFit: "contain",
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
              }}
            />
          </Box>
        </Box>
      );
    }

    // Para documentos de Word y otros tipos no visualizables directamente
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="body1" gutterBottom>
          Este tipo de archivo no se puede visualizar directamente en el
          navegador.
        </Typography>
        <Typography variant="body2">
          Haga clic en &quot;Descargar&quot; para abrir el archivo en su
          aplicación correspondiente.
        </Typography>
      </Alert>
    );
  };

  const showImageControls =
    documento?.archivoTipo === DocumentoTipo.jpeg ||
    documento?.archivoTipo === DocumentoTipo.png ||
    documento?.archivoTipo === DocumentoTipo.jpg;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: { height: "90vh" },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {documento?.documento?.nombre}
          </Typography>
          {documento && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Chip
                label={documento.archivoTipo}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Controles para imágenes */}
          {showImageControls && (
            <>
              <IconButton onClick={handleZoomOut} disabled={zoom <= 25}>
                <ZoomOutIcon />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ minWidth: 40, textAlign: "center" }}
              >
                {zoom}%
              </Typography>
              <IconButton onClick={handleZoomIn} disabled={zoom >= 300}>
                <ZoomInIcon />
              </IconButton>
              <IconButton onClick={handleRotate}>
                <RotateIcon />
              </IconButton>
            </>
          )}

          <IconButton onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        {renderFileContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
          Descargar
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
