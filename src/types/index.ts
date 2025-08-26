export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  fuerzaId: string
  localidadId: string
  fechaCreacion: Date
}

export interface Fuerza {
  id: string
  nombre: string
  descripcion?: string
}

export interface Localidad {
  id: string
  nombre: string
  provincia: string
}

export interface Documento {
  id: string
  nombre: string
  descripcion?: string
  obligatorio: boolean
}

export interface Estado {
  id: string
  nombre: string
  descripcion?: string
  secuencia: number
  diasMaximos: number
  esUrgente: boolean
  color: "urgent" | "warning" | "success" | "info"
}

export interface Tramite {
  id: string
  clienteId: string
  estadoId: string
  fechaInicio: Date
  fechaUltimoContacto: Date
  observaciones?: string
  documentosRecibidos: string[]
}

export interface ConfiguracionDocumento {
  id: string
  fuerzaId: string
  estadoId: string
  documentoId: string
  obligatorio: boolean
}

export interface TramiteConDetalles extends Tramite {
  cliente: Cliente
  estado: Estado
  fuerza: Fuerza
  localidad: Localidad
}
