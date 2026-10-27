import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PosicionesService } from './posiciones.service.js';

const URL_AVLD = 'https://gtfsrt.renfe.com/vehicle_positions_LD.json';
const URL_CERCANIAS = 'https://gtfsrt.renfe.com/vehicle_positions.json';

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

/** Los dos feeds de Renfe, con lo que devuelve cada uno. */
const responder = (porUrl: Record<string, unknown>) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({ ok: true, json: async () => porUrl[url] })),
  );

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

  it('no vuelve a descargar dentro del intervalo de sondeo', async () => {
    responder({ [URL_AVLD]: feed([entidad()]), [URL_CERCANIAS]: feed([]) });
    const servicio = new PosicionesService(config());

    await servicio.obtener({});
    await servicio.obtener({});

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2); // un GET por feed, no dos rondas
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
