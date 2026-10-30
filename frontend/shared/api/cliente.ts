// Único punto de acceso a la API. Sin VITE_API_URL se usan datos simulados.
// Cada función corresponde a un endpoint de obsidian/02-contratos-api/endpoints.md.
import type {
  TipoTren,
  Abono,
  Asiento,
  Billete,
  BilleteApi,
  BusquedaTrenes,
  EmbeddingFacial,
  EnlaceWallet,
  Estacion,
  IntentoPago,
  NuevaReserva,
  OpcionTransbordo,
  NuevoAbono,
  ParadaViaje,
  PosicionTren,
  QrBilleteApi,
  ReservaApi,
  RespuestaChatbot,
  Reserva,
  ResultadoValidacionApi,
  ResultadoValidacion,
  ResumenAdmin,
  Sesion,
  SesionApi,
  Tren,
  TrenApi,
  TrenDetalle,
  TrenDetalleApi,
} from "./tipos";
import {
  aDetalleTren,
  aTren,
  desplazarHora,
  marcarParadas,
  numeroDeServicio,
  partirIdTren,
  sinProducto,
} from "./adaptador-trenes";
import { cuerpoLogin, cuerpoRegistro } from "./adaptador-cuenta";
import { billeteDeApi, claseDeApi, cuerpoReserva, reservaDeApi, reservaDeBilletes, validacionDeApi } from "./adaptador-reservas";
import { cuerpoRegistrarCara, cuerpoVerificarCara, validarEmbedding } from "./cara";
import { recordarEstaciones } from "./estaciones-memoria";
import { parsearEventos } from "./flujo-chatbot";
import * as trenes from "./simulado";
import * as reservas from "./simulado-reservas";
import * as cuenta from "./simulado-cuenta";
import * as tiempoReal from "./simulado-tiempo-real";
import * as revisor from "./simulado-revisor";
import * as admin from "./simulado-admin";
import * as abonos from "./simulado-abonos";
// Solo el tipo: la función de Vercel no puede importar nada, así que la forma vive allí.
import type { PosicionApi } from "../../web/api/posiciones";

// Cada app fija las URLs al arrancar (la web desde VITE_*, la app Expo desde EXPO_PUBLIC_*).
// api: API de Render; posiciones: API solo para el mapa; tiempoReal: función /api/posiciones de Vercel.
// Sin api se usan datos simulados; sin ninguna de las tres, el mapa usa trenes simulados.
export interface ConfigApi {
  api?: string;
  posiciones?: string;
  tiempoReal?: string;
  // respaldo: API a la que se pasa si `api` (el Docker) no responde.
  respaldo?: string;
}
let BASE: string | undefined;
let BASE_POSICIONES: string | undefined;
let URL_TIEMPO_REAL: string | undefined;
let PRINCIPAL: string | undefined;
let RESPALDO: string | undefined;
let posicionesPropias = false;
let enRespaldo = false;
const oyentesRespaldo = new Set<() => void>();
export let usaDatosSimulados = true;
export function configurarApi(c: ConfigApi) {
  BASE = PRINCIPAL = c.api || undefined;
  RESPALDO = c.respaldo || undefined;
  posicionesPropias = !!c.posiciones;
  BASE_POSICIONES = c.posiciones || BASE;
  URL_TIEMPO_REAL = c.tiempoReal || undefined;
  usaDatosSimulados = !BASE;
  enRespaldo = false;
}

export const usaApiRespaldo = () => enRespaldo;
export function alCambiarRespaldo(oyente: () => void) {
  oyentesRespaldo.add(oyente);
  return () => {
    oyentesRespaldo.delete(oyente);
  };
}

// Va al respaldo si la principal cae o pierde la BD, y vuelve sola cuando se recupera.
// shortcut: las sesiones no valen entre las dos APIs (BD y secretos distintos), hay que volver a entrar.
export async function comprobarApi(): Promise<void> {
  if (!PRINCIPAL || !RESPALDO) return;
  let viva = false;
  try {
    const r = await fetchConLimite(`${PRINCIPAL}/health`);
    viva = r.ok && (await r.json()).baseDatos === "ok";
  } catch {
    // Sin conexión con la principal: cuenta como caída.
  }
  if (viva === !enRespaldo) return;
  enRespaldo = !viva;
  BASE = viva ? PRINCIPAL : RESPALDO;
  if (!posicionesPropias) BASE_POSICIONES = BASE;
  oyentesRespaldo.forEach((oyente) => oyente());
}

export function vigilarApi(cadaMs = 30_000) {
  void comprobarApi();
  setInterval(() => void comprobarApi(), cadaMs);
}

let token: string | null = null;
export function usarToken(t: string | null) {
  token = t;
}

export async function enviarMensajeChatbot(mensaje: string, conversationId?: string): Promise<RespuestaChatbot> {
  if (!BASE) return simular(() => respuestaChatbotDemo(mensaje), 250);
  return pedir<RespuestaChatbot>("/chatbot/mensaje", "POST", {
    mensaje,
    ...(conversationId && { conversationId }),
  });
}

/** Progreso del turno: espejo de `PasoChatbot` en la API (chatbot.service.ts). */
export type PasoChatbot =
  | { paso: "analizando" }
  | { paso: "consultando"; herramienta: string }
  | { paso: "razonando" };

// Igual que `enviarMensajeChatbot`, pero por SSE para poder enseñar los pasos mientras trabaja.
// No usa `fetchConLimite`: un turno con dos o tres consultas pasa de los 8 s de `pedir`.
export async function enviarMensajeChatbotFlujo(
  mensaje: string,
  conversationId: string | undefined,
  alPaso: (paso: PasoChatbot) => void,
): Promise<RespuestaChatbot> {
  if (!BASE) {
    alPaso({ paso: "analizando" });
    await simular(() => alPaso({ paso: "consultando", herramienta: "buscar_trenes" }), 350);
    await simular(() => alPaso({ paso: "razonando" }), 350);
    return simular(() => respuestaChatbotDemo(mensaje), 450);
  }

  const r = await fetch(`${BASE}/chatbot/mensaje/flujo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ mensaje, ...(conversationId && { conversationId }) }),
  });
  if (!r.ok || !r.body) throw new Error(await mensajeDeError(r, "/chatbot/mensaje/flujo"));

  const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let respuesta: RespuestaChatbot | undefined;
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    buffer += value;
    const { eventos, resto } = parsearEventos(buffer);
    buffer = resto;
    for (const { evento, datos } of eventos) {
      if (evento === "paso") alPaso(datos as PasoChatbot);
      else if (evento === "fin") respuesta = datos as RespuestaChatbot;
      else if (evento === "error") throw new Error((datos as { mensaje?: string }).mensaje ?? "El asistente no ha podido responder.");
    }
  }
  if (!respuesta) throw new Error("El asistente no ha podido responder.");
  return respuesta;
}

// El contrato devuelve { statusCode, error, message } (formato de Nest): se usa su mensaje si lo hay,
// que es el que entiende el usuario ("la cara ya estaba registrada", "el viaje no circula"…).
async function mensajeDeError(r: Response, ruta: string): Promise<string> {
  try {
    const cuerpo = (await r.json()) as { message?: string | string[] };
    const mensaje = Array.isArray(cuerpo.message) ? cuerpo.message.join(". ") : cuerpo.message;
    if (mensaje) return mensaje;
  } catch {
    // Sin cuerpo JSON: se queda el mensaje genérico.
  }
  return `La API respondió ${r.status} en ${ruta}`;
}

async function pedir<T>(ruta: string, metodo = "GET", cuerpo?: unknown): Promise<T> {
  const r = await fetchConLimite(`${BASE}${ruta}`, {
    method: metodo,
    headers: {
      ...(cuerpo !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  if (!r.ok) throw new Error(await mensajeDeError(r, ruta));
  // POST /auth/cara/registrar responde 204 sin cuerpo.
  if (r.status === 204) return undefined as T;
  const texto = await r.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

// Respuestas de lista del contrato: { datos, total }.
interface Lista<T> {
  datos: T[];
  total?: number;
}
const datos = <T>(ruta: string) => pedir<Lista<T>>(ruta).then((r) => r.datos ?? []);

// El id de tren del contrato es "feed:tripId:fecha"; las rutas de viaje lo piden por partes.
// partirIdTren vive en adaptador-trenes.ts (lo usan también las reservas); se sigue exportando aquí
// porque era la puerta de entrada del cliente.
export { partirIdTren };

// La fecha de servicio es local de Madrid, no UTC.
export const hoyEnMadrid = (ahora = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(ahora);

export function rutaViaje(trenId: string, sufijo = "", fecha = partirIdTren(trenId).fecha): string {
  const { feed, tripId } = partirIdTren(trenId);
  return `/trenes/${feed}/${encodeURIComponent(tripId ?? "")}${sufijo}${fecha ? `?fecha=${fecha}` : ""}`;
}

// GET /posiciones devuelve PosicionApi (contrato); el mapa pinta PosicionTren.
// Origen, destino, próxima parada y horas solo llegan si la API los cruza con el GTFS estático (Rubén);
// si no, van vacíos y el mapa no los muestra.
// El feed AVE/LD no dice el producto; si llega "nombre" (p. ej. "AVE 02070") se saca de ahí.
const PRODUCTOS: [RegExp, TipoTren][] = [
  [/^avlo/i, "Avlo"],
  [/^ave/i, "AVE"],
  [/^alvia/i, "Alvia"],
  [/^(intercity|ic)/i, "Intercity"],
  [/^(md|media distancia|regional)/i, "Media Distancia"],
];
export const tipoDeFeed = (feed: string, nombre?: string | null): TipoTren =>
  feed === "cercanias" ? "Cercanías" : (PRODUCTOS.find(([r]) => r.test(nombre ?? ""))?.[1] ?? "Larga Distancia");

// Renfe publica un mismo vehículo con varios viajes encadenados (tripId distinto, misma posición):
// se deja uno por vehículo para que la lista y el mapa no lo repitan. Se queda el tramo en curso:
// el que tiene próxima parada y, si no, el que llega más tarde (los demás ya terminaron).
const vigencia = (p: PosicionApi) => [p.proximaParada ? 1 : 0, p.llegadaDestino ?? ""] as const;
export const unoPorVehiculo = (lista: PosicionApi[]): PosicionApi[] => {
  const mejor = new Map<string, PosicionApi>();
  for (const p of lista) {
    const clave = `${p.feed}:${p.vehicleId ?? p.tripId}`;
    const actual = mejor.get(clave);
    const [a, b] = [vigencia(p), actual && vigencia(actual)];
    if (!b || a[0] > b[0] || (a[0] === b[0] && a[1] > b[1])) mejor.set(clave, p);
  }
  return [...mejor.values()];
};

const aPosicion = (p: PosicionApi): PosicionTren => {
  const tipo = tipoDeFeed(p.feed, p.nombre);
  return {
    trenId: `${p.feed}:${p.tripId}`,
    tipo,
    // Con "nombre" (p. ej. "AVE 02070") se enseña el número, sin repetir el tipo; si no, el vehículo.
    numero: p.nombre ? sinProducto(p.nombre, tipo) : (p.vehicleId ?? p.tripId),
    linea: p.linea ?? undefined,
    origen: p.origen?.nombre ?? "",
    destino: p.destino?.nombre ?? "",
    lat: p.lat,
    lon: p.lon,
    rumbo: p.rumbo ?? NaN,
    retrasoMin: Math.round((p.retrasoSeg ?? 0) / 60),
    retrasoSeg: p.retrasoSeg,
    progreso: 0,
    proximaParada: p.proximaParada?.nombre ?? "",
    llegadaProxima: p.proximaParada?.llegada ?? undefined,
    llegadaDestino: p.llegadaDestino ?? undefined,
    ruta: [],
    paradas: [],
    actualizado: p.actualizado,
  };
};

// Tiempo real sin API desplegada: en producción (Vercel) lo sirve api/posiciones.ts.
// Con VITE_TIEMPO_REAL=simulado se fuerzan los trenes simulados (plan B de la demo).
export let posicionesReales = false;

async function posicionesVercel(): Promise<PosicionTren[]> {
  const r = await fetch(URL_TIEMPO_REAL!);
  if (!r.ok) throw new Error(`Tiempo real no disponible (${r.status})`);
  const { datos: lista } = (await r.json()) as Lista<PosicionApi>;
  return unoPorVehiculo(lista).map(aPosicion);
}

// Simula la latencia de red para que los estados de carga se vean igual que con la API real.
const simular = <T>(f: () => T | Promise<T>, ms = 350): Promise<T> =>
  new Promise((ok, ko) => setTimeout(() => (async () => f())().then(ok, ko), ms));

const TIEMPO_LIMITE_API_MS = 8_000;

async function fetchConLimite(url: string, init?: RequestInit): Promise<Response> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_API_MS);
  try {
    return await fetch(url, { ...init, signal: controlador.signal });
  } catch (razon) {
    if (razon instanceof DOMException && razon.name === "AbortError") {
      throw new Error("La API está tardando demasiado en responder. Inténtalo de nuevo.");
    }
    throw razon;
  } finally {
    clearTimeout(temporizador);
  }
}

function respuestaChatbotDemo(mensaje: string): RespuestaChatbot {
  const pregunta = mensaje.toLocaleLowerCase("es");
  const saludo = /^(hola|buenas|buenos días|buenas tardes|buenas noches|hey)\b/.test(pregunta);
  const despedida = /\b(adiós|adios|hasta luego|nos vemos)\b/.test(pregunta);
  const agradecimiento = /\b(gracias|muchas gracias|te lo agradezco)\b/.test(pregunta);
  const trayecto = pregunta.match(/\bde\s+(.+?)\s+a\s+(.+?)(?:[?.!,]|$)/);
  let respuesta = "Puedo ayudarte a buscar trenes, estaciones y horarios. ¿Qué necesitas?";

  if (saludo) {
    respuesta = "¡Hola! ¿En qué puedo ayudarte? Puedo buscarte trenes, estaciones u horarios.";
  } else if (agradecimiento) {
    respuesta = "¡De nada! Cuando quieras, seguimos con tu viaje.";
  } else if (despedida) {
    respuesta = "¡Hasta luego! Que tengas un buen viaje.";
  } else if (/\b(cómo estás|como estas|qué tal|que tal)\b/.test(pregunta)) {
    respuesta = "¡Muy bien, gracias! Preparado para ayudarte con tu viaje.";
  } else if (trayecto) {
    const origen = trenes.buscarEstaciones(trayecto[1])[0];
    const destino = trenes.buscarEstaciones(trayecto[2])[0];
    if (origen && destino) {
      const lista = trenes.buscarTrenes({ origen: origen.id, destino: destino.id, fecha: hoyEnMadrid() }).slice(0, 3);
      const horas = lista.map((tren) => {
        const salida = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(tren.salida));
        const llegada = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(tren.llegada));
        return `${tren.tipo} ${tren.numero}: sale a las ${salida} y llega a las ${llegada}`;
      });
      respuesta = horas.length
        ? `Para ir de ${origen.nombre} a ${destino.nombre} hoy he encontrado:\n${horas.join("\n")}`
        : `Ahora mismo no hay trenes simulados de ${origen.nombre} a ${destino.nombre}.`;
    } else {
      respuesta = `No encuentro una estación simulada para ${trayecto[1]} o ${trayecto[2]}. Puedes probar con Madrid, Tarragona, Barcelona, Valencia o Sevilla.`;
    }
  } else if (pregunta.includes("estación") || pregunta.includes("estacion")) {
    respuesta = "Claro. Puedes preguntarme por una estación concreta o pedirme un trayecto entre dos estaciones.";
  } else if (pregunta.includes("tren") || pregunta.includes("horario")) {
    respuesta = "Claro. Dime el origen y el destino, por ejemplo: «¿Qué trenes hay de Madrid a Barcelona?»";
  }
  return { respuesta, conversationId: "demo", herramientas: [] };
}

// GET /estaciones?q=&feed=
export async function buscarEstaciones(q: string, feed?: "cercanias" | "avld"): Promise<Estacion[]> {
  // El contrato exige `q` de 1 a 60 caracteres: con el campo vacío no se pregunta (sería un 400).
  if (BASE && !q.trim()) return [];
  const ruta = `/estaciones?${new URLSearchParams({ q, ...(feed && { feed }) })}`;
  const lista = BASE ? await datos<Estacion>(ruta) : await simular(() => trenes.buscarEstaciones(q), 0);
  // La memoria es la que permite volver del resultado al buscador con el nombre de la estación.
  recordarEstaciones(lista);
  return lista;
}

// GET /trenes?origen=&destino=&fecha=
export async function buscarTrenes(b: BusquedaTrenes): Promise<Tren[]> {
  if (!BASE) return simular(() => trenes.buscarTrenes(b));
  return (await datos<TrenApi>(`/trenes?${new URLSearchParams({ ...b })}`)).map(aTren);
}

// GET /trenes/transbordos: sin API no hay opciones (el simulado solo tiene viajes directos).
export async function buscarTransbordos(b: BusquedaTrenes): Promise<OpcionTransbordo[]> {
  if (!BASE) return [];
  const opciones = await datos<Omit<OpcionTransbordo, "tramos"> & { tramos: [TrenApi, TrenApi] }>(
    `/trenes/transbordos?${new URLSearchParams({ ...b })}`,
  );
  return opciones.map((o) => ({ ...o, tramos: [aTren(o.tramos[0]), aTren(o.tramos[1])] }));
}

// GET /trenes/:feed/:tripId?fecha=  (detalle: paradas, horas y retraso por parada)
export async function obtenerTren(id: string, fecha?: string): Promise<TrenDetalle> {
  if (!BASE) return { ...(await simular(() => trenes.obtenerTren(id))), paradas: [] };
  const detalle = await pedir<TrenDetalleApi>(rutaViaje(id, "", fecha));
  return aDetalleTren(detalle);
}

// GET /trenes/:feed/:tripId/asientos?fecha=&origen=&destino=  (ocupación real del viaje)
export async function obtenerAsientos(tren: Tren): Promise<Asiento[]> {
  if (!BASE) return simular(() => reservas.obtenerAsientos(tren.id));
  const filtro = new URLSearchParams({ origen: tren.origen.id, destino: tren.destino.id });
  const lista = await datos<Omit<Asiento, "clase"> & { clase: string }>(`${rutaViaje(tren.id, "/asientos")}&${filtro}`);
  return lista.map((a) => ({ ...a, clase: claseDeApi(a.clase) }));
}

// POST /reservas
// Crea la reserva ya pagada (el pago es simulado) con las butacas elegidas; sin ellas (transbordo) las asigna la API.
export async function crearReserva(tren: Tren, r: NuevaReserva): Promise<Reserva> {
  if (!BASE) return simular(() => reservas.crearReserva(r), 600);
  const creada = await pedir<ReservaApi>("/reservas", "POST", cuerpoReserva(tren, r));
  return reservaDeApi(creada, tren, r);
}

// POST /pagos/intent
export const crearIntentoPago = (reservaId: string): Promise<IntentoPago> =>
  BASE ? pedir("/pagos/intent", "POST", { reservaId }) : simular(() => reservas.crearIntentoPago(reservaId));

// Simulado: en la API real la reserva ya nace pagada (el pago de Stripe está pendiente).
export const confirmarPagoSimulado = (reservaId: string): Promise<Reserva> =>
  BASE
    ? Promise.reject(new Error("Con la API real el pago lo confirma Stripe: falta conectar Stripe Elements."))
    : simular(() => reservas.confirmarPago(reservaId), 1200);

// GET /billetes
export const misBilletes = async (): Promise<Billete[]> =>
  BASE
    ? (await datos<BilleteApi>("/billetes")).filter((b) => b.estado !== "anulado").map(billeteDeApi)
    : simular(() => reservas.misBilletes());

// Admite el localizador con o sin el prefijo "R-" de la API. Solo encuentra reservas propias: hace falta sesión.
export async function buscarReservaPorLocalizador(localizador: string): Promise<Reserva | undefined> {
  const limpio = localizador.trim().toUpperCase();
  const buscado = limpio.startsWith("R-") ? limpio : `R-${limpio}`;
  const billetes = (await datos<BilleteApi>("/billetes")).filter((b) => b.localizador === buscado);
  return billetes.length ? reservaDeBilletes(billetes) : undefined;
}

// POST /reservas/:localizador/cancelar
export const cancelarReserva = (localizador: string): Promise<{ penalizacion: number; reembolso: number }> =>
  pedir(`/reservas/${encodeURIComponent(localizador)}/cancelar`, "POST");

// GET /billetes/:id/qr  (la API devuelve `{ id, qr }`: el billete se completa con GET /billetes)
export async function obtenerBillete(id: string): Promise<Billete> {
  if (!BASE) return simular(() => reservas.obtenerBillete(id));
  const { qr } = await pedir<QrBilleteApi>(`/billetes/${encodeURIComponent(id)}/qr`);
  const todos = await datos<BilleteApi>("/billetes");
  const encontrado = todos.find((b) => b.id === id);
  if (!encontrado) throw new Error("No encontramos ese billete.");
  return billeteDeApi({ ...encontrado, qr });
}

// POST /auth/registro
export const registrarse = (datos: { nombre: string; email: string; contrasena: string }): Promise<Sesion> =>
  BASE ? pedir<SesionApi>("/auth/registro", "POST", cuerpoRegistro(datos)) : simular(() => cuenta.registrarse(datos), 700);

// POST /auth/login
export const iniciarSesion = (datos: { email: string; contrasena: string }): Promise<Sesion> =>
  BASE ? pedir<SesionApi>("/auth/login", "POST", cuerpoLogin(datos)) : simular(() => cuenta.iniciarSesion(datos), 700);

// POST /auth/cara/registrar  (204 sin cuerpo; una sola vez por usuario)
export async function registrarCara(embedding: EmbeddingFacial): Promise<{ ok: true }> {
  if (!BASE) return simular(() => cuenta.registrarCara(embedding), 700);
  validarEmbedding(embedding);
  await pedir<void>("/auth/cara/registrar", "POST", cuerpoRegistrarCara(embedding));
  return { ok: true };
}

// POST /auth/cara/verificar  (devuelve { token, usuario }, como /auth/login)
export async function verificarCara(datos: { email: string; embedding: EmbeddingFacial }): Promise<Sesion> {
  if (!BASE) return simular(() => cuenta.verificarCara(datos), 900);
  validarEmbedding(datos.embedding);
  return pedir<Sesion>("/auth/cara/verificar", "POST", cuerpoVerificarCara(datos.email, datos.embedding));
}

// GET /posiciones (alternativa a Supabase Realtime, ver contrato)
// Orden: API (VITE_POSICIONES_URL o VITE_API_URL); si no, la función de Vercel con datos reales de Renfe;
// si falla (o en local con `pnpm dev`), trenes simulados para que el mapa nunca se quede vacío.
// VITE_POSICIONES_URL: API desplegada solo para el mapa (p. ej. Render sin base de datos todavía).

export async function posicionesTrenes(): Promise<PosicionTren[]> {
  if (BASE_POSICIONES) {
    const r = await fetchConLimite(`${BASE_POSICIONES}/posiciones`);
    if (!r.ok) throw new Error(await mensajeDeError(r, "/posiciones"));
    posicionesReales = true;
    return unoPorVehiculo(((await r.json()) as Lista<PosicionApi>).datos).map(aPosicion);
  }
  if (URL_TIEMPO_REAL) {
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

// GET /trenes/:feed/:tripId/posicion: la última posición del viaje que circula ahora.
// Es la alternativa a /posiciones para un enlace directo a /mapa?tren=avld:XXX, cuando el viaje
// ya no aparece en el snapshot (o cuando el mapa solo tiene la API, sin VITE_POSICIONES_URL).
export async function posicionDeTren(id: string): Promise<PosicionTren | null> {
  if (!BASE) return null;
  const { feed, tripId } = partirIdTren(id);
  if (!feed || !tripId) return null;
  const ruta = `/trenes/${feed}/${encodeURIComponent(tripId)}/posicion`;
  const r = await fetch(`${BASE}${ruta}`, { headers: { ...(token && { Authorization: `Bearer ${token}` }) } });
  if (r.status === 404) return null; // no está circulando ahora
  if (!r.ok) throw new Error(await mensajeDeError(r, ruta));
  return aPosicion((await r.json()) as PosicionApi);
}

// El detalle de un viaje solo da id y nombre de cada parada; las coordenadas están en /estaciones.
// Se guardan por id para no repetir la búsqueda al volver a elegir el mismo tren.
const coordenadas = new Map<string, { lat: number; lon: number }>();
const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

async function coordenadasDe(p: ParadaViaje): Promise<{ lat: number; lon: number } | null> {
  const guardada = coordenadas.get(p.estacionId);
  if (guardada) return guardada;
  const lista = await buscarEstaciones(p.nombre).catch(() => [] as Estacion[]);
  const encontrada =
    lista.find((e) => e.id === p.estacionId) ?? lista.find((e) => sinTildes(e.nombre) === sinTildes(p.nombre));
  if (!encontrada) return null;
  const c = { lat: encontrada.lat, lon: encontrada.lon };
  coordenadas.set(p.estacionId, c);
  return c;
}

// Rellena recorrido, paradas y horas de un tren con el GTFS estático (GET /trenes/:feed/:tripId).
// El snapshot de /posiciones solo trae lat/lon y retraso: sin esto el mapa no puede dibujar la ruta.
// Las horas del estático van sin retraso; se les suma el de GTFS-RT, como manda el contrato.
export async function completarRuta(p: PosicionTren): Promise<PosicionTren> {
  if (!BASE || (p.ruta.length > 0 && p.paradas.length > 0)) return p;
  const { fecha } = partirIdTren(p.trenId);
  const detalle = await obtenerTren(p.trenId, fecha ?? hoyEnMadrid());
  const conCoordenadas = await Promise.all(
    detalle.paradas.map(async (parada) => {
      const c = await coordenadasDe(parada);
      return c ? { ...parada, lat: c.lat, lon: c.lon } : parada;
    }),
  );
  const retraso = p.retrasoSeg ?? detalle.retrasoSeg ?? null;
  const paradas = conCoordenadas.map((parada) => ({
    ...parada,
    llega: desplazarHora(parada.llega, retraso),
    sale: desplazarHora(parada.sale, retraso),
  }));
  const dibujables = marcarParadas(paradas);
  if (!dibujables.length) return p;
  const proxima = dibujables.find((x) => !x.pasada);
  const salida = desplazarHora(detalle.salida, retraso) ?? detalle.salida;
  const llegada = desplazarHora(detalle.llegada, retraso) ?? detalle.llegada;
  return {
    ...p,
    tipo: detalle.tipo,
    numero: detalle.numero || numeroDeServicio(null, detalle.linea) || p.numero,
    linea: detalle.linea || p.linea,
    origen: detalle.origen.nombre,
    destino: detalle.destino.nombre,
    salida,
    llegada,
    llegadaDestino: llegada,
    proximaParada: proxima?.nombre ?? "",
    llegadaProxima: proxima?.llegada,
    progreso: dibujables.filter((x) => x.pasada).length / dibujables.length,
    // El trazado real (vías u shapes) si la API lo da; si no, parada a parada en línea recta.
    ruta: detalle.recorrido?.length ? detalle.recorrido : dibujables.map((x): [number, number] => [x.lat, x.lon]),
    paradas: dibujables,
  };
}

// GET /billetes/:id/wallet?plataforma=apple|google  (nuevo: lo firma la API; hay que añadirlo al contrato)
export const enlaceWallet = (billeteId: string, plataforma: EnlaceWallet["plataforma"]): Promise<EnlaceWallet> =>
  BASE
    ? pedir(`/billetes/${encodeURIComponent(billeteId)}/wallet?plataforma=${plataforma}`)
    : simular(() => reservas.enlaceWallet(billeteId, plataforma));

// POST /billetes/validar  (rol revisor). Sin API se comprueba la firma del QR en el navegador.
export const validarBillete = async (qr: string): Promise<ResultadoValidacion> =>
  BASE
    ? validacionDeApi(await pedir<ResultadoValidacionApi>("/billetes/validar", "POST", { qr }))
    : simular(() => revisor.validarBillete(qr), 300);

// GET /admin/resumen  (rol admin; propuesto en endpoints.md, pendiente de la API).
export const resumenAdmin = (): Promise<ResumenAdmin> =>
  BASE ? pedir("/admin/resumen") : simular(() => admin.resumen());

// GET /abonos  (propuesto por la web en endpoints.md)
export const misAbonos = (): Promise<Abono[]> => (BASE ? datos<Abono>("/abonos") : simular(() => abonos.misAbonos()));

// POST /abonos. Sin API se da por pagado al momento (con API se paga como una reserva).
export const comprarAbono = (n: NuevoAbono): Promise<Abono> =>
  BASE ? pedir("/abonos", "POST", n) : simular(() => abonos.comprarAbono(n), 1200);

// GET /abonos/:id  (con el QR firmado)
export const obtenerAbono = (id: string): Promise<Abono> =>
  BASE ? pedir(`/abonos/${encodeURIComponent(id)}`) : simular(() => abonos.obtenerAbono(id));
