import { flujosService } from "@/services/flujosService";
import { FlujoTramite } from "@/types/flujo.types";
import { Cliente, TipoPrestamo } from "@/types/index";
import { useCallback, useEffect, useState } from "react";

export interface UseFlujoSelectionProps {
  cliente: Cliente | null;
  tipoPrestamo: TipoPrestamo | undefined;
}

export interface UseFlujoSelectionReturn {
  flujo: FlujoTramite | null;
  loading: boolean;
  error: string | null;
  actions: {
    seleccionarFlujo: (flujo: FlujoTramite | null) => void;
    recargarFlujo: () => void;
    limpiarError: () => void;
  };
}

export const useFlujoSelection = ({
  cliente,
  tipoPrestamo,
}: UseFlujoSelectionProps): UseFlujoSelectionReturn => {
  const [flujo, setFlujo] = useState<FlujoTramite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarFlujo = useCallback(async () => {
    if (!cliente?.fuerza?.id) {
      setFlujo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const flujo = await flujosService.getByFuerza(
        cliente.fuerza.id,
        tipoPrestamo
      );

      setFlujo(flujo);

      // Si solo hay un flujo disponible, seleccionarlo automáticamente
      if (!flujo) {
        setFlujo(null);
        setError(
          "No hay flujos disponibles para esta combinación de fuerza y tipo de préstamo."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar flujos";
      setError(errorMessage);
      setFlujo(null);
    } finally {
      setLoading(false);
    }
  }, [cliente?.fuerza?.id, tipoPrestamo]);

  // Cargar flujos cuando cambian las dependencias
  useEffect(() => {
    cargarFlujo();
  }, [cargarFlujo]);

  const seleccionarFlujo = useCallback((nuevoFlujo: FlujoTramite | null) => {
    setFlujo(nuevoFlujo);
  }, []);

  const recargarFlujo = useCallback(() => {
    cargarFlujo();
  }, [cargarFlujo]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    flujo,
    loading,
    error,
    actions: {
      seleccionarFlujo,
      recargarFlujo,
      limpiarError,
    },
  };
};
