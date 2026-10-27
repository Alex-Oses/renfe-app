// SQL de /estaciones ejecutado contra un Postgres real (PGlite, WASM: sin Docker).
// El esquema se copia de obsidian/02-contratos-api/modelo-datos.md §4.1 y §4.2.
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { BdService } from '../../common/bd/bd.service.js';
import { EstacionesService } from './estaciones.service.js';

const ESQUEMA = `
  create table estaciones (
    id text primary key,
    nombre text not null,
    ciudad text,
    lat double precision not null,
    lon double precision not null,
    accesible boolean,
    actualizado_en timestamptz not null default now()
  );
  create table estacion_feeds (
    estacion_id text not null references estaciones (id) on delete cascade,
    feed text not null,
    stop_id text not null,
    anden text,
    primary key (estacion_id, feed),
    unique (feed, stop_id)
  );
`;

const DATOS = `
  insert into estaciones (id, nombre, ciudad, lat, lon) values
    ('60000', 'Madrid-Puerta de Atocha', 'Madrid', 40.4066, -3.6906),
    ('71801', 'Barcelona-Sants', 'Barcelona', 41.3792, 2.1400),
    ('04040', 'Zaragoza-Delicias', null, 41.6585, -0.9115),
    ('51200', 'Sevilla-Santa Justa', 'Sevilla', 37.3922, -5.9750);

  insert into estacion_feeds (estacion_id, feed, stop_id) values
    ('60000', 'avld', '60000'),
    ('60000', 'cercanias', '18001'),
    ('71801', 'avld', '71801'),
    ('71801', 'cercanias', '79009'),
    ('51200', 'avld', '51200');
`;

describe('EstacionesService contra Postgres real', () => {
  let bd: PGlite;
  let servicio: EstacionesService;

  beforeAll(async () => {
    bd = new PGlite();
    await bd.exec(ESQUEMA);
    await bd.exec(DATOS);
    servicio = new EstacionesService({
      consultar: (sql: string, valores: unknown[] = []) => bd.query(sql, valores),
    } as unknown as BdService);
  });

  afterAll(async () => {
    await bd.close();
  });

  const buscar = (q: string, feed?: 'cercanias' | 'avld', limit = 20) =>
    servicio.buscar({ q, feed, limit } as never);

  it('ignora tildes y mayúsculas', async () => {
    const { datos } = await buscar('ATÓCHA');

    expect(datos).toHaveLength(1);
    expect(datos[0].id).toBe('60000');
  });

  it('devuelve los feeds en los que se publica cada estación', async () => {
    const { datos } = await buscar('atocha');

    expect(datos[0].feeds.sort()).toEqual(['avld', 'cercanias']);
  });

  it('devuelve feeds vacío para una estación sin publicar en ningún feed', async () => {
    const { datos } = await buscar('zaragoza');

    expect(datos[0].feeds).toEqual([]);
  });

  it('filtra por feed', async () => {
    const cercanias = await buscar('a', 'cercanias');
    const avld = await buscar('a', 'avld');

    expect(cercanias.datos.map((e) => e.id).sort()).toEqual(['60000', '71801']);
    expect(avld.datos.map((e) => e.id).sort()).toEqual(['51200', '60000', '71801']);
  });

  it('devuelve ciudad vacía cuando no se conoce', async () => {
    const { datos } = await buscar('zaragoza');

    expect(datos[0].ciudad).toBe('');
  });

  it('el total cuenta todas las coincidencias, no solo las devueltas', async () => {
    const { datos, total } = await buscar('a', undefined, 2);

    expect(datos).toHaveLength(2);
    expect(total).toBe(4);
  });

  it('ordena por nombre y no duplica estaciones con dos feeds', async () => {
    const { datos } = await buscar('a');

    expect(datos.map((e) => e.nombre)).toEqual([
      'Barcelona-Sants',
      'Madrid-Puerta de Atocha',
      'Sevilla-Santa Justa',
      'Zaragoza-Delicias',
    ]);
  });
});
