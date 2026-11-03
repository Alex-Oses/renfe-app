import type { PosicionTren } from "@renfe/shared/api/tipos";

// Misma interfaz para el mapa nativo (react-native-maps) y el esquema de la versión web.
export interface PropsMapa {
  trenes: PosicionTren[];
  seleccion?: string | null;
  onElegir?: (tren: PosicionTren) => void;
  // Alto aproximado (px) que el panel inferior tapa del mapa: se descuenta al encuadrar el
  // recorrido para que no quede detrás de la hoja.
  espacioInferior?: number;
}
