import { FlujoTramite } from "@/types/flujo.types";
import {
  Cliente,
  DocumentoTipo,
  EstadoDocumento,
  TramiteDocumento,
} from "@/types/index";
import { Alert, Box, Divider, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { DocumentoRequeridoItem } from "./DocumentoRequeridoItem";
import { FileViewer } from "./FileViewer";

export interface DocumentoCargado {
  id: string;
  documentoRequeridoId: number;
  file: File;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaCarga: Date;
  preview?: string;
}

export interface TramiteDocumentosManagerProps {
  flujo: FlujoTramite | null;
  cliente: Cliente | null;
  documentosCargados?: TramiteDocumento[];
  onDocumentosChange: (documentos: TramiteDocumento[]) => void;
}

export const TramiteDocumentosManager: React.FC<
  TramiteDocumentosManagerProps
> = ({ flujo, cliente, documentosCargados = [], onDocumentosChange }) => {
  const [documentoVisualizando, setDocumentoVisualizando] =
    useState<TramiteDocumento | null>(null);
  const [documentosActuales, setDocumentosActuales] =
    useState<TramiteDocumento[]>(documentosCargados);
  const handleDocumentosCargados = useCallback(
    (nuevosDocumentos: TramiteDocumento[]) => {
      onDocumentosChange(nuevosDocumentos);
    },
    [onDocumentosChange]
  );

  const handleCargarDocumento = async (
    documento: TramiteDocumento,
    files: FileList
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    documento.file = file;
    documento.archivoTipo = file.type as DocumentoTipo;
    documento.archivoNombre = file.name;
    documento.fechaSubida = new Date();
    documento.estado = EstadoDocumento.RECIBIDO;

    const documentoIndex = documentosActuales.findIndex(
      (doc) => doc.documento?.id === documento.documento?.id
    );
    documentosActuales[documentoIndex] = documento;
    handleDocumentosCargados(documentosActuales);
  };

  const handleEliminarDocumento = (documentoId: number) => {
    const documentos = documentosCargados.findIndex(
      (doc) => doc.documento?.id !== documentoId
    );
    documentosActuales[documentos]!.file = undefined;
    documentosActuales[documentos]!.archivoTipo = undefined;
    documentosActuales[documentos]!.archivoNombre = undefined;
    documentosActuales[documentos]!.fechaSubida = undefined;
    documentosActuales[documentos]!.estado = EstadoDocumento.PENDIENTE;
    handleDocumentosCargados(documentosActuales);
  };

  const handleVisualizarDocumento = (documento: TramiteDocumento) => {
    setDocumentoVisualizando(documento);
  };

  /*   const generateImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }; */

  const generarDocumentosPrevio = useCallback(() => {
    const documentosRequeridosVisibles = flujo?.documentosRequeridos;
    const documentosPregenerados = documentosRequeridosVisibles?.map((doc) => {
      const nuevoDocumento: TramiteDocumento = {
        documento: doc.documento,
        estado: EstadoDocumento.PENDIENTE,
      };
      return nuevoDocumento;
    });
    setDocumentosActuales(documentosPregenerados ?? []);
    handleDocumentosCargados(documentosPregenerados ?? []);
  }, [flujo, handleDocumentosCargados]);

  useEffect(() => {
    if ((documentosCargados?.length ?? 0) === 0) {
      generarDocumentosPrevio();
    }
  }, [documentosCargados, generarDocumentosPrevio]);

  if (!flujo) {
    return (
      <Alert severity="warning">
        Debe seleccionar un flujo de trámite para cargar los documentos
        requeridos.
      </Alert>
    );
  }

  if (documentosActuales.length === 0) {
    return (
      <Alert severity="info">
        No hay documentos requeridos para este tipo de préstamo
        {cliente?.esSocio ? " (cliente es socio)" : ""}.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Información del cliente */}
      {cliente && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Cliente:</strong> {cliente.fullName}
            <br />
            <strong>Fuerza:</strong> {cliente.fuerza?.nombre}
            <br />
            <strong>Socio:</strong> {cliente.esSocio ? "Sí" : "No"}
          </Typography>
        </Alert>
      )}

      {/* Título y resumen */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Documentos Requeridos ({documentosActuales.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Lista de documentos requeridos */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {documentosActuales.map((documentoTramite, index) => {
          return (
            <DocumentoRequeridoItem
              key={documentoTramite.id || index}
              documentoCargado={documentoTramite}
              onCargarDocumento={handleCargarDocumento}
              onEliminarDocumento={handleEliminarDocumento}
              onVisualizarDocumento={handleVisualizarDocumento}
            />
          );
        })}
      </Box>

      {/* Visor de documentos */}
      <FileViewer
        documento={documentoVisualizando}
        open={!!documentoVisualizando}
        onClose={() => setDocumentoVisualizando(null)}
      />
    </Box>
  );
};
