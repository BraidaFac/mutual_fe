/**
 * Hook unificado para la gestión completa de trámites
 * Combina operaciones CRUD, gestión de documentos y lógica de transiciones de pasos
 * Implementa el patrón MVVM separando la lógica de negocio de la presentación
 */
import { tramitesService } from "@/services/tramitesService";
import {
  FiltroTramites,
  HistorialPaso,
  PaginatedResponse,
  PaginationMeta,
  PasoTramite,
  TipoPaso,
  Tramite,
  TramiteDocumento,
  TramiteFormData,
} from "@/types/index";
import { useCallback, useState } from "react";

export interface TramiteState {
  // Estado de datos
  currentTramite: Tramite | null;
  tramites: Tramite[];
  paginationMetaTramites: PaginationMeta;
  historial: HistorialPaso[];
  documentos: TramiteDocumento[];
  loading: boolean;
  error: string | null;
  paginationMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  availableTransitionsForward: PasoTramite[];
  availableTransitionsBackward: PasoTramite[];
  canAdvance: boolean;
  canGoBack: boolean;
}

export interface TramiteActions {
  // Operaciones CRUD básicas
  loadTramites: (filtros?: FiltroTramites) => Promise<void>;
  loadTramiteById: (id: number) => Promise<void>;
  createTramite: (data: TramiteFormData) => Promise<Tramite | null>;
  updateTramite: (
    id: number,
    data: Partial<TramiteFormData>,
  ) => Promise<Tramite | null>;
  deleteTramite: (id: number) => Promise<boolean>;
  agregarDocumentoATramite: (
    doc: TramiteDocumento,
  ) => Promise<TramiteDocumento | null>;

  // Operaciones específicas del flujo
  avanzarPaso: (tramiteId: number, pasoId: number) => Promise<boolean>;
  loadHistorial: () => Promise<void>;
  actualizarUltimoContacto: (tramiteId: number) => Promise<boolean>;

  // Operaciones de transiciones
  validateTransition: (fromStep: PasoTramite, toStep: PasoTramite) => boolean;
  getNextStep: (currentStep: PasoTramite) => PasoTramite | null;
  getPreviousStep: (currentStep: PasoTramite) => PasoTramite | null;
  clearTransitionsError: () => void;

  // Utilidades
  clearError: () => void;
  resetState: () => void;
  setCurrentTramite: (tramite: Tramite | null) => void;
}

const initialState: TramiteState = {
  currentTramite: null,
  tramites: [],
  paginationMetaTramites: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  historial: [],
  loading: false,
  documentos: [],
  error: null,
  paginationMeta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  canAdvance: false,
  canGoBack: false,
  availableTransitionsForward: [],
  availableTransitionsBackward: [],
};

export function useTramiteManagement(): [TramiteState, TramiteActions] {
  const [state, setState] = useState<TramiteState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const setCurrentTramite = useCallback((tramite: Tramite | null) => {
    setState((prev) => ({ ...prev, currentTramite: tramite }));
  }, []);

  // Cargar lista de trámites con filtros
  const loadTramites = useCallback(
    async (filtros?: FiltroTramites) => {
      try {
        setLoading(true);
        setError(null);

        const response: PaginatedResponse<Tramite> =
          await tramitesService.getPaginated(filtros);

        setState((prev) => ({
          ...prev,
          paginationMeta: response.meta,
          tramites: response.data,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al cargar trámites";
        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  // Calcular transiciones disponibles basadas en el trámite actual
  const calculateAvailableTransitions = useCallback((tramite: Tramite) => {
    if (!tramite.pasoActual || !tramite.flujo) {
      setState((prev) => ({
        ...prev,
        transitionsLoading: false,
        error: "Trámite no válido",
        availableTransitions: [],
        canAdvance: false,
        canGoBack: false,
        canCancel: false,
      }));
      return;
    }

    const availableTransitionsForward =
      tramite.pasoActual.transicionesOrigen.map(
        (transicion) => transicion.pasoDestino,
      );
    const availableTransitionsBackward =
      tramite.pasoActual.transicionesDestino.map(
        (transicion) => transicion.pasoOrigen,
      );

    const canGoBack =
      availableTransitionsBackward.length > 0 &&
      tramite.pasoActual.tipoPaso !== TipoPaso.FINAL_EXITOSO;
    setState((prev) => ({
      ...prev,
      transitionsLoading: false,
      canAdvance: availableTransitionsForward.length > 0,
      canGoBack: canGoBack,
      availableTransitionsForward,
      availableTransitionsBackward,
    }));
  }, []);

  // Cargar trámite específico por ID
  const loadTramiteById = useCallback(
    async (id: number) => {
      try {
        console.log(new Date().toISOString(), "loadTramiteById");
        setLoading(true);
        setError(null);

        const tramite = await tramitesService.getById(id);

        calculateAvailableTransitions(tramite);
        setState((prev) => ({
          ...prev,
          currentTramite: tramite,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al cargar el trámite";
        setError(errorMessage);
        setLoading(false);
      }
    },
    [setLoading, setError, calculateAvailableTransitions],
  );

  // Crear nuevo trámite
  const createTramite = useCallback(
    async (data: TramiteFormData): Promise<Tramite | null> => {
      try {
        setLoading(true);
        setError(null);

        const newTramite = await tramitesService.create(data);

        setState((prev) => ({
          ...prev,
          tramites: [...prev.tramites, newTramite],
          paginationMeta: {
            ...prev.paginationMeta,
            total: prev.paginationMeta.total + 1,
          },
          loading: false,
        }));

        return newTramite;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al crear el trámite";
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [setLoading, setError],
  );

  // Actualizar trámite existente
  const updateTramite = useCallback(
    async (
      id: number,
      data: Partial<TramiteFormData>,
    ): Promise<Tramite | null> => {
      try {
        setLoading(true);
        setError(null);

        const updatedTramite = await tramitesService.update(id, data);

        setState((prev) => ({
          ...prev,
          tramites: prev.tramites.map((t) =>
            t.id === id ? updatedTramite : t,
          ),
          currentTramite: updatedTramite,
          loading: false,
        }));

        return updatedTramite;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al actualizar el trámite";
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [setLoading, setError],
  );

  // Eliminar trámite
  const deleteTramite = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await tramitesService.delete(id);
        setState((prev) => ({
          ...prev,
          tramites: prev.tramites.filter((t) => t.id !== id),
          paginationMeta: {
            ...prev.paginationMeta,
            total: prev.paginationMeta.total - 1,
          },
          currentTramite: null,
          documentos: [],
          historial: [],
          loading: false,
        }));

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al eliminar el trámite";
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [setLoading, setError],
  );

  // Avanzar al siguiente paso del trámite
  const avanzarPaso = useCallback(
    async (tramiteId: number, pasoId: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const updatedTramite = await tramitesService.avanzarPaso(
          tramiteId,
          pasoId,
        );

        setState((prev) => ({
          ...prev,
          currentTramite:
            prev.currentTramite?.id === tramiteId
              ? updatedTramite
              : prev.currentTramite,
          loading: false,
        }));

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al avanzar el paso del trámite";
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [setLoading, setError],
  );

  // Cargar historial de pasos
  const loadHistorial = useCallback(async () => {
    if (!state.currentTramite) {
      setLoading(true);
      setError("Trámite no encontrado");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const historial = await tramitesService.getHistorial(
        state.currentTramite.id,
      );

      setState((prev) => ({
        ...prev,
        historial,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al cargar el historial";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [state.currentTramite, setLoading, setError]);

  // Actualizar último contacto
  const actualizarUltimoContacto = useCallback(
    async (tramiteId: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const updatedTramite =
          await tramitesService.actualizarUltimoContacto(tramiteId);

        setState((prev) => ({
          ...prev,
          currentTramite:
            prev.currentTramite?.id === tramiteId
              ? updatedTramite
              : prev.currentTramite,
          loading: false,
        }));

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al actualizar el último contacto";
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [setLoading, setError],
  );

  // ========== FUNCIONES DE TRANSICIONES ==========

  const clearTransitionsError = useCallback(() => {
    setState((prev) => ({ ...prev, transitionsError: null }));
  }, []);

  // Validar si una transición es válida
  const validateTransition = useCallback(
    (fromStep: PasoTramite, toStep: PasoTramite): boolean => {
      if (!fromStep || !toStep) return false;

      // Verificar si existe una regla de transición válida
      const validTransition = fromStep.transicionesOrigen?.find(
        (transicion) => transicion.pasoDestino.id === toStep.id,
      );

      return !!validTransition;
    },
    [],
  );

  // Obtener el siguiente paso en la secuencia
  const getNextStep = useCallback(
    (currentStep: PasoTramite): PasoTramite | null => {
      if (!currentStep) return null;

      const flujo = state.currentTramite?.flujo;
      if (!flujo) return null;

      const pasos = flujo.pasos.sort((a, b) => a.orden - b.orden);
      const currentIndex = pasos.findIndex((p) => p.id === currentStep.id);

      if (currentIndex === -1 || currentIndex === pasos.length - 1) {
        return null; // No hay siguiente paso
      }

      return pasos[currentIndex + 1];
    },
    [state.currentTramite],
  );

  // Obtener el paso anterior en la secuencia
  const getPreviousStep = useCallback(
    (currentStep: PasoTramite): PasoTramite | null => {
      if (!currentStep) return null;

      const flujo = state.currentTramite?.flujo;
      if (!flujo) return null;

      const pasos = flujo.pasos.sort((a, b) => a.orden - b.orden);
      const currentIndex = pasos.findIndex((p) => p.id === currentStep.id);

      if (currentIndex <= 0) {
        return null; // No hay paso anterior
      }

      return pasos[currentIndex - 1];
    },
    [state.currentTramite],
  );

  const agregarDocumentoATramite = async (documento: TramiteDocumento) => {
    const currentTramite = state.currentTramite;
    if (!currentTramite || !documento.file) {
      return null;
    }
    const newDocumento = await tramitesService.agregarDocumentoATramite(
      currentTramite,
      documento,
    );
    return newDocumento;
  };
  const actions: TramiteActions = {
    // CRUD básico
    loadTramites,
    loadTramiteById,
    createTramite,
    updateTramite,
    deleteTramite,
    agregarDocumentoATramite,

    // Operaciones del flujo
    avanzarPaso,
    loadHistorial,
    actualizarUltimoContacto,

    // Transiciones
    validateTransition,
    getNextStep,
    getPreviousStep,
    clearTransitionsError,

    // Utilidades
    clearError,
    resetState,
    setCurrentTramite,
  };

  return [state, actions];
}
