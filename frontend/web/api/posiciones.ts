// Función de Vercel: GET /api/posiciones con los trenes de Renfe en tiempo real.
// Renfe no permite leer el GTFS-RT desde el navegador (sin CORS), así que se lee aquí.
// Devuelve la forma de GET /posiciones del contrato, con la misma lógica que
// backend/api/src/modules/posiciones/posiciones.service.ts. Cuando la API de Render esté
// desplegada, la web usará la suya con VITE_API_URL y esta función dejará de usarse.
//
// Sin imports a otros ficheros del proyecto: el paquete es ESM y Node, en Vercel, no resuelve
// imports relativos sin extensión. src/api/gtfs-rt.ts reexporta lo de aquí para los tests.

export type Feed = "avld" | "cercanias";

export const URLS_GTFS_RT: Record<Feed, string> = {
  avld: "https://gtfsrt.renfe.com/vehicle_positions_LD.json",
  cercanias: "https://gtfsrt.renfe.com/vehicle_positions.json",
};

// Forma de cada elemento de GET /posiciones (obsidian/02-contratos-api/endpoints.md).
export interface PosicionApi {
  feed: Feed;
  vehicleId: string | null;
  tripId: string;
  lat: number;
  lon: number;
  rumbo: number | null;
  velocidadKmh: number | null;
  estado: string | null;
  retrasoSeg: number | null;
  actualizado: string;
}

interface FeedRtJson {
  header?: { timestamp?: string | number };
  entity?: {
    vehicle?: {
      trip?: { tripId?: string };
      position?: { latitude?: number; longitude?: number; bearing?: number; speed?: number };
      currentStatus?: string;
      vehicle?: { id?: string };
      timestamp?: string | number;
    };
  }[];
}

const aIso = (segundos: string | number | undefined) =>
  new Date((Number(segundos) || Date.now() / 1000) * 1000).toISOString();

export function convertirFeed(json: FeedRtJson, feed: Feed): PosicionApi[] {
  const cabecera = aIso(json.header?.timestamp);
  const salida: PosicionApi[] = [];
  for (const e of json.entity ?? []) {
    const v = e.vehicle;
    const lat = v?.position?.latitude;
    const lon = v?.position?.longitude;
    const tripId = v?.trip?.tripId;
    // Sin posición o sin viaje no se puede pintar: se descarta.
    if (typeof lat !== "number" || typeof lon !== "number" || !tripId) continue;
    const ms = v?.position?.speed;
    salida.push({
      feed,
      vehicleId: v?.vehicle?.id ?? null,
      tripId,
      lat,
      lon,
      rumbo: v?.position?.bearing ?? null,
      velocidadKmh: typeof ms === "number" ? Math.round(ms * 3.6) : null, // GTFS-RT da m/s
      estado: v?.currentStatus ?? null,
      retrasoSeg: null, // el retraso va en otro feed (trip_updates); no está en posiciones
      actualizado: v?.timestamp ? aIso(v.timestamp) : cabecera,
    });
  }
  return salida;
}

const ESPERA_MS = 8000;

async function leer(feed: Feed) {
  const r = await fetch(URLS_GTFS_RT[feed], {
    signal: AbortSignal.timeout(ESPERA_MS),
    headers: { Accept: "application/json", "User-Agent": "renfe-app (proyecto academico)" },
  });
  if (!r.ok) throw new Error(`Renfe respondió ${r.status} en ${feed}`);
  return convertirFeed(await r.json(), feed);
}

// Respuesta mínima de Node que Vercel pasa al handler (sin depender de @vercel/node).
interface RespuestaNode {
  statusCode: number;
  setHeader(nombre: string, valor: string): void;
  end(cuerpo: string): void;
}

// Lógica separada del transporte: devuelve estado y cuerpo; la usan el handler y los tests.
export async function obtenerPosiciones(): Promise<{ estado: number; cuerpo: unknown }> {
  const feeds = await Promise.allSettled([leer("avld"), leer("cercanias")]);
  const datos = feeds.flatMap((f) => (f.status === "fulfilled" ? f.value : []));
  const fallos = feeds.flatMap((f) => (f.status === "rejected" ? [String(f.reason?.message ?? f.reason)] : []));
  if (fallos.length === feeds.length) {
    // El motivo va en la respuesta para poder diagnosticarlo abriendo /api/posiciones en el navegador.
    return { estado: 503, cuerpo: { error: "No se pudo leer el tiempo real de Renfe", motivos: fallos } };
  }
  return { estado: 200, cuerpo: { datos, actualizado: new Date().toISOString(), ...(fallos.length && { avisos: fallos }) } };
}

// Handler clásico (req, res): es la forma que Vercel admite en cualquier proyecto, no solo en Next.
export default async function handler(_req: unknown, res: RespuestaNode): Promise<void> {
  let estado = 500;
  let cuerpo: unknown;
  try {
    ({ estado, cuerpo } = await obtenerPosiciones());
  } catch (e) {
    cuerpo = { error: "Fallo inesperado en /api/posiciones", motivos: [String(e)] };
  }
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Renfe refresca cada 30 s: la CDN de Vercel sirve la misma respuesta a todos durante ese tiempo.
  if (estado === 200) res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=30");
  res.end(JSON.stringify(cuerpo));
}
