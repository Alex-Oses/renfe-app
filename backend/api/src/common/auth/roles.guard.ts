import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UsuarioAutenticado } from './auth.types.js';
import { CLAVE_ROLES } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<string[] | undefined>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!requeridos?.length) return true;

    const usuario = contexto
      .switchToHttp()
      .getRequest<{ usuario?: UsuarioAutenticado }>().usuario;

    if (!usuario) throw new UnauthorizedException('No hay usuario autenticado');
    if (!requeridos.includes(usuario.rol)) throw new ForbiddenException('Rol insuficiente');
    return true;
  }
}
