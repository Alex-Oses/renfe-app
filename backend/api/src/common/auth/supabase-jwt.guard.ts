import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { jwtVerify, type JWTPayload } from 'jose';
import type { Rol, UsuarioAutenticado } from './auth.types.js';

type PeticionConUsuario = Request & { usuario?: UsuarioAutenticado };

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const peticion = contexto.switchToHttp().getRequest<PeticionConUsuario>();
    const cabecera = peticion.headers.authorization;
    if (!cabecera?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token Bearer');
    }

    const secreto = this.config.get<string>('SUPABASE_JWT_SECRET');
    if (!secreto) {
      throw new UnauthorizedException('La API no tiene configurado SUPABASE_JWT_SECRET');
    }

    try {
      const { payload } = await jwtVerify(
        cabecera.slice('Bearer '.length),
        new TextEncoder().encode(secreto),
        { algorithms: ['HS256'] },
      );

      peticion.usuario = {
        id: String(payload.sub),
        email: typeof payload.email === 'string' ? payload.email : null,
        rol: leerRol(payload),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o caducado');
    }
  }
}

// El rol vive en app_metadata (lo pone el backend, no el usuario).
function leerRol(payload: JWTPayload): Rol {
  const appMetadata = payload.app_metadata as { rol?: unknown } | undefined;
  return appMetadata?.rol === 'revisor' ? 'revisor' : 'viajero';
}

// shortcut: solo HS256 (secreto JWT de Supabase). Si el proyecto usa claves
// asimétricas, cambiar a createRemoteJWKSet con el JWKS del proyecto.
