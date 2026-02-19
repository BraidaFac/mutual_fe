import { tramitesService } from "@/services/tramitesService";
import { EstadoDocumento, TramiteDocumento } from "@/types/index";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseDocumentosManagerReturn {
  documentos: TramiteDocumento[];
  documentosPendientes: TramiteDocumento[];
  documentosCargados: TramiteDocumento[];
  loading: boolean;
  error: string | null;
  actions: {
    agregarDocumento: (documento: TramiteDocumento) => void;
    setDocumentos: (documentos: TramiteDocumento[]) => void;
    eliminarDocumento: (documentoId: string) => void;
    limpiarDocumentos: () => void;
    setTramiteId: (tramiteId: number | null) => void;
  };
}

export const useDocumentosManager = (): UseDocumentosManagerReturn => {
  const [documentos, setDocumentos] = useState<TramiteDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tramiteId, setTramiteId] = useState<number | null>(null);
  // Obtener documentos requeridos visibles según el cliente
  const documentosPendientes = useMemo(() => {
    if (!documentos || documentos.length === 0) return [];
    return documentos.filter((doc) => {
      // Si el cliente es socio y el documento no es necesario para socios, no lo mostramos
      return (
        doc.estado === EstadoDocumento.PENDIENTE ||
        doc.estado === EstadoDocumento.RECHAZADO
      );
    });
  }, [documentos]);

  const documentosCargados = useMemo(() => {
    if (!documentos || documentos.length === 0) return [];
    return documentos.filter((doc) => {
      return (
        doc.estado === EstadoDocumento.RECIBIDO ||
        doc.estado === EstadoDocumento.ACEPTADO
      );
    });
  }, [documentos]);

  // Actions
  const agregarDocumento = useCallback((documento: TramiteDocumento) => {
    setDocumentos((prev) => {
      // Remover documento anterior del mismo tipo si existe
      const documentosFiltrados = prev.filter(
        (doc) => doc.documento?.id !== Number(documento.documento?.id),
      );
      return [...documentosFiltrados, documento];
    });
  }, []);

  const eliminarDocumento = useCallback(
    (tramiteDocumentoId: number | string) => {
      setDocumentos((prev) =>
        prev.filter((doc) => doc.id !== Number(tramiteDocumentoId)),
      );
    },
    [],
  );

  // Cargar documentos del trámite
  const loadDocumentos = useCallback(async () => {
    if (!tramiteId) {
      setError("Trámite no encontrado");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const documentos = await tramitesService.getDocumentos(tramiteId);
      setDocumentos(documentos);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al cargar los documentos";
      setError(errorMessage);
      setLoading(false);
    }
  }, [setLoading, setError, tramiteId]);

  useEffect(() => {
    console.log("useEffect loadDocumentos", new Date().toISOString());
    if (tramiteId) {
      loadDocumentos();
    }
  }, [tramiteId, loadDocumentos]);

  const limpiarDocumentos = useCallback(() => {
    setDocumentos([]);
  }, []);

  return {
    documentos,
    documentosPendientes,
    documentosCargados,
    loading,
    error,
    actions: {
      setTramiteId,
      agregarDocumento,
      eliminarDocumento,
      limpiarDocumentos,
      setDocumentos,
    },
  };
};
