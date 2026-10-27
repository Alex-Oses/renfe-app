import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { instanteAIso } from '../../common/gtfs/tiempo.js';
import { FEEDS_RT, type FeedRt, type PosicionesDto } from './dto/posiciones.dto.js';

export interface Posicion {
  feed: FeedRt;
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
    };
  }[];
}

interface Instantanea {
  datos: Posicion[];
  actualizado: string;
  expira: number;
}

const URLS: Record<FeedRt, string> = {
  avld: 'https://gtfsrt.renfe.com/vehicle_positions_LD.json',
  cercanias: 'https://gtfsrt.renfe.com/vehicle_positions.json',
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
      const feeds = await Promise.all(this.fuentes().map(([feed, url]) => this.descargar(feed, url)));
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

  private async descargar(feed: FeedRt, url: string): Promise<{ datos: Posicion[]; actualizado: string }> {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(ESPERA_MAXIMA_MS) });
    if (!respuesta.ok) throw new Error(`${feed}: HTTP ${respuesta.status}`);

    const cuerpo = (await respuesta.json()) as FeedRtJson;
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
        feed,
        vehicleId: vehicle.vehicle?.id ?? null,
        tripId: vehicle.trip.tripId,
        lat: posicion.latitude,
        lon: posicion.longitude,
        rumbo: posicion.bearing === undefined ? null : Math.round(posicion.bearing),
        velocidadKmh: posicion.speed === undefined ? null : Math.round(posicion.speed * 3.6),
        estado: vehicle.currentStatus ?? null,
        // El retraso vive en `trip_updates`, que no se lee aquí: es `null`, no un cero engañoso.
        retrasoSeg: null,
        actualizado,
      });
    }

    return { datos, actualizado };
  }

  /** Pares feed→URL de los feeds configurados. Una variable vacía desactiva ese feed. */
  private fuentes(): [FeedRt, string][] {
    return FEEDS_RT.map(
      (feed): [FeedRt, string] => [
        feed,
        this.config.get<string>(`GTFS_RT_URL_${feed.toUpperCase()}`) || URLS[feed],
      ],
    );
  }

  private ttl(): number {
    const segundos = Number(this.config.get('GTFS_RT_POLL_SECONDS') ?? 30);
    return (Number.isFinite(segundos) && segundos > 0 ? segundos : 30) * 1000;
  }
}
