import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import type { Rol, UsuarioAutenticado } from './auth.types.js';

type PeticionConUsuario = Request & { usuario?: UsuarioAutenticado };

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(private readonly config: ConfigService) {}

  // Supabase firma sus tokens con claves asimétricas (ES256/RS256, publicadas en su JWKS);
  // el login facial de la API firma los suyos con el secreto compartido (HS256). Se aceptan los dos.
  private claveDe(secreto: string): JWTVerifyGetKey {
    const base = this.config.get<string>('SUPABASE_URL');
    this.jwks ??=
      base && URL.canParse(base)
        ? createRemoteJWKSet(new URL('/auth/v1/.well-known/jwks.json', base))
        : null;
    const hs = new TextEncoder().encode(secreto);
    const jwks = this.jwks;
    return (cabecera, token) => (cabecera.alg === 'HS256' || !jwks ? hs : jwks(cabecera, token));
  }

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
        this.claveDe(secreto),
        { algorithms: ['HS256', 'ES256', 'RS256'] },
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
  return appMetadata?.rol === 'revisor' || appMetadata?.rol === 'admin'
    ? appMetadata.rol
    : 'viajero';
}

