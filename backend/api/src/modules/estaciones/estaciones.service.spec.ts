import { ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { EstacionesService } from './estaciones.service.js';

const fila = {
  id: '60000',
  nombre: 'Madrid-Puerta de Atocha',
  ciudad: 'Madrid',
  lat: 40.4066,
  lon: -3.6906,
  feeds: ['avld', 'cercanias'],
  total: '1',
};

const servicioCon = (consultar: (sql: string, valores: unknown[]) => Promise<unknown>) =>
  new EstacionesService({ consultar } as unknown as BdService);

const dto = (extra: Record<string, unknown> = {}) =>
  ({ q: '  atocha ', limit: 20, ...extra }) as never;

describe('EstacionesService', () => {
  it('mapea las filas al contrato y convierte el total', async () => {
    const servicio = servicioCon(async () => ({ rows: [fila] }));

    await expect(servicio.buscar(dto())).resolves.toEqual({
      datos: [
        {
          id: '60000',
          nombre: 'Madrid-Puerta de Atocha',
          ciudad: 'Madrid',
          lat: 40.4066,
          lon: -3.6906,
          feeds: ['avld', 'cercanias'],
        },
      ],
      total: 1,
    });
  });

  it('pasa el texto sin espacios sobrantes, el feed y el límite', async () => {
    let valores: unknown[] = [];
    const servicio = servicioCon(async (_sql, v) => {
      valores = v;
      return { rows: [] };
    });

    await servicio.buscar(dto({ feed: 'avld', limit: 5 }));

    expect(valores).toEqual(['atocha', 'avld', 5]);
  });

  it('pasa null cuando no se filtra por feed', async () => {
    let valores: unknown[] = [];
    const servicio = servicioCon(async (_sql, v) => {
      valores = v;
      return { rows: [] };
    });

    await servicio.buscar(dto());

    expect(valores[1]).toBeNull();
  });

  it('devuelve ciudad vacía cuando la BD no la conoce', async () => {
    const servicio = servicioCon(async () => ({ rows: [{ ...fila, ciudad: null }] }));

    const { datos } = await servicio.buscar(dto());

    expect(datos[0].ciudad).toBe('');
  });

  it('devuelve total 0 sin resultados', async () => {
    const servicio = servicioCon(async () => ({ rows: [] }));

    await expect(servicio.buscar(dto())).resolves.toEqual({ datos: [], total: 0 });
  });

  it('responde 503 si la BD falla o no está configurada', async () => {
    const servicio = servicioCon(async () => {
      throw new Error('DATABASE_URL no configurada');
    });

    await expect(servicio.buscar(dto())).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
