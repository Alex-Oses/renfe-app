// Tipos de la API. Deben coincidir con obsidian/02-contratos-api/endpoints.md.

export interface Estacion {
  id: string;
  nombre: string;
  ciudad: string;
  lat: number;
  lon: number;
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

// --- Reservas y billetes (simulado: Renfe no publica asientos ni precios) ---

export type ClaseAsiento = "Estándar" | "Confort" | "Prémium";

export interface Asiento {
  id: string; // "3-12A": coche-fila+letra
  coche: number;
  fila: number;
  letra: "A" | "B" | "C" | "D";
  clase: ClaseAsiento;
  libre: boolean;
  precio: number;
}

export interface Pasajero {
  nombre: string;
  apellidos: string;
  documento: string; // DNI/NIE/pasaporte; solo se guarda en la reserva
  email: string;
}

export interface NuevaReserva {
  trenId: string;
  asientos: string[]; // ids de Asiento
  pasajeros: Pasajero[]; // uno por asiento
}

export interface Reserva {
  id: string;
  localizador: string; // 6 caracteres, como los de Renfe
  tren: Tren;
  asientos: Asiento[];
  pasajeros: Pasajero[];
  total: number;
  estado: "pendiente_pago" | "pagada" | "cancelada";
  creada: string;
}

export interface IntentoPago {
  clientSecret: string; // Stripe modo test; en simulado es un texto cualquiera
  importe: number;
}

export interface Billete {
  id: string;
  reservaId: string;
  localizador: string;
  tren: Tren;
  asiento: Asiento;
  pasajero: Pasajero;
  qr: string; // contenido firmado (Ed25519 en la API real); el frontend solo lo pinta
}

// --- Cuenta ---

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  caraRegistrada: boolean;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

// El embedding facial lo calcula el navegador (Human); nunca se envían fotos.
export type EmbeddingFacial = number[];

// --- Tiempo real (GTFS-RT en la API real) ---

export interface PosicionTren {
  trenId: string;
  tipo: TipoTren;
  numero: string;
  origen: string; // nombre de estación
  destino: string;
  lat: number;
  lon: number;
  rumbo: number; // grados, 0 = norte
  velocidad: number; // km/h
  retrasoMin: number;
  progreso: number; // 0..1 del trayecto
  proximaParada: string;
  actualizado: string; // ISO
}
