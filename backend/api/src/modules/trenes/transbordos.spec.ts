import { describe, expect, it } from 'vitest';
import {
  ESPERA_MAX_MS,
  MARGEN_CAMBIO_MS,
  MARGEN_MIN_MS,
  esperaSuficiente,
} from './transbordos.js';

const iso = (hora: string) => `2026-11-03T${hora}:00+01:00`;

describe('esperaSuficiente', () => {
  it('acepta 15 min en la misma estación y rechaza 14', () => {
    expect(esperaSuficiente(iso('08:30'), iso('08:45'), false)).toBe(true);
    expect(esperaSuficiente(iso('08:30'), iso('08:44'), false)).toBe(false);
  });

  it('exige 30 min si hay que cambiar de estación', () => {
    expect(esperaSuficiente(iso('08:30'), iso('09:00'), true)).toBe(true);
    expect(esperaSuficiente(iso('08:30'), iso('08:59'), true)).toBe(false);
  });

  it('rechaza esperas de más de 3 h', () => {
    expect(esperaSuficiente(iso('08:30'), iso('11:30'), false)).toBe(true);
    expect(esperaSuficiente(iso('08:30'), iso('11:31'), false)).toBe(false);
  });

  it('compara instantes en el cambio de día', () => {
    expect(
      esperaSuficiente('2026-11-03T23:50:00+01:00', '2026-11-04T00:20:00+01:00', false),
    ).toBe(true);
    expect(
      esperaSuficiente('2026-11-03T23:50:00+01:00', '2026-11-04T00:00:00+01:00', false),
    ).toBe(false);
  });

  it('usa los márgenes del contrato', () => {
    expect(MARGEN_MIN_MS).toBe(15 * 60_000);
    expect(MARGEN_CAMBIO_MS).toBe(30 * 60_000);
    expect(ESPERA_MAX_MS).toBe(180 * 60_000);
  });
});
