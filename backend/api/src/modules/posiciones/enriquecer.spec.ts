import type { BdService } from '../../common/bd/bd.service.js';
import { enriquecer, estadoHorario, retrasoPorHorario } from './enriquecer.js';

// 29/10/2026 09:20 en Madrid (UTC+1)
const AHORA = new Date('2026-10-29T08:20:00Z');

describe('estadoHorario', () => {
  it('clasifica con un margen de 3 minutos', () => {
    expect(estadoHorario(null)).toBe('sin_datos');
    expect(estadoHorario(60)).toBe('a_tiempo');
    expect(estadoHorario(360)).toBe('retraso');
    expect(estadoHorario(-600)).toBe('adelanto');
  });
});

describe('retrasoPorHorario', () => {
  it('en camino cuenta desde la llegada prevista a la parada', () => {
    expect(retrasoPorHorario('IN_TRANSIT_TO', '09:14:00', null, AHORA)).toBe(360);
  });
  it('parado cuenta desde la salida prevista', () => {
    expect(retrasoPorHorario('STOPPED_AT', '09:10:00', '09:12:00', AHORA)).toBe(480);
  });
  it('antes de la hora prevista va a tiempo', () => {
    expect(retrasoPorHorario('IN_TRANSIT_TO', '09:30:00', null, AHORA)).toBe(0);
  });
  it('sin horario en esa parada no estima', () => {
    expect(retrasoPorHorario('IN_TRANSIT_TO', null, null, AHORA)).toBeNull();
  });
  it('un tren que salió ayer y cruza la medianoche usa el día anterior', () => {
    const madrugada = new Date('2026-10-29T00:10:00Z'); // 01:10 en Madrid
    expect(retrasoPorHorario('IN_TRANSIT_TO', '23:50:00', null, madrugada)).toBe(4800);
  });
});

describe('enriquecer', () => {
  const posicion = (tripId: string, retrasoSeg: number | null) => ({
    feed: 'avld' as const,
    tripId,
    estado: 'IN_TRANSIT_TO',
    paradaActual: '71801',
    retrasoSeg,
  });
  const fila = {
    viaje_id: 'T1',
    numero: '03301',
    nombre_corto: 'AVE',
    origen_id: '60000',
    origen_nombre: 'MADRID-PUERTA DE ATOCHA',
    destino_id: '71801',
    destino_nombre: 'BARCELONA-SANTS',
    llegada: '09:24:00',
    h_llega: '09:14:00',
    h_sale: null,
    h_estacion_id: '71801',
    h_estacion_nombre: 'BARCELONA-SANTS',
    sig_id: null,
    sig_nombre: null,
    sig_llega: null,
  };
  const bd = (filas: unknown[]) =>
    ({ estado: async () => 'ok', consultar: async () => ({ rows: filas }) }) as unknown as BdService;

  it('rellena los campos del contrato, y estima el retraso si Renfe no lo da', async () => {
    const [p] = await enriquecer([posicion('T1', null)], bd([fila]), AHORA);
    expect(p).toMatchObject({
      nombre: 'AVE 03301',
      linea: null,
      origen: { id: '60000', nombre: 'MADRID-PUERTA DE ATOCHA' },
      destino: { id: '71801', nombre: 'BARCELONA-SANTS' },
      // En camino: la próxima parada es la actual, con el retraso sumado (09:14 + 6 min).
      proximaParada: { id: '71801', nombre: 'BARCELONA-SANTS', llegada: '2026-10-29T09:20:00+01:00' },
      llegadaDestino: '2026-10-29T09:30:00+01:00',
    });
    expect(p).toMatchObject({ retrasoSeg: 360, retrasoFuente: 'horario', estadoHorario: 'retraso' });
  });

  it('parado en una estación, la próxima parada es la siguiente', async () => {
    const parado = { ...fila, h_sale: '09:16:00', sig_id: '04040', sig_nombre: 'ZARAGOZA', sig_llega: '10:00:00' };
    const [p] = await enriquecer([{ ...posicion('T1', 0), estado: 'STOPPED_AT' }], bd([parado]), AHORA);
    expect(p!.proximaParada).toEqual({ id: '04040', nombre: 'ZARAGOZA', llegada: '2026-10-29T10:00:00+01:00' });
  });

  it('el retraso de Renfe manda sobre la estimación', async () => {
    const [p] = await enriquecer([posicion('T1', 60)], bd([fila]), AHORA);
    expect(p).toMatchObject({ retrasoSeg: 60, retrasoFuente: 'renfe', estadoHorario: 'a_tiempo' });
  });

  it('sin BD o sin viaje en el catálogo deja los campos del viaje a null', async () => {
    const [sinBd] = await enriquecer([posicion('T1', null)], undefined, AHORA);
    const [desconocido] = await enriquecer([posicion('X9', null)], bd([]), AHORA);
    for (const p of [sinBd, desconocido]) {
      expect(p).toMatchObject({ nombre: null, origen: null, proximaParada: null, retrasoSeg: null, retrasoFuente: null, estadoHorario: 'sin_datos' });
    }
  });
});
