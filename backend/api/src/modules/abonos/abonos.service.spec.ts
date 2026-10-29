import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { BdService } from '../../common/bd/bd.service.js';
import { hoyMadrid, sumarDias } from '../../common/gtfs/tiempo.js';
import { verificar } from '../../common/qr/firma.js';
import { AbonosService } from './abonos.service.js';

const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
const HOY = hoyMadrid();
const ORIGEN = { id: '60000', nombre: 'Madrid-Puerta de Atocha' };
const DESTINO = { id: '04040', nombre: 'Zaragoza-Delicias' };

const FILA = {
  referencia: 'AB-7K2M9Q',
  tipo: 'bono-10',
  nombre: 'Bono 10 viajes',
  inicio: HOY,
  fin: sumarDias(HOY, 59),
  viajes_totales: 10,
  viajes_restantes: 10,
  precio_centimos: 22000,
  qr: 'RNA1.leido.del.qr',
  creado_en: new Date('2026-10-29T09:00:00Z'),
  origen_id: ORIGEN.id,
  origen_nombre: ORIGEN.nombre,
  destino_id: DESTINO.id,
  destino_nombre: DESTINO.nombre,
};

interface Opciones {
  lista?: unknown[];
  detalle?: unknown[];
  estaciones?: unknown[];
  perfil?: unknown[];
}

const servicioCon = (opciones: Opciones = {}) => {
  const escrituras: { sql: string; valores: unknown[] }[] = [];

  const consultar = async (sql: string, valores: unknown[]) => {
    if (sql.includes('insert into abonos')) {
      escrituras.push({ sql, valores });
      return {
        rows: [
          {
            ...FILA,
            tipo: valores[2],
            nombre: valores[3],
            origen_id: valores[4],
            destino_id: valores[5],
            inicio: valores[6],
            fin: valores[7],
            viajes_totales: valores[8],
            viajes_restantes: valores[9],
            precio_centimos: valores[10],
            qr: valores[11],
          },
        ],
      };
    }
    if (sql.includes('update abonos set qr')) {
      escrituras.push({ sql, valores });
      return { rows: [] };
    }
    if (sql.includes('from estaciones')) return { rows: opciones.estaciones ?? [] };
    if (sql.includes('from perfiles')) return { rows: opciones.perfil ?? [{ nombre: 'Ana López' }] };
    if (sql.includes('a.referencia = $1 and a.usuario_id = $2')) {
      return { rows: opciones.detalle ?? [] };
    }
    if (sql.includes('from abonos a')) return { rows: opciones.lista ?? [] };
    throw new Error(`SQL inesperado: ${sql}`);
  };

  return {
    servicio: new AbonosService(
      { consultar } as unknown as BdService,
      { get: () => SECRETO } as unknown as ConfigService,
    ),
    escrituras,
  };
};

const estaciones = [ORIGEN, DESTINO];

describe('AbonosService.crear', () => {
  it('calcula fin, precio y viajes de un bono y firma su QR', async () => {
    const { servicio, escrituras } = servicioCon({ estaciones });

    const abono = await servicio.crear('usuario-1', {
      tipo: 'bono-10',
      origenId: ORIGEN.id,
      destinoId: DESTINO.id,
      inicio: HOY,
    } as never);

    expect(abono).toMatchObject({
      id: 'AB-7K2M9Q',
      tipo: 'bono-10',
      nombre: 'Bono 10 viajes',
      origen: ORIGEN,
      destino: DESTINO,
      inicio: HOY,
      fin: sumarDias(HOY, 59),
      viajesTotales: 10,
      viajesRestantes: 10,
      precio: 220,
      creado: '2026-10-29T10:00:00+01:00',
    });

    const valores = escrituras[0]!.valores;
    expect(valores[0]).toMatch(/^AB-[2-9A-HJ-NP-Z]{6}$/);
    expect(valores[8]).toBe(10);
    expect(valores[10]).toBe(22000);

    const qr = verificar(String(valores[11]), SECRETO);
    expect(qr?.prefijo).toBe('RNA1');
    expect(qr?.datos).toMatchObject({
      v: 1,
      t: 'bono-10',
      o: ORIGEN.nombre,
      d: DESTINO.nombre,
      ini: HOY,
      fin: sumarDias(HOY, 59),
      vr: 10,
      p: 'Ana López',
    });
  });

  it('Cercanías no lleva trayecto y no tiene límite de viajes', async () => {
    const { servicio, escrituras } = servicioCon();

    const abono = await servicio.crear('usuario-1', {
      tipo: 'cercanias-recurrente',
      inicio: HOY,
    } as never);

    expect(abono.origen).toBeNull();
    expect(abono.destino).toBeNull();
    expect(abono.viajesTotales).toBeNull();
    expect(escrituras[0]!.valores[4]).toBeNull();
    expect(escrituras[0]!.valores[8]).toBeNull();
  });

  it.each([
    ['un tipo desconocido', { tipo: 'mensual-premium', inicio: HOY }],
    ['empezar en el pasado', { tipo: 'bono-10', origenId: ORIGEN.id, destinoId: DESTINO.id, inicio: '2020-01-01' }],
    ['empezar dentro de más de 60 días', { tipo: 'bono-10', origenId: ORIGEN.id, destinoId: DESTINO.id, inicio: sumarDias(HOY, 61) }],
    ['un bono sin trayecto', { tipo: 'bono-10', inicio: HOY }],
    ['origen y destino iguales', { tipo: 'bono-10', origenId: ORIGEN.id, destinoId: ORIGEN.id, inicio: HOY }],
    ['Cercanías con trayecto', { tipo: 'cercanias-recurrente', origenId: ORIGEN.id, destinoId: DESTINO.id, inicio: HOY }],
  ])('rechaza %s con 400', async (_caso, dto) => {
    const { servicio } = servicioCon({ estaciones });

    await expect(servicio.crear('usuario-1', dto as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('si la estación no existe responde 404', async () => {
    const { servicio } = servicioCon({ estaciones: [ORIGEN] });

    await expect(
      servicio.crear('usuario-1', {
        tipo: 'bono-10',
        origenId: ORIGEN.id,
        destinoId: DESTINO.id,
        inicio: HOY,
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AbonosService.listar y detalle', () => {
  it('lista los abonos del usuario', async () => {
    const { servicio } = servicioCon({ lista: [FILA] });

    await expect(servicio.listar('usuario-1')).resolves.toMatchObject({
      datos: [
        {
          id: 'AB-7K2M9Q',
          origen: ORIGEN,
          precio: 220,
          creado: '2026-10-29T10:00:00+01:00',
        },
      ],
      total: 1,
    });
  });

  it('un abono de otro usuario responde 404', async () => {
    const { servicio } = servicioCon({ detalle: [] });

    await expect(servicio.detalle('usuario-1', 'AB-7K2M9Q')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('si el abono no tiene QR lo firma y lo guarda', async () => {
    const { servicio, escrituras } = servicioCon({
      detalle: [{ ...FILA, qr: null }],
    });

    const abono = await servicio.detalle('usuario-1', 'AB-7K2M9Q');

    expect(verificar(abono.qr, SECRETO)?.datos).toMatchObject({
      id: 'AB-7K2M9Q',
      ini: HOY,
      fin: sumarDias(HOY, 59),
      p: 'Ana López',
    });
    expect(escrituras).toHaveLength(1);
    expect(escrituras[0]!.valores).toEqual([abono.qr, 'AB-7K2M9Q', 'usuario-1']);
  });
});
