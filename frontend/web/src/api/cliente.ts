// Único punto de acceso a la API. Sin VITE_API_URL se usan datos simulados.
// Cada función corresponde a un endpoint de obsidian/02-contratos-api/endpoints.md.
import type {
  Asiento,
  Billete,
  BusquedaTrenes,
  EmbeddingFacial,
  EnlaceWallet,
  Estacion,
  IntentoPago,
  NuevaReserva,
  PosicionTren,
  Reserva,
  Sesion,
  Tren,
} from "./tipos";
import * as trenes from "./simulado";
import * as reservas from "./simulado-reservas";
import * as cuenta from "./simulado-cuenta";
import * as tiempoReal from "./simulado-tiempo-real";
import type { PosicionApi } from "./gtfs-rt";

const BASE = import.meta.env.VITE_API_URL as string | undefined;
export const usaDatosSimulados = !BASE;

let token: string | null = null;
export function usarToken(t: string | null) {
  token = t;
}

async function pedir<T>(ruta: string, metodo = "GET", cuerpo?: unknown): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: {
      ...(cuerpo !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  if (!r.ok) throw new Error(`La API respondió ${r.status} en ${ruta}`);
  return r.json() as Promise<T>;
}

// Respuestas de lista del contrato: { datos, total }.
interface Lista<T> {
  datos: T[];
  total?: number;
}
const datos = <T>(ruta: string) => pedir<Lista<T>>(ruta).then((r) => r.datos);

// El id de tren del contrato es "feed:tripId:fecha"; las rutas de viaje lo piden por partes.
export function rutaViaje(trenId: string, sufijo = ""): string {
  const [feed, tripId, fecha] = trenId.split(":");
  return `/trenes/${feed}/${encodeURIComponent(tripId)}${sufijo}?fecha=${fecha}`;
}

// GET /posiciones devuelve PosicionApi (contrato); el mapa pinta PosicionTren.
// Renfe no da origen, destino ni paradas en tiempo real: esos campos van vacíos y el mapa no los muestra.
const aPosicion = (p: PosicionApi): PosicionTren => ({
  trenId: `${p.feed}:${p.tripId}`,
  tipo: p.feed === "cercanias" ? "Cercanías" : "Larga Distancia",
  numero: p.vehicleId ?? p.tripId,
  origen: "",
  destino: "",
  lat: p.lat,
  lon: p.lon,
  rumbo: p.rumbo ?? 0,
  velocidad: p.velocidadKmh ?? 0,
  retrasoMin: Math.round((p.retrasoSeg ?? 0) / 60),
  progreso: 0,
  proximaParada: "",
  ruta: [],
  paradas: [],
  actualizado: p.actualizado,
});

// Tiempo real sin API desplegada: en producción (Vercel) lo sirve api/posiciones.ts.
// Con VITE_TIEMPO_REAL=simulado se fuerzan los trenes simulados (plan B de la demo).
const TIEMPO_REAL_VERCEL = import.meta.env.PROD && import.meta.env.VITE_TIEMPO_REAL !== "simulado";
export let posicionesReales = false;

async function posicionesVercel(): Promise<PosicionTren[]> {
  const r = await fetch("/api/posiciones");
  if (!r.ok) throw new Error(`Tiempo real no disponible (${r.status})`);
  const { datos: lista } = (await r.json()) as Lista<PosicionApi>;
  return lista.map(aPosicion);
}

// Simula la latencia de red para que los estados de carga se vean igual que con la API real.
const simular = <T>(f: () => T | Promise<T>, ms = 350): Promise<T> =>
  new Promise((ok, ko) => setTimeout(() => (async () => f())().then(ok, ko), ms));

// GET /estaciones?q=
export const buscarEstaciones = (q: string): Promise<Estacion[]> =>
  BASE ? datos<Estacion>(`/estaciones?q=${encodeURIComponent(q)}`) : simular(() => trenes.buscarEstaciones(q), 0);

// GET /trenes?origen=&destino=&fecha=
export const buscarTrenes = (b: BusquedaTrenes): Promise<Tren[]> =>
  BASE ? datos<Tren>(`/trenes?${new URLSearchParams({ ...b })}`) : simular(() => trenes.buscarTrenes(b));

// GET /trenes/:feed/:tripId?fecha=
export const obtenerTren = (id: string): Promise<Tren> =>
  BASE ? pedir(rutaViaje(id)) : simular(() => trenes.obtenerTren(id));

// GET /trenes/:feed/:tripId/asientos?fecha=
export const obtenerAsientos = (trenId: string): Promise<Asiento[]> =>
  BASE ? datos<Asiento>(rutaViaje(trenId, "/asientos")) : simular(() => reservas.obtenerAsientos(trenId));

// POST /reservas
export const crearReserva = (r: NuevaReserva): Promise<Reserva> =>
  BASE ? pedir("/reservas", "POST", r) : simular(() => reservas.crearReserva(r), 600);

// POST /pagos/intent
export const crearIntentoPago = (reservaId: string): Promise<IntentoPago> =>
  BASE ? pedir("/pagos/intent", "POST", { reservaId }) : simular(() => reservas.crearIntentoPago(reservaId));

// Simulado: en la API real lo confirma el webhook de Stripe (POST /pagos/webhook).
export const confirmarPagoSimulado = (reservaId: string): Promise<Reserva> =>
  BASE
    ? Promise.reject(new Error("Con la API real el pago lo confirma Stripe: falta conectar Stripe Elements."))
    : simular(() => reservas.confirmarPago(reservaId), 1200);

// GET /billetes
export const misBilletes = (): Promise<Billete[]> =>
  BASE ? datos<Billete>("/billetes") : simular(() => reservas.misBilletes());

// GET /billetes/:id/qr  (devuelve el billete con su QR firmado)
export const obtenerBillete = (id: string): Promise<Billete> =>
  BASE ? pedir(`/billetes/${encodeURIComponent(id)}/qr`) : simular(() => reservas.obtenerBillete(id));

// POST /auth/registro
export const registrarse = (datos: { nombre: string; email: string; contrasena: string }): Promise<Sesion> =>
  BASE ? pedir("/auth/registro", "POST", datos) : simular(() => cuenta.registrarse(datos), 700);

// POST /auth/login
export const iniciarSesion = (datos: { email: string; contrasena: string }): Promise<Sesion> =>
  BASE ? pedir("/auth/login", "POST", datos) : simular(() => cuenta.iniciarSesion(datos), 700);

// POST /auth/cara/registrar
export const registrarCara = (embedding: EmbeddingFacial): Promise<{ ok: true }> =>
  BASE ? pedir("/auth/cara/registrar", "POST", { embedding }) : simular(() => cuenta.registrarCara(embedding), 700);

// POST /auth/cara/verificar
export const verificarCara = (datos: { email: string; embedding: EmbeddingFacial }): Promise<Sesion> =>
  BASE ? pedir("/auth/cara/verificar", "POST", datos) : simular(() => cuenta.verificarCara(datos), 900);

// GET /posiciones (alternativa a Supabase Realtime, ver contrato)
// Orden: API (VITE_POSICIONES_URL o VITE_API_URL); si no, la función de Vercel con datos reales de Renfe;
// si falla (o en local con `pnpm dev`), trenes simulados para que el mapa nunca se quede vacío.
// VITE_POSICIONES_URL: API desplegada solo para el mapa (p. ej. Render sin base de datos todavía).
const BASE_POSICIONES = (import.meta.env.VITE_POSICIONES_URL as string | undefined) || BASE;

export async function posicionesTrenes(): Promise<PosicionTren[]> {
  if (BASE_POSICIONES) {
    const r = await fetch(`${BASE_POSICIONES}/posiciones`);
    if (!r.ok) throw new Error(`La API respondió ${r.status} en /posiciones`);
    posicionesReales = true;
    return ((await r.json()) as Lista<PosicionApi>).datos.map(aPosicion);
  }
  if (TIEMPO_REAL_VERCEL) {
    try {
      const reales = await posicionesVercel();
      posicionesReales = true;
      return reales;
    } catch {
      posicionesReales = false;
    }
  }
  return simular(() => tiempoReal.posiciones(), 150);
}

// GET /billetes/:id/wallet?plataforma=apple|google  (nuevo: lo firma la API; hay que añadirlo al contrato)
export const enlaceWallet = (billeteId: string, plataforma: EnlaceWallet["plataforma"]): Promise<EnlaceWallet> =>
  BASE
    ? pedir(`/billetes/${encodeURIComponent(billeteId)}/wallet?plataforma=${plataforma}`)
    : simular(() => reservas.enlaceWallet(billeteId, plataforma));
