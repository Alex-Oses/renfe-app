import { SetMetadata } from '@nestjs/common';
import type { Rol } from './auth.types.js';

export const CLAVE_ROLES = 'roles';

export const Roles = (...roles: Rol[]) => SetMetadata(CLAVE_ROLES, roles);
