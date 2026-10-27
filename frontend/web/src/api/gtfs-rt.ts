// Conversión del GTFS-RT de Renfe (formato JSON) a la forma de GET /posiciones del contrato.
// La usa la función de Vercel (api/posiciones.ts) mientras la API de Rubén no esté desplegada;
// es la misma lógica que backend/api/src/modules/posiciones/posiciones.service.ts.

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
