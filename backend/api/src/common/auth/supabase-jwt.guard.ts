import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { jwtVerify, type JWTPayload } from 'jose';
import { BdService } from '../bd/bd.service.js';
import type { Rol, UsuarioAutenticado } from './auth.types.js';

type PeticionConUsuario = Request & { usuario?: UsuarioAutenticado };

interface FilaRol {
  rol: string;
}

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly bd: BdService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const peticion = contexto.switchToHttp().getRequest<PeticionConUsuario>();
    const cabecera = peticion.headers.authorization;
    if (!cabecera?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token Bearer');
    }

    const secreto = this.config.get<string>('JWT_SECRET');
    if (!secreto) {
      throw new UnauthorizedException('La API no tiene configurado JWT_SECRET');
    }

    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(
        cabecera.slice('Bearer '.length),
        new TextEncoder().encode(secreto),
        { algorithms: ['HS256'] },
      ));
    } catch {
      throw new UnauthorizedException('Token inválido o caducado');
    }

    const id = String(payload.sub);
    peticion.usuario = {
      id,
      email: typeof payload.email === 'string' ? payload.email : null,
      rol: await this.leerRol(id),
    };
    return true;
  }

  // El rol no viaja en el token: vive en `perfiles.rol` y se lee por clave primaria.
  private async leerRol(id: string): Promise<Rol> {
    try {
      const { rows } = await this.bd.consultar<FilaRol>(
        'select p.rol from public.perfiles p where p.id = $1',
        [id],
      );
      const rol = rows[0]?.rol;
      return rol === 'revisor' || rol === 'admin' ? rol : 'viajero';
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
  }
}

// HS256 con el secreto **de la API** (`JWT_SECRET`). No se verifica el token de
// Supabase a propósito: el proyecto firma con claves asimétricas (ES256) y su
// `access_token` caduca solo. La API firma los suyos en `firmar-token.ts`.
