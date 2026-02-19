// Configuración para alternar entre API real y datos mock

// Cambia esta variable para alternar entre modo mock y API real
export const USE_MOCK_DATA = false;

// URL base de la API real (cuando esté disponible)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Configuración de timeouts
export const API_TIMEOUT = 10000; // 10 segundos

// Configuración de reintentos
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 segundo

// Headers por defecto
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  credentials: "include",
};

// Configuración de mock
export const MOCK_CONFIG = {
  // Delay para simular latencia de red (en ms)
  DEFAULT_DELAY: 800,
  MIN_DELAY: 300,
  MAX_DELAY: 2000,

  // Probabilidad de error simulado (0.0 = nunca, 1.0 = siempre)
  ERROR_RATE: 0.05, // 5% de probabilidad de error

  // Mensajes de error simulados
  ERROR_MESSAGES: [
    "Error de conexión con el servidor",
    "Timeout de la solicitud",
    "Error interno del servidor",
    "Servicio temporalmente no disponible",
  ],
};

// Función para obtener un mensaje de error aleatorio
export const getRandomErrorMessage = (): string => {
  const messages = MOCK_CONFIG.ERROR_MESSAGES;
  return messages[Math.floor(Math.random() * messages.length)];
};
