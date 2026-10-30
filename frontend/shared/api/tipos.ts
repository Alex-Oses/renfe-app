// Tipos de la API. Deben coincidir con obsidian/02-contratos-api/endpoints.md.

export interface Estacion {
  id: string;
  nombre: string;
  ciudad: string;
  lat: number;
  lon: number;
  // Las estaciones van unificadas entre feeds; `feeds` dice en cuáles está (contrato de /estaciones).
  feeds?: Feed[];
}

export type Feed = "cercanias" | "avld";

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
  feed?: Feed;
  tripId?: string;
  fecha?: string; // AAAA-MM-DD
  linea?: string; // "AVE 02070" o "C-4" (contrato); en simulado, undefined
  numParadas?: number;
  duracionMin?: number;
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

// --- Formas del contrato antes de adaptarlas a la UI (obsidian/02-contratos-api/endpoints.md) ---

// GET /trenes: `tipo` es rutas.tipo_servicio en mayúsculas ("AVE", "ALVIA"…) y `numero` puede ser null.
export interface TrenApi {
  id: string; // "feed:tripId:fecha"
  feed: Feed;
  tripId: string;
  fecha: string;
  linea: string;
  tipo: string;
  numero: string | null;
  origen: EstacionTren;
  destino: EstacionTren;
  salida: string;
  llegada: string;
  duracionMin: number;
  numParadas: number;
  retrasoSeg: number | null;
  precioDesde: number;
  plazasLibres: number;
}

export interface ParadaApi {
  seq: number;
  estacion: EstacionTren;
  llega: string | null; // null en la primera parada
  sale: string | null; // null en la última
  retrasoSeg: number | null;
}

// GET /trenes/:feed/:tripId?fecha=
export interface TrenDetalleApi {
  feed: Feed;
  tripId: string;
  fecha: string;
  linea: string;
  tipo: string;
  numero: string | null;
  origen: EstacionTren;
  destino: EstacionTren;
  salida: string;
  llegada: string;
  retrasoSeg: number | null;
  paradas: ParadaApi[];
  recorrido?: [number, number][] | null; // trazado real [lat, lon] (shapes o vías de OSM)
}

// Parada ya adaptada. El detalle solo da id y nombre de la estación: las coordenadas se piden a
// /estaciones, así que pueden faltar y entonces la parada no se puede pintar en el mapa.
export interface ParadaViaje {
  seq: number;
  estacionId: string;
  nombre: string;
  llega: string | null;
  sale: string | null;
  retrasoSeg: number | null;
  lat?: number;
  lon?: number;
}

export type TrenDetalle = Tren & { paradas: ParadaViaje[]; recorrido?: [number, number][] | null };

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
  // Solo lo devuelve /auth/login y /auth/registro (token de Supabase Auth). El facial no lo tiene.
  refreshToken?: string | null;
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
  rumbo: number; // grados, 0 = norte; NaN si la fuente no lo da (el mapa lo calcula al moverse)
  retrasoMin: number;
  // Retraso de GTFS-RT tal cual: puede ser negativo (tren adelantado) y null si no hay dato.
  // `retrasoMin` se queda para la vista del billete; el mapa usa este.
  retrasoSeg: number | null;
  progreso: number; // 0..1 del trayecto
  proximaParada: string; // "" si no se conoce
  llegadaProxima?: string; // ISO, hora prevista en la próxima parada (con retraso)
  llegadaDestino?: string; // ISO, hora prevista en el destino (con retraso)
  salida?: string; // ISO, hora de salida del viaje, si se conoce el GTFS estático
  llegada?: string; // ISO, hora de llegada al destino, si se conoce el GTFS estático
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
  | "agotado" // bono auténtico y vigente, pero sin viajes
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

// Lo que ve el revisor de un abono o bono escaneado (QR "RNA1").
export interface AbonoValidado {
  id: string;
  nombre: string; // "Bono 10 viajes"…
  titular: string; // enmascarado: "Lucía P."
  origen: string | null; // null = todo el núcleo (Cercanías)
  destino: string | null;
  inicio: string; // AAAA-MM-DD
  fin: string; // último día válido, inclusive
  viajesRestantes: number | null; // tras descontar esta lectura; null = sin límite
}

export interface ResultadoValidacion {
  estado: EstadoValidacion;
  billete?: BilleteValidado; // no hay si es falso o si es un abono
  abono?: AbonoValidado;
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

// --- Abonos y bonos (propuesto por la web en endpoints.md) ---

export type TipoAbono = "ave-ld-mensual" | "avant-mensual" | "cercanias-recurrente" | "bono-10";

export interface NuevoAbono {
  tipo: TipoAbono;
  origenId?: string;
  destinoId?: string;
  inicio: string; // AAAA-MM-DD
}

export interface Abono {
  id: string;
  usuarioId?: string;
  tipo: TipoAbono;
  nombre: string;
  origen: Pick<Estacion, "id" | "nombre"> | null;
  destino: Pick<Estacion, "id" | "nombre"> | null;
  inicio: string; // AAAA-MM-DD
  fin: string; // último día válido, inclusive
  viajesTotales: number | null; // null = sin límite
  viajesRestantes: number | null;
  precio: number;
  creado: string;
  qr: string;
}

// --- Formas del contrato de cuenta, reservas y billetes (API real) ---

// POST /auth/registro y /auth/login: mismo shape, más el refreshToken de Supabase Auth.
// El facial (/auth/cara/verificar) no devuelve refreshToken: dura 12 h y se vuelve a mirar.
export interface SesionApi extends Sesion {
  refreshToken: string | null;
}

export interface RespuestaChatbot {
  respuesta: string;
  conversationId: string;
  herramientas: string[];
  // Trenes encontrados en el turno (los de `buscar_trenes`): la web los pinta como resultados.
  trenes?: TrenApi[];
}

// POST /reservas: la API elige la butaca, así que el frontend no manda los asientos elegidos.
export interface PasajeroApi {
  nombre: string; // nombre completo ("Lucía Pérez Gómez")
  documento: string; // se guarda entero; el QR solo lleva los 4 últimos
}

export interface NuevaReservaApi {
  feed: Feed;
  viajeId: string; // trip_id de GTFS
  fecha: string; // AAAA-MM-DD
  origenId: string;
  destinoId: string;
  pasajeros: PasajeroApi[]; // de 1 a 6: una butaca por pasajero
}

export interface BilleteEmitidoApi {
  id: string;
  qr: string;
  coche: number;
  asiento: string; // "12A"
  clase: string; // "Turista" | "Confort"
  precio: number;
}

// POST /reservas: nace pagada (el pago es simulado) y con un billete por pasajero.
export interface ReservaApi {
  id: string;
  localizador: string;
  estado: "pagada";
  total: number;
  creada: string; // ISO con offset
  billetes: BilleteEmitidoApi[];
}

// GET /billetes: lo justo para pintar el billete; el viajero y el documento salen del QR firmado.
export interface BilleteApi {
  id: string;
  localizador: string;
  feed?: string; // viaje del billete (para cruzarlo con /posiciones)
  viajeId?: string;
  estado: string; // valido | usado | anulado | caducado
  tipo: string; // AVE, ALVIA… en mayúsculas
  numero: string | null;
  salida: string; // ISO con offset
  llegada: string;
  origen: Pick<Estacion, "id" | "nombre">;
  destino: Pick<Estacion, "id" | "nombre">;
  coche: number;
  asiento: string; // "12A"
  clase: string; // "Turista" | "Confort"
  precio: number;
  emitido: string;
  expira: string;
  qr: string; // RNF1.…
}

// GET /billetes/:id/qr (idempotente: devuelve el token ya guardado).
export interface QrBilleteApi {
  id: string;
  qr: string;
}

// POST /billetes/validar: `primeraValidacion` viene como null, no como undefined.
export interface ResultadoValidacionApi extends Omit<ResultadoValidacion, "primeraValidacion"> {
  primeraValidacion: string | null;
}
