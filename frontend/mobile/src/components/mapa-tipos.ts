import type { PosicionTren } from "@renfe/shared/api/tipos";

// Misma interfaz para el mapa nativo (react-native-maps) y el esquema de la versión web.
export interface PropsMapa {
  trenes: PosicionTren[];
  seleccion?: string | null;
  onElegir?: (tren: PosicionTren) => void;
}
