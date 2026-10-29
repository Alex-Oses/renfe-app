import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { BdService } from '../../common/bd/bd.service.js';
import { hoyMadrid, intervaloAIso } from '../../common/gtfs/tiempo.js';
import { firmar } from '../../common/qr/firma.js';
import { BilletesService } from './billetes.service.js';

const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
const BILLETE_ID = '6f1c0f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
const OTRO_ID = '11111111-1111-4111-8111-111111111111';

const qrBillete = (extra: Record<string, unknown> = {}) =>
  firmar(
    'RNF1',
    {
      v: 1,
      id: BILLETE_ID,
      rid: 'reserva-1',
      loc: 'R-7K3M9Q',
      tipo: 'AVE',
      num: '02070',
      sal: '2026-11-02T07:15:00+01:00',
      lle: '2026-11-02T09:40:00+01:00',
      o: 'Madrid-Puerta de Atocha',
      d: 'Zaragoza-Delicias',
      co: 3,
      as: '12A',
      cl: 'Turista',
      p: 'Lucía Pérez Gómez',
      doc: '••••678Z',
      ...extra,
    },
    SECRETO,
  );

const FILA = {
  id: BILLETE_ID,
  estado: 'valido',
  referencia: 'R-7K3M9Q',
  reserva_estado: 'pagada',
  fecha: hoyMadrid(),
  origen_id: '60000',
  origen_nombre: 'Madrid-Puerta de Atocha',
  destino_id: '04040',
  destino_nombre: 'Zaragoza-Delicias',
  coche: 3,
  asiento: '12A',
  clase: 'turista',
  precio_centimos: 4500,
  qr: qrBillete(),
  emitido_en: new Date('2026-10-29T09:00:00Z'),
  expira_en: new Date('2099-01-16T01:00:00Z'),
  expirado: false,
  nombre_corto: 'AVE 02070',
  tipo_servicio: 'ave',
  numero: '02070',
  sale: '07:15:00',
  llega: '09:40:00',
  primera: null as Date | null,
};

const ABONO = {
  id: 'abono-1',
  referencia: 'AB-7K2M9Q',
  nombre: 'Bono 10 viajes',
  estado: 'activo',
  inicio: '2026-01-01',
  fin: '2099-12-31',
  viajes_restantes: 10,
  origen_nombre: 'Madrid-Puerta de Atocha',
  destino_nombre: 'Zaragoza-Delicias',
};

interface Respuestas {
  lista?: unknown[];
  billete?: unknown[];
  qr?: unknown[];
  abono?: unknown[];
  descuento?: unknown[];
}

const servicioCon = (respuestas: Respuestas = {}) => {
  const validaciones: unknown[][] = [];

  const consultar = async (sql: string, valores: unknown[]) => {
    if (sql.includes('insert into validaciones')) {
      validaciones.push(valores);
      return { rows: [] };
    }
    if (sql.includes("update billetes set estado = 'usado'")) return { rows: [] };
    if (sql.includes('update abonos set viajes_restantes')) {
      return { rows: respuestas.descuento ?? [{ viajes_restantes: 9 }] };
    }
    if (sql.includes('select qr from billetes')) return { rows: respuestas.qr ?? [] };
    if (sql.includes('from abonos a')) return { rows: respuestas.abono ?? [] };
    if (sql.includes('from billetes b') && sql.includes('where b.id')) {
      return { rows: respuestas.billete ?? [] };
    }
    if (sql.includes('from billetes b')) return { rows: respuestas.lista ?? [] };
    throw new Error(`SQL inesperado: ${sql}`);
  };

  const servicio = new BilletesService(
    { consultar } as unknown as BdService,
    { get: () => SECRETO } as unknown as ConfigService,
  );

  return { servicio, validaciones };
};

describe('BilletesService.listar', () => {
  it('mapea la fila al contrato con las horas del trayecto y el total', async () => {
    const { servicio } = servicioCon({ lista: [FILA] });

    await expect(servicio.listar('usuario-1')).resolves.toEqual({
      datos: [
        {
          id: BILLETE_ID,
          localizador: 'R-7K3M9Q',
          estado: 'valido',
          tipo: 'AVE',
          numero: '02070',
          salida: intervaloAIso(hoyMadrid(), '07:15:00'),
          llegada: intervaloAIso(hoyMadrid(), '09:40:00'),
          origen: { id: '60000', nombre: 'Madrid-Puerta de Atocha' },
          destino: { id: '04040', nombre: 'Zaragoza-Delicias' },
          coche: 3,
          asiento: '12A',
          clase: 'Turista',
          precio: 45,
          emitido: '2026-10-29T10:00:00+01:00',
          expira: '2099-01-16T02:00:00+01:00',
          qr: FILA.qr,
        },
      ],
      total: 1,
    });
  });

  it('sin billetes devuelve la colección vacía', async () => {
    const { servicio } = servicioCon();

    await expect(servicio.listar('usuario-1')).resolves.toEqual({ datos: [], total: 0 });
  });
});

describe('BilletesService.qr', () => {
  it('devuelve el QR guardado del billete propio', async () => {
    const { servicio } = servicioCon({ qr: [{ qr: 'RNF1.guardado' }] });

    await expect(servicio.qr('usuario-1', BILLETE_ID)).resolves.toEqual({
      id: BILLETE_ID,
      qr: 'RNF1.guardado',
    });
  });

  it('un id que no es uuid responde 404 sin consultar', async () => {
    const { servicio } = servicioCon();

    await expect(servicio.qr('usuario-1', 'no-es-uuid')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('un billete de otro usuario responde 404', async () => {
    const { servicio } = servicioCon({ qr: [] });

    await expect(servicio.qr('usuario-1', OTRO_ID)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('BilletesService.validar', () => {
  it('un QR con firma rota es `falso` y se apunta la validación', async () => {
    const { servicio, validaciones } = servicioCon();

    const resultado = await servicio.validar('revisor-1', { qr: 'RNF1.datos.firma' });

    expect(resultado.estado).toBe('falso');
    expect(resultado.comprobadoEnServidor).toBe(true);
    expect(validaciones[0]).toEqual([null, null, 'revisor-1', 'falso', 'Firma o prefijo incorrectos']);
  });

  it('un billete de hoy sin validar es `valido` y se marca usado', async () => {
    const { servicio, validaciones } = servicioCon({ billete: [FILA] });

    const resultado = await servicio.validar('revisor-1', { qr: qrBillete() });

    expect(resultado.estado).toBe('valido');
    expect(resultado.billete).toMatchObject({
      id: BILLETE_ID,
      localizador: 'R-7K3M9Q',
      pasajero: 'Lucía Pérez Gómez',
      documento: '••••678Z',
      clase: 'Turista',
    });
    expect(validaciones[0]![3]).toBe('valido');
  });

  it('un billete ya usado es `ya_validado` y devuelve la primera validación', async () => {
    const primera = new Date('2026-10-29T09:00:00Z');
    const { servicio } = servicioCon({ billete: [{ ...FILA, estado: 'usado', primera }] });

    const resultado = await servicio.validar('revisor-1', { qr: qrBillete() });

    expect(resultado.estado).toBe('ya_validado');
    expect(resultado.primeraValidacion).toBe('2026-10-29T10:00:00+01:00');
  });

  it('un billete de otro día es `otro_dia`', async () => {
    const { servicio } = servicioCon({ billete: [{ ...FILA, fecha: '2020-01-01' }] });

    await expect(servicio.validar('revisor-1', { qr: qrBillete() })).resolves.toMatchObject({
      estado: 'otro_dia',
    });
  });

  it('un billete caducado es `caducado`', async () => {
    const { servicio } = servicioCon({ billete: [{ ...FILA, expirado: true }] });

    await expect(servicio.validar('revisor-1', { qr: qrBillete() })).resolves.toMatchObject({
      estado: 'caducado',
    });
  });

  it('una reserva cancelada es `anulado`', async () => {
    const { servicio } = servicioCon({ billete: [{ ...FILA, reserva_estado: 'cancelada' }] });

    await expect(servicio.validar('revisor-1', { qr: qrBillete() })).resolves.toMatchObject({
      estado: 'anulado',
    });
  });

  it('firma buena pero billete que no está en la BD es `no_existe`', async () => {
    const { servicio } = servicioCon({ billete: [] });

    const resultado = await servicio.validar('revisor-1', {
      qr: qrBillete({ id: OTRO_ID }),
    });

    expect(resultado.estado).toBe('no_existe');
    expect(resultado.billete?.id).toBe(OTRO_ID);
  });

  it('un bono sin viajes es `agotado`', async () => {
    const { servicio } = servicioCon({ abono: [{ ...ABONO, viajes_restantes: 0 }] });
    const qr = firmar('RNA1', { v: 1, id: 'AB-7K2M9Q', p: 'Lucía Pérez Gómez' }, SECRETO);

    await expect(servicio.validar('revisor-1', { qr })).resolves.toMatchObject({
      estado: 'agotado',
      abono: { id: 'AB-7K2M9Q', viajesRestantes: 0 },
    });
  });

  it('un bono válido descuenta un viaje y enmascara al titular', async () => {
    const { servicio } = servicioCon({
      abono: [ABONO],
      descuento: [{ viajes_restantes: 9 }],
    });
    const qr = firmar('RNA1', { v: 1, id: 'AB-7K2M9Q', p: 'Lucía Pérez Gómez' }, SECRETO);

    const resultado = await servicio.validar('revisor-1', { qr });

    expect(resultado.estado).toBe('valido');
    expect(resultado.abono).toEqual({
      id: 'AB-7K2M9Q',
      nombre: 'Bono 10 viajes',
      titular: 'Lucía P.',
      origen: 'Madrid-Puerta de Atocha',
      destino: 'Zaragoza-Delicias',
      inicio: '2026-01-01',
      fin: '2099-12-31',
      viajesRestantes: 9,
    });
  });

  it('sin QR_SIGNING_SECRET responde 503', async () => {
    const servicio = new BilletesService(
      { consultar: async () => ({ rows: [] }) } as unknown as BdService,
      { get: () => undefined } as unknown as ConfigService,
    );

    await expect(servicio.validar('revisor-1', { qr: qrBillete() })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
