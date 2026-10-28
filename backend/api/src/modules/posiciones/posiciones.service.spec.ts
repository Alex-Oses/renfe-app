import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PosicionesService } from './posiciones.service.js';

const URL_AVLD = 'https://gtfsrt.renfe.com/vehicle_positions_LD.json';
const URL_CERCANIAS = 'https://gtfsrt.renfe.com/vehicle_positions.json';
const URL_RETRASOS_AVLD = 'https://gtfsrt.renfe.com/trip_updates_LD.json';

const INSTANTE = 1793087614; // 2026-10-27T07:53:34Z → 08:53:34 en Madrid (+01:00)
const ISO = '2026-10-27T08:53:34+01:00';

const entidad = (vehicle: Record<string, unknown> = {}) => ({
  vehicle: {
    trip: { tripId: '0309312026-10-26' },
    position: { latitude: 40.5, longitude: -3.6 },
    currentStatus: 'IN_TRANSIT_TO',
    vehicle: { id: '03093' },
    ...vehicle,
  },
});

const feed = (entidades: unknown[], timestamp: number = INSTANTE) => ({
  header: { gtfsRealtimeVersion: '2.0', timestamp: String(timestamp) },
  entity: entidades,
});

const config = (valores: Record<string, string> = {}) =>
  ({ get: (clave: string) => valores[clave] }) as unknown as ConfigService;

/** Lo que devuelve cada URL; una URL sin respuesta declarada devuelve un feed vacío. */
const responder = (porUrl: Record<string, unknown>) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({ ok: true, json: async () => porUrl[url] ?? feed([]) })),
  );

/** Feed de `trip_updates`: el retraso del viaje, en segundos. */
const retrasos = (tripId: string, delay: number) => ({
  entity: [{ tripUpdate: { trip: { tripId }, delay } }],
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PosicionesService', () => {
  it('mapea la posición al contrato', async () => {
    responder({ [URL_AVLD]: feed([entidad()]), [URL_CERCANIAS]: feed([]) });
    const servicio = new PosicionesService(config());

    const { datos, actualizado } = await servicio.obtener({});

    expect(actualizado).toBe(ISO);
    expect(datos).toEqual([
      {
        feed: 'avld',
        vehicleId: '03093',
        tripId: '0309312026-10-26',
        lat: 40.5,
        lon: -3.6,
        rumbo: null,
        velocidadKmh: null,
        estado: 'IN_TRANSIT_TO',
        paradaActual: null,
        retrasoSeg: null,
        actualizado: ISO,
      },
    ]);
  });

  it('convierte el rumbo y los m/s de velocidad a km/h', async () => {
    responder({
      [URL_AVLD]: feed([
        entidad({ position: { latitude: 37.1, longitude: -5.7, bearing: 45.4, speed: 21.7 } }),
      ]),
      [URL_CERCANIAS]: feed([]),
    });

    const { datos } = await new PosicionesService(config()).obtener({});

    expect(datos[0].rumbo).toBe(45);
    expect(datos[0].velocidadKmh).toBe(78);
  });

  it('descarta las entidades sin posición publicada', async () => {
    responder({
      [URL_AVLD]: feed([{ vehicle: { trip: { tripId: 'x' } } }, entidad()]),
      [URL_CERCANIAS]: feed([]),
    });

    const { datos } = await new PosicionesService(config()).obtener({});

    expect(datos).toHaveLength(1);
  });

  it('filtra por caja geográfica', async () => {
    responder({
      [URL_AVLD]: feed([
        entidad({ position: { latitude: 40.5, longitude: -3.6 } }),
        entidad({ position: { latitude: 37.1, longitude: -5.7 } }),
      ]),
      [URL_CERCANIAS]: feed([]),
    });
    const servicio = new PosicionesService(config());

    const { datos } = await servicio.obtener({ bbox: '-4,40,-3,41' });

    expect(datos.map((p) => p.lat)).toEqual([40.5]);
  });

  it('rechaza una caja con los mínimos al revés', async () => {
    responder({ [URL_AVLD]: feed([]), [URL_CERCANIAS]: feed([]) });

    await expect(
      new PosicionesService(config()).obtener({ bbox: '1,1,-1,-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('filtra por feed', async () => {
    responder({
      [URL_AVLD]: feed([entidad()]),
      [URL_CERCANIAS]: feed([entidad()]),
    });
    const servicio = new PosicionesService(config());

    expect((await servicio.obtener({ feed: 'cercanias' })).datos.map((p) => p.feed)).toEqual([
      'cercanias',
    ]);
  });

  it('usa como `actualizado` el feed más antiguo', async () => {
    responder({
      [URL_AVLD]: feed([entidad()], INSTANTE),
      [URL_CERCANIAS]: feed([entidad()], INSTANTE - 30),
    });

    const { actualizado } = await new PosicionesService(config()).obtener({});

    expect(actualizado).toBe('2026-10-27T08:53:04+01:00');
  });

  it('cruza el retraso de `trip_updates` con la posición', async () => {
    responder({
      [URL_AVLD]: feed([entidad()]),
      [URL_RETRASOS_AVLD]: retrasos('0309312026-10-26', 1860),
    });

    const { datos } = await new PosicionesService(config()).obtener({});

    expect(datos[0].retrasoSeg).toBe(1860);
  });

  it('conserva el signo de un tren adelantado', async () => {
    responder({
      [URL_AVLD]: feed([entidad()]),
      [URL_RETRASOS_AVLD]: retrasos('0309312026-10-26', -300),
    });

    expect((await new PosicionesService(config()).obtener({})).datos[0].retrasoSeg).toBe(-300);
  });

  it('deja el retraso a null si el viaje no viene en `trip_updates`', async () => {
    responder({
      [URL_AVLD]: feed([entidad()]),
      [URL_RETRASOS_AVLD]: retrasos('otro-viaje', 60),
    });

    expect((await new PosicionesService(config()).obtener({})).datos[0].retrasoSeg).toBeNull();
  });

  it('sirve las posiciones aunque falle el feed de retrasos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('trip_updates')
          ? { ok: false, status: 503 }
          : { ok: true, json: async () => (url === URL_AVLD ? feed([entidad()]) : feed([])) },
      ),
    );

    const { datos } = await new PosicionesService(config()).obtener({});

    expect(datos).toHaveLength(1);
    expect(datos[0].retrasoSeg).toBeNull();
  });

  it('devuelve la posición de un viaje concreto por su tripId', async () => {
    responder({
      [URL_AVLD]: feed([entidad({ stopId: '04007' })]),
      [URL_RETRASOS_AVLD]: retrasos('0309312026-10-26', 120),
    });
    const servicio = new PosicionesService(config());

    const posicion = await servicio.posicionDe('avld', '0309312026-10-26');

    expect(posicion).toMatchObject({
      tripId: '0309312026-10-26',
      paradaActual: '04007',
      retrasoSeg: 120,
    });
  });

  it('no confunde el mismo tripId de dos feeds distintos', async () => {
    responder({
      [URL_AVLD]: feed([entidad()]),
      [URL_CERCANIAS]: feed([entidad()]),
    });
    const servicio = new PosicionesService(config());

    const posicion = await servicio.posicionDe('cercanias', '0309312026-10-26');

    expect(posicion.feed).toBe('cercanias');
  });

  it('responde 404 si el viaje no está circulando', async () => {
    responder({ [URL_AVLD]: feed([entidad()]), [URL_CERCANIAS]: feed([]) });

    await expect(
      new PosicionesService(config()).posicionDe('avld', 'no-existe'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no vuelve a descargar dentro del intervalo de sondeo', async () => {
    responder({ [URL_AVLD]: feed([entidad()]), [URL_CERCANIAS]: feed([]) });
    const servicio = new PosicionesService(config());

    await servicio.obtener({});
    await servicio.obtener({});

    // Un GET por feed y ciclo: posiciones + retrasos de los dos feeds.
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(4);
  });

  it('sirve la última posición buena si Renfe deja de responder', async () => {
    responder({ [URL_AVLD]: feed([entidad()]), [URL_CERCANIAS]: feed([]) });
    const servicio = new PosicionesService(config());
    await servicio.obtener({});

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    );
    const { datos } = await servicio.obtener({});

    expect(datos).toHaveLength(1);
  });

  it('responde 503 si Renfe falla y no hay datos previos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    );

    await expect(new PosicionesService(config()).obtener({})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
