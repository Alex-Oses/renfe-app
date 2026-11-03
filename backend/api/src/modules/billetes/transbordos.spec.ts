import type { Billete } from './billetes.service.js';
import { transbordosDe } from './transbordos.js';

// Billete mínimo: solo lo que mira la regla de transbordos.
function billete(
  localizador: string,
  id: string,
  origen: string,
  destino: string,
  salida: string,
  llegada: string,
  emitido: string,
): Billete {
  return {
    id,
    localizador,
    origen: { id: origen, nombre: origen },
    destino: { id: destino, nombre: destino },
    salida,
    llegada,
    emitido,
  } as Billete;
}

describe('transbordosDe', () => {
  it('enlaza dos reservas consecutivas con 60 min de espera', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([{ desde: 'A', hasta: 'B' }]);
  });

  it('no enlaza con 10 min de espera', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T09:50:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([]);
  });

  it('no enlaza con 200 min de espera', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T13:00:00+01:00', '2026-11-02T15:30:00+01:00', '2026-10-29T10:05:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([]);
  });

  it('no enlaza si el destino no es el origen del siguiente', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '71801', '60000', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([]);
  });

  it('no enlaza reservas con distinto número de billetes', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
      billete('B', 'B-2', '04040', '71801', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([]);
  });

  it('no enlaza si se emitieron con 30 min de diferencia', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:30:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([]);
  });

  it('devuelve dos pares en una cadena de tres tramos', () => {
    const billetes = [
      billete('A', 'A-1', '60000', '04040', '2026-11-02T07:15:00+01:00', '2026-11-02T09:40:00+01:00', '2026-10-29T10:00:00+01:00'),
      billete('B', 'B-1', '04040', '71801', '2026-11-02T10:40:00+01:00', '2026-11-02T12:30:00+01:00', '2026-10-29T10:05:00+01:00'),
      billete('C', 'C-1', '71801', '60000', '2026-11-02T13:30:00+01:00', '2026-11-02T15:10:00+01:00', '2026-10-29T10:10:00+01:00'),
    ];

    expect(transbordosDe(billetes)).toEqual([
      { desde: 'A', hasta: 'B' },
      { desde: 'B', hasta: 'C' },
    ]);
  });
});
