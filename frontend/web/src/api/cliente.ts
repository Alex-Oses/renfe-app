// Único punto de acceso a la API. Sin VITE_API_URL se usan datos simulados.
// Cada función corresponde a un endpoint de obsidian/02-contratos-api/endpoints.md.
import type {
  Asiento,
  Billete,
  BusquedaTrenes,
  EmbeddingFacial,
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

// Simula la latencia de red para que los estados de carga se vean igual que con la API real.
const simular = <T>(f: () => T | Promise<T>, ms = 350): Promise<T> =>
  new Promise((ok, ko) => setTimeout(() => (async () => f())().then(ok, ko), ms));

// GET /estaciones?q=
export const buscarEstaciones = (q: string): Promise<Estacion[]> =>
  BASE ? pedir(`/estaciones?q=${encodeURIComponent(q)}`) : simular(() => trenes.buscarEstaciones(q), 0);

// GET /trenes?origen=&destino=&fecha=
export const buscarTrenes = (b: BusquedaTrenes): Promise<Tren[]> =>
  BASE ? pedir(`/trenes?${new URLSearchParams({ ...b })}`) : simular(() => trenes.buscarTrenes(b));

// GET /trenes/:id
export const obtenerTren = (id: string): Promise<Tren> =>
  BASE ? pedir(`/trenes/${encodeURIComponent(id)}`) : simular(() => trenes.obtenerTren(id));

// GET /trenes/:id/asientos
export const obtenerAsientos = (trenId: string): Promise<Asiento[]> =>
  BASE ? pedir(`/trenes/${encodeURIComponent(trenId)}/asientos`) : simular(() => reservas.obtenerAsientos(trenId));

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
  BASE ? pedir("/billetes") : simular(() => reservas.misBilletes());

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

// GET /tiempo-real/trenes  (nuevo: posiciones GTFS-RT; hay que añadirlo al contrato)
export const posicionesTrenes = (): Promise<PosicionTren[]> =>
  BASE ? pedir("/tiempo-real/trenes") : simular(() => tiempoReal.posiciones(), 150);
