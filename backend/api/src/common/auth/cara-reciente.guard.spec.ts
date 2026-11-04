import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CaraRecienteGuard, VIGENCIA_CARA_S } from './cara-reciente.guard.js';

const contexto = (caraEn: number | null | undefined) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ usuario: caraEn === undefined ? undefined : { id: 'u', email: null, rol: 'viajero', caraEn } }),
    }),
  }) as unknown as ExecutionContext;

const ahora = () => Math.floor(Date.now() / 1000);
const guard = new CaraRecienteGuard();

describe('CaraRecienteGuard', () => {
  it('deja pagar con la cara recién comprobada', () => {
    expect(guard.canActivate(contexto(ahora() - 30))).toBe(true);
  });

  it('rechaza un token sin cara (login con contraseña)', () => {
    expect(() => guard.canActivate(contexto(null))).toThrow(ForbiddenException);
  });

  it('rechaza una cara comprobada hace demasiado', () => {
    expect(() => guard.canActivate(contexto(ahora() - VIGENCIA_CARA_S - 1))).toThrow(ForbiddenException);
  });

  it('rechaza una petición sin usuario', () => {
    expect(() => guard.canActivate(contexto(undefined))).toThrow(ForbiddenException);
  });
});
