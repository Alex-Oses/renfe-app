import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import type { Rol } from './auth.types.js';
import { SupabaseJwtGuard } from './supabase-jwt.guard.js';

const SECRETO = 'secreto-de-prueba-suficientemente-largo-1234';

const firmar = (secreto: string, rol: Rol = 'viajero', expiracion = '5m') =>
  new SignJWT({ app_metadata: { rol }, email: `${rol}@renfe.test` })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(`uuid-${rol}`)
    .setExpirationTime(expiracion)
    .sign(new TextEncoder().encode(secreto));

const contexto = (cabecera?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: cabecera ? { authorization: cabecera } : {} }),
    }),
  }) as unknown as ExecutionContext;

const guardCon = (secreto: string | undefined) =>
  new SupabaseJwtGuard({ get: () => secreto } as unknown as ConfigService);

describe('SupabaseJwtGuard', () => {
  it('acepta un token válido y deja el usuario en la petición', async () => {
    const peticion: { headers: Record<string, string>; usuario?: unknown } = { headers: {} };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => peticion }),
    } as unknown as ExecutionContext;

    peticion.headers.authorization = `Bearer ${await firmar(SECRETO, 'revisor')}`;

    await expect(guardCon(SECRETO).canActivate(ctx)).resolves.toBe(true);
    expect(peticion.usuario).toMatchObject({ rol: 'revisor', email: 'revisor@renfe.test' });
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

  it('acepta los tokens ES256 de Supabase verificándolos con su JWKS', async () => {
    const { publicKey, privateKey } = await generateKeyPair('ES256');
    const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'ES256' };
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({ keys: [jwk] }))) as typeof fetch;
    try {
      const token = await new SignJWT({ email: 'ana@renfe.test' })
        .setProtectedHeader({ alg: 'ES256', kid: 'k1' })
        .setSubject('uuid-ana')
        .setExpirationTime('5m')
        .sign(privateKey);
      const config = { get: (k: string) => (k === 'SUPABASE_URL' ? 'http://supabase.test' : SECRETO) };
      const guard = new SupabaseJwtGuard(config as unknown as ConfigService);
      const peticion: { headers: Record<string, string>; usuario?: unknown } = {
        headers: { authorization: `Bearer ${token}` },
      };
      const ctx = { switchToHttp: () => ({ getRequest: () => peticion }) } as unknown as ExecutionContext;
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(peticion.usuario).toMatchObject({ id: 'uuid-ana', rol: 'viajero' });
    } finally {
      globalThis.fetch = original;
    }
  });
});
