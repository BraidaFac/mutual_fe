import { TipoPaso } from "@/types/flujo.types";

export const coloresDisponibles = [
  { value: "#f44336", label: "Rojo" },
  { value: "#e91e63", label: "Rosa" },
  { value: "#9c27b0", label: "Púrpura" },
  { value: "#673ab7", label: "Índigo" },
  { value: "#3f51b5", label: "Azul" },
  { value: "#2196f3", label: "Azul Claro" },
  { value: "#03a9f4", label: "Cian" },
  { value: "#00bcd4", label: "Turquesa" },
  { value: "#009688", label: "Verde Azulado" },
  { value: "#4caf50", label: "Verde" },
  { value: "#8bc34a", label: "Verde Claro" },
  { value: "#cddc39", label: "Lima" },
  { value: "#ffeb3b", label: "Amarillo" },
  { value: "#ffc107", label: "Ámbar" },
  { value: "#ff9800", label: "Naranja" },
  { value: "#ff5722", label: "Naranja Profundo" },
];

export function getColorPaso(tipo: TipoPaso): string {
  switch (tipo) {
    case TipoPaso.FINAL_EXITOSO:
      return "#4caf50";
    case TipoPaso.FINAL_RECHAZADO:
      return "#f44336";
    case TipoPaso.INTERMEDIO:
      return "#ffeb3b";
    case TipoPaso.INICIAL:
      return "#2196f3";
    default:
      return "#2196f3";
  }
}
