import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { BdService } from '../../common/bd/bd.service.js';
import { AuthService } from './auth.service.js';

const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
const USUARIO_ID = '6f1c0f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
const PERFIL = { nombre: 'Ana', rol: 'revisor', cara_registrada: true };

const ENTORNO: Record<string, string> = {
  SUPABASE_URL: 'https://proyecto.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: SECRETO,
  SUPABASE_ANON_KEY: SECRETO,
};

const servicioCon = (
  consultar: (sql: string, valores: unknown[]) => Promise<unknown> = async () => ({ rows: [] }),
  entorno: Record<string, string | undefined> = ENTORNO,
) =>
  new AuthService(
    { consultar } as unknown as BdService,
    { get: (clave: string) => entorno[clave] } as unknown as ConfigService,
  );

const respuesta = (cuerpo: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(cuerpo),
});

const registro = { nombre: 'Ana', email: 'ana@ejemplo.es', password: 'contrasena-larga' };
const login = { email: 'ana@ejemplo.es', password: 'contrasena-larga' };

describe('AuthService.registro', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('crea el usuario en Supabase, el perfil en la BD y devuelve la sesión', async () => {
    const consultas: { sql: string; valores: unknown[] }[] = [];
    const consultar = async (sql: string, valores: unknown[]) => {
      consultas.push({ sql, valores });
      return { rows: sql.includes('insert into perfiles') ? [] : [PERFIL] };
    };
    const peticiones = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ id: USUARIO_ID, email: registro.email }))
      .mockResolvedValueOnce(
        respuesta({
          access_token: 'token-supabase',
          refresh_token: 'refresh-supabase',
          user: { id: USUARIO_ID, email: registro.email },
        }),
      );
    vi.stubGlobal('fetch', peticiones);

    const sesion = await servicioCon(consultar).registro(registro);

    expect(sesion.token).toBe('token-supabase');
    expect(sesion.refreshToken).toBe('refresh-supabase');
    expect(sesion.usuario).toEqual({
      id: USUARIO_ID,
      nombre: 'Ana',
      email: registro.email,
      rol: 'revisor',
      caraRegistrada: true,
    });

    const alta = JSON.parse(String(peticiones.mock.calls[0]![1].body));
    expect(alta).toMatchObject({
      email: registro.email,
      email_confirm: true,
      app_metadata: { rol: 'viajero' },
    });
    expect(peticiones.mock.calls[0]![0]).toBe('https://proyecto.supabase.co/auth/v1/admin/users');

    const insert = consultas.find((consulta) => consulta.sql.includes('insert into perfiles'));
    expect(insert!.valores).toEqual([USUARIO_ID, 'viajero', 'Ana']);
  });

  it('un email repetido responde 409 y no toca la BD', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({}, 422)));

    await expect(servicioCon().registro(registro)).rejects.toBeInstanceOf(ConflictException);
  });

  it('si el perfil falla, deshace el alta en Supabase y responde 503', async () => {
    const peticiones = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ id: USUARIO_ID }))
      .mockResolvedValueOnce(respuesta({}, 204));
    vi.stubGlobal('fetch', peticiones);

    const consultar = async () => {
      throw Object.assign(new Error('perfil duplicado'), { code: '23505' });
    };

    await expect(servicioCon(consultar).registro(registro)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    expect(peticiones.mock.calls[1]![0]).toBe(
      `https://proyecto.supabase.co/auth/v1/admin/users/${USUARIO_ID}`,
    );
    expect(peticiones.mock.calls[1]![1].method).toBe('DELETE');
  });

  it('sin SUPABASE_SERVICE_ROLE_KEY responde 503 sin llamar a Supabase', async () => {
    const peticiones = vi.fn();
    vi.stubGlobal('fetch', peticiones);

    await expect(
      servicioCon(undefined, { SUPABASE_URL: 'https://proyecto.supabase.co' }).registro(registro),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(peticiones).not.toHaveBeenCalled();
  });
});

describe('AuthService.login', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('devuelve el token de Supabase y el rol del perfil', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuesta({
          access_token: 'token-supabase',
          refresh_token: 'refresh-supabase',
          user: { id: USUARIO_ID, email: login.email },
        }),
      ),
    );

    const sesion = await servicioCon(async () => ({ rows: [PERFIL] })).login(login);

    expect(sesion.token).toBe('token-supabase');
    expect(sesion.usuario.rol).toBe('revisor');
    expect(sesion.usuario.caraRegistrada).toBe(true);
  });

  it('sin perfil usa el email como nombre y el rol viajero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuesta({ access_token: 'token', user: { id: USUARIO_ID, email: login.email } }),
      ),
    );

    const sesion = await servicioCon(async () => ({ rows: [] })).login(login);

    expect(sesion).toMatchObject({
      token: 'token',
      refreshToken: null,
      usuario: { id: USUARIO_ID, nombre: login.email, rol: 'viajero', caraRegistrada: false },
    });
  });

  it('credenciales incorrectas responden 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({}, 400)));

    await expect(servicioCon().login(login)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('si Supabase no responde responde 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(servicioCon().login(login)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('si la BD falla al leer el perfil responde 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respuesta({ access_token: 'token', user: { id: USUARIO_ID, email: login.email } }),
      ),
    );
    const consultar = async () => {
      throw new Error('BD caída');
    };

    await expect(servicioCon(consultar).login(login)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
