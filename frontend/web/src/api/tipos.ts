// Tipos de la API. Deben coincidir con obsidian/02-contratos-api/endpoints.md.

export interface Estacion {
  id: string;
  nombre: string;
  ciudad: string;
}

export type TipoTren = "AVE" | "Avlo" | "Alvia" | "Intercity" | "Media Distancia";

export interface Tren {
  id: string;
  tipo: TipoTren;
  numero: string;
  origen: Estacion;
  destino: Estacion;
  salida: string; // ISO 8601, hora local
  llegada: string;
  precioDesde: number; // euros; simulado
  plazasLibres: number; // simulado
}

export interface BusquedaTrenes {
  origen: string; // id de estación
  destino: string;
  fecha: string; // AAAA-MM-DD
}
