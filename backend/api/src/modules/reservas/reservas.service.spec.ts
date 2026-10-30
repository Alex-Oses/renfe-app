import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { verificar } from '../../common/qr/firma.js';
import { BdService } from '../../common/bd/bd.service.js';
import type { CorreoService } from '../../common/correo/correo.service.js';
import { ReservasService } from './reservas.service.js';

const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
const RESERVA_ID = '6f1c0f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';

const VIAJE = {
  nombre_corto: 'AVE 02070',
  tipo_servicio: 'ave',
  numero: '02070',
  sale: '07:15:00',
  llega: '09:40:00',
  origen_nombre: 'Madrid-Puerta de Atocha',
  destino_nombre: 'Zaragoza-Delicias',
};

const LIBRES = [
  { id: '11111111-1111-4111-8111-111111111111', coche: 1, numero: 1, clase: 'preferente' },
  { id: '22222222-2222-4222-8222-222222222222', coche: 1, numero: 2, clase: 'preferente' },
];

interface Opciones {
  viaje?: unknown;
  libres?: unknown[];
  fallo?: Error;
}

const crearCliente = (opciones: Opciones = {}) => {
  let seleccionados: unknown[] = [];

  return {
    query: async (sql: string, valores: unknown[] = []) => {
      if (opciones.fallo) throw opciones.fallo;
      if (sql.includes('from viajes v')) {
        return { rows: opciones.viaje === null ? [] : [opciones.viaje ?? VIAJE] };
      }
      if (sql.includes('insert into asientos')) return { rows: [] };
      if (sql.includes('insert into reservas')) {
        return {
          rows: [
            {
              id: RESERVA_ID,
              referencia: 'R-7K3M9Q',
              creada_en: new Date('2026-10-29T09:00:00Z'),
            },
          ],
        };
      }
      if (sql.includes('from asientos')) {
        seleccionados = (opciones.libres ?? LIBRES).slice(0, Number(valores[3]));
        return { rows: seleccionados };
      }
      if (sql.includes('update asientos')) return { rows: seleccionados };
      if (sql.includes('insert into billetes')) return { rows: [] };
      throw new Error(`SQL inesperado: ${sql}`);
    },
  };
};

const servicioCon = (
  opciones: Opciones = {},
  entorno: Record<string, string | undefined> = { QR_SIGNING_SECRET: SECRETO },
) =>
  new ReservasService(
    {
      transaccion: (fn: (cliente: unknown) => Promise<unknown>) =>
        fn(crearCliente(opciones)),
    } as unknown as BdService,
    { get: (clave: string) => entorno[clave] } as unknown as ConfigService,
    { enviar: async () => undefined } as unknown as CorreoService,
  );

const dto = (extra: Record<string, unknown> = {}) =>
  ({
    feed: 'avld',
    viajeId: '3097L23537C1',
    fecha: '2099-01-15',
    origenId: '60000',
    destinoId: '04040',
    pasajeros: [{ nombre: 'Lucía Pérez Gómez', documento: '12345678Z' }],
    ...extra,
  }) as never;

describe('ReservasService.crear', () => {
  it('crea la reserva pagada y emite un billete con QR firmado por butaca', async () => {
    const reserva = await servicioCon().crear('usuario-1', dto());

    expect(reserva).toMatchObject({
      id: RESERVA_ID,
      localizador: 'R-7K3M9Q',
      estado: 'pagada',
    });
    expect(reserva.billetes).toHaveLength(1);
    expect(reserva.total).toBe(reserva.billetes[0]!.precio);
    expect(reserva.billetes[0]).toMatchObject({
      coche: 1,
      asiento: '1A',
      clase: 'Confort',
    });

    const qr = verificar(reserva.billetes[0]!.qr, SECRETO);
    expect(qr?.prefijo).toBe('RNF1');
    expect(qr?.datos).toMatchObject({
      v: 1,
      rid: RESERVA_ID,
      loc: 'R-7K3M9Q',
      tipo: 'AVE',
      num: '02070',
      o: 'Madrid-Puerta de Atocha',
      d: 'Zaragoza-Delicias',
      co: 1,
      as: '1A',
      cl: 'Confort',
      p: 'Lucía Pérez Gómez',
      doc: '••••678Z',
    });
    expect(qr?.datos.sal).toBe('2099-01-15T07:15:00+01:00');
    expect(qr?.datos.lle).toBe('2099-01-15T09:40:00+01:00');
  });

  it('emite un billete por pasajero y suma el importe', async () => {
    const reserva = await servicioCon().crear(
      'usuario-1',
      dto({
        pasajeros: [
          { nombre: 'Lucía Pérez', documento: '12345678Z' },
          { nombre: 'Mario Gil', documento: '87654321X' },
        ],
      }),
    );

    expect(reserva.billetes).toHaveLength(2);
    expect(reserva.total).toBe(Number((reserva.billetes[0]!.precio * 2).toFixed(2)));
    expect(reserva.billetes[1]!.asiento).toBe('2B');
  });

  it('rechaza fechas pasadas sin tocar la BD', async () => {
    await expect(
      servicioCon().crear('usuario-1', dto({ fecha: '2020-01-01' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza origen y destino iguales', async () => {
    await expect(
      servicioCon().crear('usuario-1', dto({ destinoId: '60000' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('si el viaje no circula ese día responde 404', async () => {
    await expect(
      servicioCon({ viaje: null }).crear('usuario-1', dto()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('si no quedan butacas responde 409 (rollback)', async () => {
    await expect(
      servicioCon({ libres: [] }).crear('usuario-1', dto()),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('sin QR_SIGNING_SECRET responde 503', async () => {
    await expect(
      servicioCon({}, { QR_SIGNING_SECRET: undefined }).crear('usuario-1', dto()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('un fallo de la BD responde 503', async () => {
    await expect(
      servicioCon({ fallo: new Error('BD caída') }).crear('usuario-1', dto()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
