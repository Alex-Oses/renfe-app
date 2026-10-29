import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
import { BdService } from '../../common/bd/bd.service.js';
import { CaraService } from './cara.service.js';

const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
const USUARIO_ID = '6f1c0f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
const EMBEDDING = Array.from({ length: 512 }, (_, i) => (i % 7) / 10 - 0.3);

const servicioCon = (consultar: (sql: string, valores: unknown[]) => Promise<unknown>) =>
  new CaraService(
    { consultar } as unknown as BdService,
    { get: () => SECRETO } as unknown as ConfigService,
  );

const conError = (code?: string) =>
  servicioCon(async () => {
    throw Object.assign(new Error('fallo'), { code });
  });

const registrar = (extra: Record<string, unknown> = {}) =>
  ({ embedding: EMBEDDING, modelo: 'arcface/buffalo_l', ...extra }) as never;

describe('CaraService.registrar', () => {
  it('manda el vector como literal de pgvector y el modelo', async () => {
    let valores: unknown[] = [];
    const servicio = servicioCon(async (_sql, recibidos) => {
      valores = recibidos;
      return { rows: [] };
    });

    await servicio.registrar(USUARIO_ID, registrar());

    expect(valores[0]).toBe(USUARIO_ID);
    expect(valores[1]).toBe(`[${EMBEDDING.join(',')}]`);
    expect(valores[2]).toBe('arcface/buffalo_l');
  });

  it.each([
    ['RF001', BadRequestException],
    ['RF002', BadRequestException],
    ['RF003', BadRequestException],
    ['RF004', ConflictException],
    ['RF005', NotFoundException],
  ])('traduce el SQLSTATE %s', async (code, esperado) => {
    await expect(conError(code).registrar(USUARIO_ID, registrar())).rejects.toBeInstanceOf(
      esperado,
    );
  });

  it('un error sin SQLSTATE (BD caída) responde 503', async () => {
    await expect(
      conError().registrar(USUARIO_ID, registrar()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('CaraService.resetear', () => {
  it('solo un admin puede: RF006 es 403', async () => {
    await expect(
      conError('RF006').resetear(USUARIO_ID, { usuarioId: USUARIO_ID } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('pasa el admin y el usuario a Postgres', async () => {
    let valores: unknown[] = [];
    const servicio = servicioCon(async (_sql, recibidos) => {
      valores = recibidos;
      return { rows: [] };
    });

    await servicio.resetear('admin-1', { usuarioId: USUARIO_ID } as never);

    expect(valores).toEqual(['admin-1', USUARIO_ID]);
  });
});

describe('CaraService.verificar', () => {
  const servicioVerificar = (verificacion: unknown, usuario: unknown) =>
    servicioCon(async (sql) => ({
      rows: [sql.includes('verificar_cara') ? verificacion : usuario],
    }));

  const peticion = { email: 'ana@ejemplo.es', embedding: EMBEDDING } as never;

  it('firma un token sin rol y devuelve el rol que da perfiles', async () => {
    const servicio = servicioVerificar(
      { usuario_id: USUARIO_ID, coincide: true },
      { email: 'ana@ejemplo.es', nombre: 'Ana', rol: 'revisor' },
    );

    const sesion = await servicio.verificar(peticion);

    expect(sesion.usuario).toEqual({
      id: USUARIO_ID,
      nombre: 'Ana',
      email: 'ana@ejemplo.es',
      rol: 'revisor',
      caraRegistrada: true,
    });

    const { payload } = await jwtVerify(
      sesion.token,
      new TextEncoder().encode(SECRETO),
      { algorithms: ['HS256'] },
    );
    expect(payload.sub).toBe(USUARIO_ID);
    expect(payload.email).toBe('ana@ejemplo.es');
    // El rol no viaja en el token: el guard lo lee de perfiles.
    expect(payload.app_metadata).toBeUndefined();
    expect(payload.exp! - payload.iat!).toBe(12 * 60 * 60);
  });

  it('un perfil admin sale como admin', async () => {
    const servicio = servicioVerificar(
      { usuario_id: USUARIO_ID, coincide: true },
      { email: 'ana@ejemplo.es', nombre: 'Ana', rol: 'admin' },
    );

    await expect(servicio.verificar(peticion)).resolves.toMatchObject({
      usuario: { rol: 'admin' },
    });
  });

  it.each([
    ['no coincide', { usuario_id: USUARIO_ID, coincide: false }],
    ['sin plantilla', { usuario_id: null, coincide: false }],
  ])('%s responde 401 con el mismo mensaje', async (_caso, fila) => {
    const servicio = servicioVerificar(fila, {});

    const error = await servicio.verificar(peticion).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).message).toBe('La cara no coincide');
  });

  it('no devuelve la similitud', async () => {
    const servicio = servicioVerificar(
      { usuario_id: USUARIO_ID, coincide: true, similitud: 0.91 },
      { email: 'ana@ejemplo.es', nombre: 'Ana', rol: 'viajero' },
    );

    const sesion = await servicio.verificar(peticion);

    expect(JSON.stringify(sesion)).not.toContain('0.91');
  });
});
