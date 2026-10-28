// Tipos de la API. Deben coincidir con obsidian/02-contratos-api/endpoints.md.

export interface Estacion {
  id: string;
  nombre: string;
  ciudad: string;
  lat: number;
  lon: number;
}

// "Larga Distancia": tren del feed AVE/LD en tiempo real, del que Renfe no dice si es AVE, Alvia, etc.
export type TipoTren = "AVE" | "Avlo" | "Alvia" | "Intercity" | "Media Distancia" | "Cercanías" | "Larga Distancia";

// En /trenes la API solo manda id y nombre de las estaciones; ciudad puede faltar o venir vacía.
export type EstacionTren = Pick<Estacion, "id" | "nombre"> & Partial<Estacion>;

// Nombre corto para la UI: la ciudad si se conoce; si no, el nombre de la estación.
export const ciudadDe = (e: EstacionTren) => e.ciudad || e.nombre;

export interface Tren {
  id: string; // "feed:tripId:fecha" (contrato); en simulado, cualquier id único
  tipo: TipoTren;
  numero: string;
  origen: EstacionTren;
  destino: EstacionTren;
  feed?: "cercanias" | "avld";
  tripId?: string;
  fecha?: string; // AAAA-MM-DD
  retrasoSeg?: number | null;
  salida: string; // ISO 8601 con offset
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
  tipo?: TipoViajero; // sin tipo = adulto
}

export interface NuevaReserva {
  trenId: string;
  asientos: string[]; // ids de Asiento
  pasajeros: Pasajero[]; // uno por asiento
  tarifa?: IdTarifa; // sin tarifa = básico
  descuento?: IdDescuento;
  extras?: IdExtra[];
  bebes?: number; // viajan gratis en brazos, sin asiento
}

export interface Reserva {
  id: string;
  localizador: string; // 6 caracteres, como los de Renfe
  tren: Tren;
  asientos: Asiento[];
  pasajeros: Pasajero[];
  total: number;
  tarifa?: IdTarifa;
  descuento?: IdDescuento;
  extras?: IdExtra[];
  bebes?: number;
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
  usuarioId?: string; // dueño del billete; sin sesión, undefined
  qr: string; // contenido firmado (Ed25519 en la API real); el frontend solo lo pinta
}

// --- Cuenta ---

// Rol del JWT (app_metadata.rol, ver endpoints.md). Sin rol = viajero.
export type Rol = "viajero" | "revisor" | "admin";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  caraRegistrada: boolean;
  rol?: Rol;
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
  retrasoMin: number;
  progreso: number; // 0..1 del trayecto
  proximaParada: string; // "" si no se conoce
  llegadaProxima?: string; // ISO, hora prevista en la próxima parada (con retraso)
  llegadaDestino?: string; // ISO, hora prevista en el destino (con retraso)
  linea?: string; // Cercanías: C-1, R2…
  actualizado: string; // ISO
  ruta: [number, number][]; // [lat, lon] del recorrido completo, para pintar la línea
  paradas: ParadaRuta[];
}

export interface ParadaRuta {
  estacionId: string;
  nombre: string;
  lat: number;
  lon: number;
  llegada: string; // ISO, hora prevista ya con el retraso aplicado
  pasada: boolean;
}

// --- Favoritos y avisos (en local; la API real los guardará por usuario) ---

export interface LineaFavorita {
  id: string; // "<origen>-<destino>"
  origen: string; // id de estación
  destino: string;
}

export type TipoAviso = "retraso" | "llegada" | "cambio" | "info";

export interface Aviso {
  id: string;
  tipo: TipoAviso;
  titulo: string;
  texto: string;
  enlace?: string; // ruta interna, p. ej. /mapa?tren=...
  creado: string; // ISO
  leido: boolean;
}

// Seguimiento: avisar cuando un tren se acerque a una parada.
export interface Seguimiento {
  trenId: string;
  estacionId: string;
  minutosAntes: number;
}

export interface EnlaceWallet {
  plataforma: "apple" | "google";
  url: string; // .pkpass firmado (Apple) o enlace "Guardar en Google Wallet"
}

// --- Tarifas, viajeros y extras (simulado; reglas aproximadas a las de Renfe) ---

export type TipoViajero = "adulto" | "nino" | "bebe"; // niño: 4-13 años; bebé: 0-3 sin asiento
export type IdTarifa = "basico" | "elige" | "elige-confort" | "premium";
export type IdDescuento = "ninguno" | "joven" | "dorada" | "fn-general" | "fn-especial";
export type IdExtra = "equipaje" | "mascota" | "bici" | "comida" | "seguro";

// --- Revisor: validación de billetes (POST /billetes/validar) ---

export type EstadoValidacion =
  | "valido" // todo correcto: primera vez que se valida
  | "ya_validado" // auténtico, pero ya se validó antes (¿lo usan dos personas?)
  | "otro_dia" // auténtico, pero el viaje es otro día
  | "caducado" // auténtico, pero el tren ya llegó a su destino
  | "anulado" // auténtico, pero la reserva está cancelada
  | "falso" // la firma no cuadra: QR inventado o manipulado
  | "no_existe"; // firma correcta pero el billete no está en el sistema (solo lo sabe la API)

// Lo que ve el revisor del billete escaneado.
export interface BilleteValidado {
  id: string;
  localizador: string;
  pasajero: string;
  documento: string; // enmascarado: ••••678Z
  tipo: string;
  numero: string;
  salida: string; // ISO
  llegada: string; // ISO
  origen: string;
  destino: string;
  coche: number;
  asiento: string;
  clase: string;
}

export interface ResultadoValidacion {
  estado: EstadoValidacion;
  billete?: BilleteValidado; // no hay si es falso
  validadoEn: string; // ISO, esta lectura
  primeraValidacion?: string; // ISO, si ya se había validado
  comprobadoEnServidor: boolean; // false = solo firma, sin API (modo simulado)
}

// --- Administración (GET /admin/resumen, propuesto) ---

export interface ResumenAdmin {
  billetesVendidos: number;
  reservas: number;
  reservasCanceladas: number;
  ingresos: number; // euros, simulado
  validaciones: number;
  usuarios: number;
  ultimasReservas: { localizador: string; trayecto: string; total: number; estado: Reserva["estado"]; creada: string }[];
}

// Aviso aún sin guardar; grave: retraso importante (el pop-up usa role="alert").
export type NuevoAviso = Omit<Aviso, "id" | "creado" | "leido"> & { grave?: boolean };
