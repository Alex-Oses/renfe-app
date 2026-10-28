import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FEEDS, type Feed } from '../../common/gtfs/feeds.js';
import { instanteAIso } from '../../common/gtfs/tiempo.js';
import type { PosicionesDto } from './dto/posiciones.dto.js';

export interface Posicion {
  feed: Feed;
  vehicleId: string | null;
  tripId: string;
  lat: number;
  lon: number;
  rumbo: number | null;
  velocidadKmh: number | null;
  estado: string | null;
  paradaActual: string | null;
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
      stopId?: string;
      vehicle?: { id?: string };
    };
  }[];
}

interface FeedRetrasosJson {
  entity?: { tripUpdate?: { trip?: { tripId?: string }; delay?: number } }[];
}

interface Fuente {
  feed: Feed;
  posiciones: string;
  retrasos: string;
}

interface Instantanea {
  datos: Posicion[];
  actualizado: string;
  expira: number;
}

const URLS_POSICIONES: Record<Feed, string> = {
  avld: 'https://gtfsrt.renfe.com/vehicle_positions_LD.json',
  cercanias: 'https://gtfsrt.renfe.com/vehicle_positions.json',
};

const URLS_RETRASOS: Record<Feed, string> = {
  avld: 'https://gtfsrt.renfe.com/trip_updates_LD.json',
  cercanias: 'https://gtfsrt.renfe.com/trip_updates.json',
};

const ESPERA_MAXIMA_MS = 5_000;

@Injectable()
export class PosicionesService {
  private instantanea: Instantanea | null = null;
  private enCurso: Promise<Instantanea> | null = null;

  constructor(private readonly config: ConfigService) {}

  async obtener({ bbox, feed }: PosicionesDto): Promise<{ datos: Posicion[]; actualizado: string }> {
    const { datos, actualizado } = await this.instantaneaActual();
    const caja = bbox?.split(',').map(Number);
    if (caja && (caja[0]! > caja[2]! || caja[1]! > caja[3]!)) {
      throw new BadRequestException('bbox debe ser minLon,minLat,maxLon,maxLat (mínimos primero)');
    }

    return {
      datos: datos.filter(
        (posicion) =>
          (feed === undefined || posicion.feed === feed) &&
          (caja === undefined ||
            (posicion.lon >= caja[0] &&
              posicion.lat >= caja[1] &&
              posicion.lon <= caja[2] &&
              posicion.lat <= caja[3])),
      ),
      actualizado,
    };
  }

  /**
   * Última posición conocida de un viaje. El `tripId` de GTFS-RT es el `trip_id` del GTFS estático,
   * así que se busca tal cual: no hay que cruzarlo con nada.
   */
  async posicionDe(feed: Feed, tripId: string): Promise<Posicion> {
    const { datos } = await this.instantaneaActual();
    const posicion = datos.find((candidata) => candidata.feed === feed && candidata.tripId === tripId);
    if (!posicion) throw new NotFoundException('Ese viaje no está circulando ahora');
    return posicion;
  }

  /** Snapshot en memoria: se refresca como mucho cada `TTL`, y una sola descarga a la vez. */
  private async instantaneaActual(): Promise<Instantanea> {
    if (this.instantanea && Date.now() < this.instantanea.expira) return this.instantanea;

    this.enCurso ??= this.refrescar().finally(() => {
      this.enCurso = null;
    });
    return this.enCurso;
  }

  private async refrescar(): Promise<Instantanea> {
    try {
      const feeds = await Promise.all(this.fuentes().map((fuente) => this.descargar(fuente)));
      const datos = feeds.flatMap((feed) => feed.datos);
      // El `actualizado` del conjunto es el del feed más antiguo: es el que se queda corto.
      const actualizado = feeds.map((feed) => feed.actualizado).sort()[0]!;

      this.instantanea = { datos, actualizado, expira: Date.now() + this.ttl() };
      return this.instantanea;
    } catch {
      // Renfe caída: se sigue sirviendo lo último bueno y no se reintenta en cada petición.
      // shortcut: sin reintento ni backoff; si Renfe cae mucho, añadir reintentos con espera.
      if (this.instantanea) {
        this.instantanea.expira = Date.now() + this.ttl();
        return this.instantanea;
      }
      throw new ServiceUnavailableException('No se pudo leer GTFS-RT y no hay datos previos');
    }
  }

  private async descargar(fuente: Fuente): Promise<{ datos: Posicion[]; actualizado: string }> {
    const [cuerpo, retrasos] = await Promise.all([
      this.leer<FeedRtJson>(fuente.feed, fuente.posiciones),
      this.retrasos(fuente),
    ]);

    const actualizado = instanteAIso(
      new Date(Number(cuerpo.header?.timestamp ?? Date.now() / 1000) * 1000),
    );

    const datos: Posicion[] = [];
    for (const { vehicle } of cuerpo.entity ?? []) {
      const posicion = vehicle?.position;
      // Hay vehículos sin posición publicada; no se inventan coordenadas.
      if (!vehicle?.trip?.tripId || posicion?.latitude === undefined || posicion.longitude === undefined) {
        continue;
      }

      datos.push({
        feed: fuente.feed,
        vehicleId: vehicle.vehicle?.id ?? null,
        tripId: vehicle.trip.tripId,
        lat: posicion.latitude,
        lon: posicion.longitude,
        rumbo: posicion.bearing === undefined ? null : Math.round(posicion.bearing),
        velocidadKmh: posicion.speed === undefined ? null : Math.round(posicion.speed * 3.6),
        estado: vehicle.currentStatus ?? null,
        paradaActual: vehicle.stopId ?? null,
        // Puede ser negativo: el tren va adelantado, no es un dato inválido.
        retrasoSeg: retrasos.get(vehicle.trip.tripId) ?? null,
        actualizado,
      });
    }

    return { datos, actualizado };
  }

  /** Retraso publicado por viaje, en segundos. Se cruza por `tripId`, que es el mismo en los dos feeds. */
  private async retrasos(fuente: Fuente): Promise<Map<string, number>> {
    const porViaje = new Map<string, number>();
    try {
      const cuerpo = await this.leer<FeedRetrasosJson>(fuente.feed, fuente.retrasos);
      for (const { tripUpdate } of cuerpo.entity ?? []) {
        const tripId = tripUpdate?.trip?.tripId;
        if (tripId && typeof tripUpdate.delay === 'number') porViaje.set(tripId, tripUpdate.delay);
      }
    } catch {
      // El retraso es un extra: si su feed falla, el mapa se sirve igual con `retrasoSeg: null`.
      // shortcut: un fallo deja sin retraso a todo el feed hasta el siguiente sondeo.
    }
    return porViaje;
  }

  private async leer<T>(feed: Feed, url: string): Promise<T> {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(ESPERA_MAXIMA_MS) });
    if (!respuesta.ok) throw new Error(`${feed}: HTTP ${respuesta.status}`);
    return (await respuesta.json()) as T;
  }

  /** Feeds configurados. Una variable vacía usa la URL pública de Renfe. */
  private fuentes(): Fuente[] {
    return FEEDS.map((feed) => {
      const clave = feed.toUpperCase();
      return {
        feed,
        posiciones: this.config.get<string>(`GTFS_RT_URL_${clave}`) || URLS_POSICIONES[feed],
        retrasos: this.config.get<string>(`GTFS_RT_URL_RETRASOS_${clave}`) || URLS_RETRASOS[feed],
      };
    });
  }

  private ttl(): number {
    const segundos = Number(this.config.get('GTFS_RT_POLL_SECONDS') ?? 30);
    return (Number.isFinite(segundos) && segundos > 0 ? segundos : 30) * 1000;
  }
}
