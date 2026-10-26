// Posiciones de trenes simuladas. En la API real vendrán de GTFS-RT de Renfe.
//
// Correspondencia prevista PosicionTren <- GTFS-RT:
//   trenId        <- VehiclePosition.trip.trip_id (o vehicle.id si no hay viaje)
//   tipo, numero  <- trips.txt / routes.txt del GTFS estático a partir de trip_id (route_short_name, trip_short_name)
//   origen        <- stops.txt del primer stop_time del viaje
//   destino       <- stops.txt del último stop_time (o trips.trip_headsign)
//   lat, lon      <- VehiclePosition.position.latitude / longitude
//   rumbo         <- VehiclePosition.position.bearing (si falta, se calcula entre dos lecturas)
//   velocidad     <- VehiclePosition.position.speed (m/s, se pasa a km/h)
//   retrasoMin    <- TripUpdate.stop_time_update[].arrival.delay (o departure.delay) / 60 de la próxima parada
//   progreso      <- VehiclePosition.current_stop_sequence frente al total de paradas (o distancia en shapes.txt)
//   proximaParada <- VehiclePosition.stop_id (con current_status IN_TRANSIT_TO / INCOMING_AT) contra stops.txt
//   actualizado   <- VehiclePosition.timestamp (segundos Unix) o FeedHeader.timestamp
import { ESTACIONES } from "./simulado";
import type { Estacion, PosicionTren, TipoTren } from "./tipos";

const est = (id: string): Estacion => ESTACIONES.find((e) => e.id === id)!;

// Rutas con paradas reales de la lista. Cada una se recorre en ambos sentidos.
const RUTAS: { tipo: TipoTren; paradas: string[] }[] = [
  { tipo: "AVE", paradas: ["60000", "04040", "71801"] },
  { tipo: "AVE", paradas: ["60000", "50500", "51003"] },
  { tipo: "AVE", paradas: ["60000", "50500", "54413"] },
  { tipo: "AVE", paradas: ["60000", "65000"] },
  { tipo: "Avlo", paradas: ["60000", "04040", "71801"] },
  { tipo: "Avlo", paradas: ["60000", "60911"] },
  { tipo: "Alvia", paradas: ["17000", "10600", "37606"] },
  { tipo: "Alvia", paradas: ["17000", "10600", "31412"] },
  { tipo: "Alvia", paradas: ["04040", "05000"] },
  { tipo: "Intercity", paradas: ["71801", "65000", "60911"] },
  { tipo: "Media Distancia", paradas: ["71801", "79300"] },
  { tipo: "Media Distancia", paradas: ["51003", "50500"] },
  { tipo: "Media Distancia", paradas: ["10600", "37606"] },
];

// Velocidad media de crucero por tipo, en km/h.
const VELOCIDAD: Record<TipoTren, number> = {
  AVE: 280,
  Avlo: 260,
  Alvia: 180,
  Intercity: 150,
  "Media Distancia": 120,
};

const NUM_TRENES = 26;

function semilla(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const rad = (g: number) => (g * Math.PI) / 180;

function distanciaKm(a: Punto, b: Punto): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function rumbo(a: Punto, b: Punto): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

interface Punto {
  lat: number;
  lon: number;
  parada?: Estacion;
}

// Entre cada par de paradas se mete un punto desplazado de lado para que la vía no sea una recta perfecta.
function trazado(paradas: Estacion[]): Punto[] {
  const pts: Punto[] = [{ lat: paradas[0].lat, lon: paradas[0].lon, parada: paradas[0] }];
  for (let i = 1; i < paradas.length; i++) {
    const a = paradas[i - 1];
    const b = paradas[i];
    const lado = (semilla(a.id + b.id) % 2 ? 1 : -1) * 0.08;
    pts.push({ lat: (a.lat + b.lat) / 2 - (b.lon - a.lon) * lado, lon: (a.lon + b.lon) / 2 + (b.lat - a.lat) * lado });
    pts.push({ lat: b.lat, lon: b.lon, parada: b });
  }
  return pts;
}

export function posicionesEn(ahora: number): PosicionTren[] {
  const minutos = ahora / 60_000;
  const res: PosicionTren[] = [];
  for (let i = 0; i < NUM_TRENES; i++) {
    const ruta = RUTAS[i % RUTAS.length];
    const ida = ruta.paradas.map(est);
    const pts = trazado(ida);
    const tramos = pts.slice(1).map((p, j) => distanciaKm(pts[j], p));
    const total = tramos.reduce((s, d) => s + d, 0);
    const vMedia = VELOCIDAD[ruta.tipo] * (0.92 + (semilla(`v${i}`) % 9) / 100);
    const duracion = (total / vMedia) * 60 + 8; // minutos, con algo de margen por paradas
    const fase = semilla(`f${i}`) % Math.round(duracion);

    // Cada vuelta del ciclo es un viaje nuevo, en sentido alterno.
    const vuelta = Math.floor((minutos + fase) / duracion);
    const progreso = ((minutos + fase) % duracion) / duracion;
    const vuelta2 = vuelta % 2 === 0;
    const camino = vuelta2 ? pts : [...pts].reverse();
    const longs = vuelta2 ? tramos : [...tramos].reverse();

    let d = progreso * total;
    let j = 0;
    while (j < longs.length - 1 && d > longs[j]) d -= longs[j++];
    const a = camino[j];
    const b = camino[j + 1];
    const f = Math.min(1, d / longs[j]);
    const siguiente = camino.slice(j + 1).find((p) => p.parada)!.parada!;

    const id = `rt-${i}-${vuelta}`;
    const r = semilla(id);
    // Más lento al salir y al llegar.
    const arranque = Math.min(1, Math.min(progreso, 1 - progreso) * 12);
    res.push({
      trenId: id,
      tipo: ruta.tipo,
      numero: String(1000 + (r % 9000)),
      origen: camino[0].parada!.nombre,
      destino: camino[camino.length - 1].parada!.nombre,
      lat: a.lat + (b.lat - a.lat) * f,
      lon: a.lon + (b.lon - a.lon) * f,
      rumbo: Math.round(rumbo(a, b)),
      velocidad: Math.round(VELOCIDAD[ruta.tipo] * (0.3 + 0.7 * arranque)),
      retrasoMin: r % 10 < 6 ? 0 : 1 + (r % 25),
      progreso,
      proximaParada: siguiente.nombre,
      actualizado: new Date(ahora).toISOString(),
    });
  }
  return res;
}

export const posiciones = (): PosicionTren[] => posicionesEn(Date.now());
