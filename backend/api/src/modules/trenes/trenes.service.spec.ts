import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { sinViajesDuplicados, TrenesService, unirTramos } from './trenes.service.js';

const fila = {
  feed: 'avld',
  viaje_id: '3097L23537C1',
  nombre_corto: 'AVE 02070',
  nombre: 'Madrid - Barcelona',
  tipo_servicio: 'ave',
  origen_id: '60000',
  origen_nombre: 'Madrid-Puerta de Atocha',
  destino_id: '71801',
  destino_nombre: 'Barcelona-Sants',
  km_lat_o: 40.4,
  km_lon_o: -3.69,
  km_lat_d: 41.38,
  km_lon_d: 2.14,
  sale: '07:15:00',
  llega: '09:40:00',
  num_paradas: '3',
  total: '9',
};

const dto = (extra: Record<string, unknown> = {}) =>
  ({ origen: '60000', destino: '71801', fecha: '2026-11-02', limit: 20, ...extra }) as never;

const servicioCon = (consultar: (sql: string, valores: unknown[]) => Promise<unknown>) =>
  new TrenesService({ consultar } as unknown as BdService);

describe('TrenesService', () => {
  it('mapea el viaje al contrato', async () => {
    const servicio = servicioCon(async () => ({ rows: [fila] }));

    const { datos, total } = await servicio.buscar(dto());

    expect(total).toBe(9);
    expect(datos[0]).toEqual({
      id: 'avld:3097L23537C1:2026-11-02',
      feed: 'avld',
      tripId: '3097L23537C1',
      fecha: '2026-11-02',
      linea: 'AVE 02070',
      tipo: 'AVE',
      numero: '02070',
      origen: { id: '60000', nombre: 'Madrid-Puerta de Atocha' },
      destino: { id: '71801', nombre: 'Barcelona-Sants' },
      salida: '2026-11-02T07:15:00+01:00',
      llegada: '2026-11-02T09:40:00+01:00',
      duracionMin: 145,
      numParadas: 3,
      retrasoSeg: null,
      precioDesde: expect.any(Number),
      plazasLibres: expect.any(Number),
    });
  });

  it('pasa origen, destino, fecha y límite al SQL', async () => {
    let valores: unknown[] = [];
    const servicio = servicioCon(async (_sql, v) => {
      valores = v;
      return { rows: [fila] };
    });

    await servicio.buscar(dto({ limit: 5 }));

    expect(valores).toEqual(['60000', '71801', '2026-11-02', 5]);
  });

  it('el precio y las plazas son deterministas', async () => {
    const servicio = servicioCon(async () => ({ rows: [fila] }));

    const primera = await servicio.buscar(dto());
    const segunda = await servicio.buscar(dto());

    expect(primera.datos[0].precioDesde).toBe(segunda.datos[0].precioDesde);
    expect(primera.datos[0].plazasLibres).toBe(segunda.datos[0].plazasLibres);
  });

  it('el precio y las plazas cambian entre viajes distintos', async () => {
    const servicio = servicioCon(async () => ({
      rows: [fila, { ...fila, viaje_id: 'otro-viaje', total: '2' }],
    }));

    const { datos } = await servicio.buscar(dto());

    expect(datos[0].precioDesde).not.toBe(datos[1].precioDesde);
  });

  it('sin nombre corto ni tipo usa el nombre de la ruta y DESCONOCIDO', async () => {
    const servicio = servicioCon(async () => ({
      rows: [{ ...fila, nombre_corto: null, tipo_servicio: null }],
    }));

    const { datos } = await servicio.buscar(dto());

    expect(datos[0].linea).toBe('Madrid - Barcelona');
    expect(datos[0].numero).toBeNull();
    expect(datos[0].tipo).toBe('DESCONOCIDO');
  });

  it('sin resultados comprueba las estaciones y devuelve total 0', async () => {
    const servicio = servicioCon(async (sql) =>
      sql.includes('any(') ? { rows: [{ id: '60000' }, { id: '71801' }] } : { rows: [] },
    );

    await expect(servicio.buscar(dto())).resolves.toEqual({ datos: [], total: 0 });
  });

  it('responde 404 si una estación no existe', async () => {
    const servicio = servicioCon(async (sql) =>
      sql.includes('any(') ? { rows: [{ id: '60000' }] } : { rows: [] },
    );

    await expect(servicio.buscar(dto())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('responde 503 si la BD falla', async () => {
    const servicio = servicioCon(async () => {
      throw new Error('DATABASE_URL no configurada');
    });

    await expect(servicio.buscar(dto())).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

const parada = (extra: Record<string, unknown> = {}) => ({
  feed: 'avld',
  viaje_id: '3097L23537C1',
  nombre_corto: 'AVE 02070',
  nombre: 'Madrid - Barcelona',
  tipo_servicio: 'ave',
  secuencia: 1,
  estacion_id: '60000',
  estacion_nombre: 'Madrid-Puerta de Atocha',
  llega: null,
  sale: '07:15:00',
  ...extra,
});

const detalleCon = (filas: unknown[]) =>
  new TrenesService({ consultar: async () => ({ rows: filas }) } as unknown as BdService);

describe('TrenesService.detalle', () => {
  it('devuelve las paradas y toma origen y destino de la primera y la última', async () => {
    const servicio = detalleCon([
      parada(),
      parada({
        secuencia: 2,
        estacion_id: '04040',
        estacion_nombre: 'Zaragoza-Delicias',
        llega: '08:32:00',
        sale: '08:34:00',
      }),
      parada({
        secuencia: 3,
        estacion_id: '71801',
        estacion_nombre: 'Barcelona-Sants',
        llega: '09:40:00',
        sale: null,
      }),
    ]);

    const viaje = await servicio.detalle('avld', '3097L23537C1', '2026-11-02');

    expect(viaje).toMatchObject({
      feed: 'avld',
      tripId: '3097L23537C1',
      fecha: '2026-11-02',
      linea: 'AVE 02070',
      tipo: 'AVE',
      numero: '02070',
      origen: { id: '60000', nombre: 'Madrid-Puerta de Atocha' },
      destino: { id: '71801', nombre: 'Barcelona-Sants' },
      salida: '2026-11-02T07:15:00+01:00',
      llegada: '2026-11-02T09:40:00+01:00',
      retrasoSeg: null,
    });
    expect(viaje.paradas.map((p) => p.seq)).toEqual([1, 2, 3]);
    expect(viaje.paradas[0]).toEqual({
      seq: 1,
      estacion: { id: '60000', nombre: 'Madrid-Puerta de Atocha' },
      llega: null,
      sale: '2026-11-02T07:15:00+01:00',
      retrasoSeg: null,
    });
    expect(viaje.paradas[2]!.sale).toBeNull();
  });

  it('usa la hora de llegada si la primera parada no tiene salida', async () => {
    const servicio = detalleCon([parada({ llega: '07:14:00', sale: null })]);

    const viaje = await servicio.detalle('avld', '3097L23537C1', '2026-11-02');

    expect(viaje.salida).toBe('2026-11-02T07:14:00+01:00');
    expect(viaje.llegada).toBe('2026-11-02T07:14:00+01:00');
  });

  it('responde 404 si el viaje no circula esa fecha', async () => {
    await expect(
      detalleCon([]).detalle('avld', '3097L23537C1', '2026-11-02'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('responde 503 si la BD falla', async () => {
    const servicio = new TrenesService({
      consultar: async () => {
        throw new Error('DATABASE_URL no configurada');
      },
    } as unknown as BdService);

    await expect(
      servicio.detalle('avld', '3097L23537C1', '2026-11-02'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('sinViajesDuplicados', () => {
  it('quita el mismo tren publicado con dos trip_id', () => {
    const filas = [
      { viaje_id: 'A1', numero: '03073', sale: '07:27:00' },
      { viaje_id: 'A2', numero: '03073', sale: '07:27:00' },
      { viaje_id: 'B1', numero: '03081', sale: '07:57:00' },
      { viaje_id: 'C1', numero: null, sale: '07:57:00' },
    ];
    expect(sinViajesDuplicados(filas).map((f) => f.viaje_id)).toEqual(['A1', 'B1', 'C1']);
  });
});

describe('recorrido del viaje', () => {
  const parada = { feed: 'avld', viaje_id: 'T1', nombre_corto: 'AVE', nombre: 'X', tipo_servicio: 'ave', secuencia: 1, estacion_id: 'A', estacion_nombre: 'A', llega: null, sale: '07:00:00' };
  const con = (recorrido: unknown) =>
    new TrenesService({
      consultar: async (sql: string) => ({ rows: sql.includes('tramos_via') ? [recorrido] : [parada] }),
    } as unknown as BdService);

  it('usa la forma de shapes.txt si el viaje la tiene', async () => {
    const v = await con({ forma: [[1, 1], [2, 2]], tramos: [[[9, 9], [8, 8]]] }).detalle('avld', 'T1', '2026-11-02');
    expect(v.recorrido).toEqual([[1, 1], [2, 2]]);
  });

  it('si no, encadena los tramos por las vías sin repetir las uniones', async () => {
    const v = await con({ forma: null, tramos: [[[1, 1], [1.5, 1.2], [2, 2]], [[2, 2], [3, 3]]] }).detalle('avld', 'T1', '2026-11-02');
    expect(v.recorrido).toEqual([[1, 1], [1.5, 1.2], [2, 2], [3, 3]]);
  });

  it('sin geometría (o si la consulta falla) devuelve null y el detalle sigue', async () => {
    const servicio = new TrenesService({
      consultar: async (sql: string) => {
        if (sql.includes('tramos_via')) throw new Error('relation "tramos_via" does not exist');
        return { rows: [parada] };
      },
    } as unknown as BdService);
    expect((await servicio.detalle('avld', 'T1', '2026-11-02')).recorrido).toBeNull();
    expect(unirTramos([])).toEqual([]);
  });
});
