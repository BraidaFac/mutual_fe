import {
  EstadisticasDashboard,
  EstadoDocumento,
  FiltroTramites,
  HistorialPaso,
  PaginatedResponse,
  Tramite,
  TramiteDocumento,
  TramiteFormData,
} from "@/types/index";
import { apiRequest, apiRequestBlob } from "./api";

const crearTramiteFormData = (tramite: TramiteFormData) => {
  const formData = new FormData();
  formData.append("clienteId", tramite.clienteId?.toString() ?? "");
  formData.append("montoSolicitado", tramite.montoSolicitado?.toString() ?? "");
  formData.append("observaciones", tramite.observaciones ?? "");
  formData.append("tipoPrestamo", tramite.tipoPrestamo ?? "");
  formData.append("flujoId", tramite.flujoId?.toString() ?? "");
  formData.append(
    "clientName",
    tramite.cliente?.fullName ?? "Cliente sin nombre",
  );

  const documentosJson: {
    documentoId?: number;
    file?: File;
    tipo?: string;
    fechaSubida?: Date;
    fileName?: string;
    estado: EstadoDocumento;
  }[] = [];
  tramite.documentos.forEach((documento) => {
    if (documento.file) {
      formData.append("documentos", documento.file!, documento.file.name ?? "");
    }
    // Crear una copia del documento sin el file para el JSON
    const documentoParaJson = {
      fileName: documento.file?.name,
      documentoId: documento.documento?.id,
      tipo: documento.file?.type,
      fechaSubida: documento.fechaSubida,
      estado: documento.estado,
    };
    documentosJson.push(documentoParaJson);
  });

  formData.append("documentosData", JSON.stringify(documentosJson));

  return formData;
};

export const tramitesService: {
  getAll: (filtros?: FiltroTramites) => Promise<Tramite[]>;
  getPaginated: (
    filtros?: FiltroTramites,
  ) => Promise<PaginatedResponse<Tramite>>;
  getById: (id: number) => Promise<Tramite>;
  create: (tramite: TramiteFormData) => Promise<Tramite>;
  update: (id: number, tramite: Partial<TramiteFormData>) => Promise<Tramite>;
  avanzarPaso: (tramiteId: number, pasoId: number) => Promise<Tramite>;
  delete: (id: number) => Promise<void>;
  getByPaso: (pasoId: number) => Promise<Tramite[]>;
  getConRetrasos: () => Promise<Tramite[]>;
  getByCliente: (clienteId: number) => Promise<Tramite[]>;
  getDocumentos: (tramiteId: number) => Promise<TramiteDocumento[]>;
  actualizarDocumento: (
    tramiteId: number,
    documentoId: string,
    estado: EstadoDocumento,
  ) => Promise<void>;
  getHistorial: (tramiteId: number) => Promise<HistorialPaso[]>;
  getEstadisticas: (filtros?: {
    fuerzaId?: number;
    tipoPrestamo?: string;
  }) => Promise<EstadisticasDashboard>;
  actualizarUltimoContacto: (tramiteId: number) => Promise<Tramite>;
  agregarDocumentoATramite: (
    tramite: Tramite,
    documento: TramiteDocumento,
  ) => Promise<TramiteDocumento>;
  getFileById: (id: number) => Promise<Blob>;
  getReport: (filtros: FiltroTramites) => Promise<Blob>;
} = {
  // Obtener todos los trámites (sin paginación - para compatibilidad)
  getAll: async (filtros?: FiltroTramites): Promise<Tramite[]> => {
    const queryParams = new URLSearchParams();
    if (filtros?.pasoId)
      queryParams.append("estadoId", filtros.pasoId.toString()); // Backend aún usa estadoId
    if (filtros?.tipoPaso)
      queryParams.append("tipoPaso", filtros.tipoPaso);
    if (filtros?.tipoPrestamo)
      queryParams.append("tipoPrestamo", filtros.tipoPrestamo);
    if (filtros?.clienteId)
      queryParams.append("clienteId", filtros.clienteId.toString());
    if (filtros?.fechaDesde)
      queryParams.append("fechaDesde", filtros.fechaDesde.toISOString());
    if (filtros?.fechaHasta)
      queryParams.append("fechaHasta", filtros.fechaHasta.toISOString());
    if (filtros?.search) queryParams.append("search", filtros.search);

    const query = queryParams.toString();
    return apiRequest<Tramite[]>(`/tramites${query ? `?${query}` : ""}`);
  },

  // Obtener trámites paginados
  getPaginated: async (
    filtros?: FiltroTramites,
  ): Promise<PaginatedResponse<Tramite>> => {
    const queryParams = new URLSearchParams();

    if (filtros?.pasoId)
      queryParams.append("estadoId", filtros.pasoId.toString()); // Backend aún usa estadoId
    if (filtros?.tipoPaso)
      queryParams.append("tipoPaso", filtros.tipoPaso);
    if (filtros?.tipoPrestamo)
      queryParams.append("tipoPrestamo", filtros.tipoPrestamo);
    if (filtros?.clienteId)
      queryParams.append("clienteId", filtros.clienteId.toString());
    if (filtros?.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.fechaDesde)
      queryParams.append("fechaDesde", filtros.fechaDesde.toISOString());
    if (filtros?.fechaHasta)
      queryParams.append("fechaHasta", filtros.fechaHasta.toISOString());
    if (filtros?.search) queryParams.append("search", filtros.search);
    if (filtros?.page) queryParams.append("page", filtros.page.toString());
    if (filtros?.limit) queryParams.append("limit", filtros.limit.toString());

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Tramite>>(
      `/tramites${query ? `?${query}` : ""}`,
    );
  },

  // Obtener trámite por ID
  getById: async (id: number): Promise<Tramite> => {
    return apiRequest<Tramite>(`/tramites/${id}`);
  },

  // Crear nuevo trámite
  create: async (tramite: TramiteFormData): Promise<Tramite> => {
    return apiRequest<Tramite>("/tramites", {
      method: "POST",
      body: crearTramiteFormData(tramite),
    });
  },

  // Actualizar trámite
  update: async (
    id: number,
    tramite: Partial<TramiteFormData>,
  ): Promise<Tramite> => {
    return apiRequest<Tramite>(`/tramites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(tramite),
    });
  },

  // Eliminar trámite
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/tramites/${id}`, {
      method: "DELETE",
    });
  },

  // Avanzar paso del trámite
  avanzarPaso: async (tramiteId: number, pasoId: number): Promise<Tramite> => {
    return apiRequest<Tramite>(`/tramites/${tramiteId}/advance`, {
      method: "POST",
      body: JSON.stringify({ pasoId }),
    });
  },

  // Obtener trámites por paso
  getByPaso: async (pasoId: number): Promise<Tramite[]> => {
    return apiRequest<Tramite[]>(`/tramites?estadoId=${pasoId}`);
  },

  // Obtener trámites con retrasos
  getConRetrasos: async (): Promise<Tramite[]> => {
    return apiRequest<Tramite[]>("/tramites/delays");
  },

  // Obtener trámites por cliente
  getByCliente: async (clienteId: number): Promise<Tramite[]> => {
    return apiRequest<Tramite[]>(`/tramites/cliente/${clienteId}`);
  },

  // Obtener documentos del trámite
  getDocumentos: async (tramiteId: number): Promise<TramiteDocumento[]> => {
    return apiRequest<TramiteDocumento[]>(`/tramites/${tramiteId}/documentos`);
  },

  // Actualizar estado de documento
  actualizarDocumento: async (
    tramiteId: number,
    documentoId: string,
    estado: EstadoDocumento,
  ): Promise<void> => {
    return apiRequest<void>(
      `/tramites/${tramiteId}/documentos/${documentoId}`,
      {
        method: "PUT",
        body: JSON.stringify({ estado }),
      },
    );
  },

  // Obtener historial de pasos
  getHistorial: async (tramiteId: number): Promise<HistorialPaso[]> => {
    return apiRequest<HistorialPaso[]>(`/tramites/${tramiteId}/historial`);
  },

  // Obtener estadísticas para dashboard
  getEstadisticas: async (filtros?: {
    fuerzaId?: number;
    tipoPrestamo?: string;
  }): Promise<EstadisticasDashboard> => {
    const queryParams = new URLSearchParams();
    if (filtros?.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros?.tipoPrestamo)
      queryParams.append("tipoPrestamo", filtros.tipoPrestamo);

    const query = queryParams.toString();
    return apiRequest<EstadisticasDashboard>(
      `/tramites/estadisticas${query ? `?${query}` : ""}`,
    );
  },

  // Actualizar último contacto
  actualizarUltimoContacto: async (tramiteId: number): Promise<Tramite> => {
    return apiRequest<Tramite>(`/tramites/${tramiteId}/contact`, {
      method: "POST",
    });
  },

  // Agregar documento a un trámite
  agregarDocumentoATramite: async (
    tramite: Tramite,
    documento: TramiteDocumento,
  ): Promise<TramiteDocumento> => {
    const formData = new FormData();
    formData.append("documento", documento.file!, documento.file?.name ?? "");
    formData.append("clientName", tramite.cliente?.fullName ?? "");
    return apiRequest<TramiteDocumento>(
      `/tramites/${tramite.id}/documento/${documento.id}`,
      {
        method: "PATCH",
        body: formData,
      },
    );
  },

  getFileById: async (id: number): Promise<Blob> => {
    return await apiRequestBlob(`/tramites/documento/${id}/file`);
  },

  getReport: async (filtros: FiltroTramites): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (filtros.fechaDesde)
      queryParams.append("fechaDesde", filtros.fechaDesde.toISOString());
    if (filtros.fechaHasta)
      queryParams.append("fechaHasta", filtros.fechaHasta.toISOString());
    if (filtros.tipoPaso) queryParams.append("tipoPaso", filtros.tipoPaso);
    if (filtros.tipoPrestamo)
      queryParams.append("tipoPrestamo", filtros.tipoPrestamo);
    if (filtros.provinciaId)
      queryParams.append("provinciaId", filtros.provinciaId.toString());
    if (filtros.fuerzaId)
      queryParams.append("fuerzaId", filtros.fuerzaId.toString());
    if (filtros.search) queryParams.append("search", filtros.search);

    const query = queryParams.toString();
    return apiRequestBlob(`/tramites/report${query ? `?${query}` : ""}`);
  },
};
