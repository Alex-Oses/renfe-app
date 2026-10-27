import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { TrenesService } from './trenes.service.js';

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
