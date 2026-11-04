import { ForbiddenException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { UsuarioAutenticado } from './auth.types.js';

/** Tiempo que vale una cara comprobada para pagar. */
export const VIGENCIA_CARA_S = 10 * 60;

export const MENSAJE_CARA = 'Confirma el pago con tu cara antes de comprar.';

/**
 * Va después de SupabaseJwtGuard: solo deja pasar si el token salió de /auth/cara/verificar hace
 * menos de VIGENCIA_CARA_S. Es 403 y no 401 para que la app no lo tome por sesión caducada.
 */
export class CaraRecienteGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const { usuario } = contexto.switchToHttp().getRequest<{ usuario?: UsuarioAutenticado }>();
    const ahora = Math.floor(Date.now() / 1000);
    const caraEn = usuario?.caraEn;
    if (caraEn == null || ahora - caraEn > VIGENCIA_CARA_S || caraEn > ahora + 60) {
      throw new ForbiddenException(MENSAJE_CARA);
    }
    return true;
  }
}
