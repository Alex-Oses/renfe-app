import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT } from 'jose';
import { BdService } from '../bd/bd.service.js';
import { SupabaseJwtGuard } from './supabase-jwt.guard.js';

const SECRETO = 'secreto-de-prueba-suficientemente-largo-1234';

const firmar = (secreto: string, usuario = 'viajero', expiracion: string | number = '5m') =>
  new SignJWT({ email: `${usuario}@renfe.test` })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(`uuid-${usuario}`)
    .setExpirationTime(expiracion)
    .sign(new TextEncoder().encode(secreto));

const contexto = (cabecera?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: cabecera ? { authorization: cabecera } : {} }),
    }),
  }) as unknown as ExecutionContext;

const guardCon = (
  secreto: string | undefined,
  consultar: (sql: string, valores: unknown[]) => Promise<unknown> = async () => ({ rows: [] }),
) =>
  new SupabaseJwtGuard({ get: () => secreto } as unknown as ConfigService, {
    consultar,
  } as unknown as BdService);

describe('SupabaseJwtGuard', () => {
  it('acepta un token válido y toma el rol de perfiles', async () => {
    const peticion: { headers: Record<string, string>; usuario?: unknown } = { headers: {} };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => peticion }),
    } as unknown as ExecutionContext;
    let valores: unknown[] = [];

    peticion.headers.authorization = `Bearer ${await firmar(SECRETO, 'revisor')}`;

    const guard = guardCon(SECRETO, async (_sql, recibidos) => {
      valores = recibidos;
      return { rows: [{ rol: 'revisor' }] };
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(valores).toEqual(['uuid-revisor']);
    expect(peticion.usuario).toMatchObject({ rol: 'revisor', email: 'revisor@renfe.test' });
  });

  it('sin fila de perfil el rol es viajero', async () => {
    const peticion: { headers: Record<string, string>; usuario?: unknown } = { headers: {} };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => peticion }),
    } as unknown as ExecutionContext;

    peticion.headers.authorization = `Bearer ${await firmar(SECRETO)}`;

    await expect(guardCon(SECRETO).canActivate(ctx)).resolves.toBe(true);
    expect(peticion.usuario).toMatchObject({ rol: 'viajero' });
  });

  it('si la BD falla responde 503, no degrada a viajero', async () => {
    const token = await firmar(SECRETO);
    const guard = guardCon(SECRETO, async () => {
      throw new Error('BD caída');
    });

    await expect(guard.canActivate(contexto(`Bearer ${token}`))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('rechaza si no hay cabecera', async () => {
    await expect(guardCon(SECRETO).canActivate(contexto())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const token = await firmar('otro-secreto-distinto-de-32-caracteres!!');
    await expect(
      guardCon(SECRETO).canActivate(contexto(`Bearer ${token}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un token caducado', async () => {
    const caducado = await firmar(SECRETO, 'viajero', Math.floor(Date.now() / 1000) - 60);
    await expect(
      guardCon(SECRETO).canActivate(contexto(`Bearer ${caducado}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza si la API no tiene secreto configurado', async () => {
    await expect(
      guardCon(undefined).canActivate(contexto('Bearer cualquier-cosa')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
