import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QueryResultRow } from 'pg';
import type { Rol } from '../../common/auth/auth.types.js';
import { BdService } from '../../common/bd/bd.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegistroDto } from './dto/registro.dto.js';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  caraRegistrada: boolean;
}

/** Mismo shape que `/auth/cara/verificar`, más el `refreshToken` de Supabase. */
export interface SesionAutenticada {
  token: string;
  refreshToken: string | null;
  usuario: UsuarioSesion;
}

interface UsuarioSupabase {
  id?: string;
  email?: string;
}

interface RespuestaToken {
  access_token?: string;
  refresh_token?: string;
  user?: UsuarioSupabase;
}

interface FilaPerfil {
  nombre: string;
  rol: string;
  cara_registrada: boolean;
}

const SQL_PERFIL = `
  select p.nombre,
         p.rol,
         exists (select 1 from embeddings_faciales e where e.usuario_id = p.id) as cara_registrada
    from perfiles p
   where p.id = $1
`;

const ROL_POR_DEFECTO = 'viajero';

function aRol(rol: string | undefined): Rol {
  return rol === 'revisor' || rol === 'admin' ? rol : 'viajero';
}

/**
 * Registro y login con contraseña. Supabase Auth es el dueño de las credenciales
 * y del token; la API solo crea el perfil y lee el rol. El login facial vive en
 * `CaraService`.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly bd: BdService,
    private readonly config: ConfigService,
  ) {}

  async registro({ nombre, email, password }: RegistroDto): Promise<SesionAutenticada> {
    const servicio = this.claveObligatoria('SUPABASE_SERVICE_ROLE_KEY');
    const respuesta = await this.pedir(
      '/auth/v1/admin/users',
      { email, password, email_confirm: true, app_metadata: { rol: ROL_POR_DEFECTO } },
      servicio,
    );

    if (respuesta.status === 409 || respuesta.status === 422) {
      throw new ConflictException('Ese email ya está registrado');
    }
    if (!respuesta.ok) {
      throw new ServiceUnavailableException('Supabase Auth rechazó el alta');
    }

    const { id } = (await respuesta.json()) as UsuarioSupabase;
    if (!id) {
      throw new ServiceUnavailableException('Supabase Auth no devolvió el usuario');
    }

    try {
      // El rol solo lo escribe la API con service_role; el cliente no puede.
      await this.bd.consultar('insert into perfiles (id, rol, nombre) values ($1, $2, $3)', [
        id,
        ROL_POR_DEFECTO,
        nombre,
      ]);
    } catch {
      // Sin perfil el usuario quedaría a medias: se deshace el alta en Supabase.
      await this.pedir(`/auth/v1/admin/users/${id}`, {}, servicio, 'DELETE').catch(() => undefined);
      throw new ServiceUnavailableException('No se pudo crear el perfil del usuario');
    }

    return this.login({ email, password });
  }

  async login({ email, password }: LoginDto): Promise<SesionAutenticada> {
    const servicio = this.claveObligatoria('SUPABASE_SERVICE_ROLE_KEY');
    const anonima = this.config.get<string>('SUPABASE_ANON_KEY') || servicio;

    const respuesta = await this.pedir(
      '/auth/v1/token?grant_type=password',
      { email, password },
      anonima,
    );

    if (respuesta.status === 400 || respuesta.status === 401) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    if (!respuesta.ok) {
      throw new ServiceUnavailableException('Supabase Auth no responde');
    }

    const { access_token: token, refresh_token: refreshToken, user } =
      (await respuesta.json()) as RespuestaToken;
    if (!token || !user?.id) {
      throw new ServiceUnavailableException('Supabase Auth no devolvió la sesión');
    }

    const perfil = await this.perfil(user.id);
    return {
      token,
      refreshToken: refreshToken ?? null,
      usuario: {
        id: user.id,
        nombre: perfil?.nombre ?? user.email ?? email,
        email: user.email ?? email,
        rol: aRol(perfil?.rol),
        caraRegistrada: perfil?.cara_registrada ?? false,
      },
    };
  }

  private async perfil(usuarioId: string): Promise<FilaPerfil | undefined> {
    try {
      const { rows } = await this.bd.consultar<FilaPerfil & QueryResultRow>(SQL_PERFIL, [usuarioId]);
      return rows[0];
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
  }

  private claveObligatoria(nombre: 'SUPABASE_SERVICE_ROLE_KEY'): string {
    const clave = this.config.get<string>(nombre);
    if (!clave) {
      throw new ServiceUnavailableException(`La API no tiene configurado ${nombre}`);
    }
    return clave;
  }

  private async pedir(
    ruta: string,
    cuerpo: object,
    clave: string,
    metodo: 'POST' | 'DELETE' = 'POST',
  ): Promise<Response> {
    const base = this.config.get<string>('SUPABASE_URL');
    if (!base) {
      throw new ServiceUnavailableException('La API no tiene configurado SUPABASE_URL');
    }

    try {
      return await fetch(`${base.replace(/\/+$/, '')}${ruta}`, {
        method: metodo,
        headers: {
          apikey: clave,
          authorization: `Bearer ${clave}`,
          'content-type': 'application/json',
        },
        body: metodo === 'DELETE' ? undefined : JSON.stringify(cuerpo),
      });
    } catch {
      throw new ServiceUnavailableException('Supabase Auth no responde');
    }
  }
}
