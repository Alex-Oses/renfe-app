import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import type { UsuarioAutenticado } from './auth.types.js';

const guardCon = (requeridos: string[] | undefined, usuario?: UsuarioAutenticado) =>
  new RolesGuard({
    getAllAndOverride: () => requeridos,
  } as unknown as Reflector).canActivate({
    switchToHttp: () => ({ getRequest: () => ({ usuario }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext);

describe('RolesGuard', () => {
  it('deja pasar si el endpoint no exige rol', () => {
    expect(guardCon(undefined, { id: '1', email: null, rol: 'viajero' })).toBe(true);
  });

  it('deja pasar al rol requerido', () => {
    expect(guardCon(['revisor'], { id: '1', email: null, rol: 'revisor' })).toBe(true);
  });

  it('rechaza a otro rol', () => {
    expect(() => guardCon(['revisor'], { id: '1', email: null, rol: 'viajero' })).toThrow(
      ForbiddenException,
    );
  });

  it('rechaza si no hay usuario', () => {
    expect(() => guardCon(['revisor'])).toThrow(UnauthorizedException);
  });
});
