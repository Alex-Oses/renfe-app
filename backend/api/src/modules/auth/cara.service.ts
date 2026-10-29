import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QueryResultRow } from 'pg';
import type { Rol } from '../../common/auth/auth.types.js';
import { firmarToken } from '../../common/auth/firmar-token.js';
import { BdService } from '../../common/bd/bd.service.js';
import type { RegistrarCaraDto } from './dto/registrar-cara.dto.js';
import type { ResetearCaraDto } from './dto/resetear-cara.dto.js';
import type { VerificarCaraDto } from './dto/verificar-cara.dto.js';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Sesion {
  token: string;
  usuario: UsuarioSesion & { caraRegistrada: boolean };
}

interface FilaVerificacion {
  usuario_id: string;
  coincide: boolean;
}

interface FilaUsuario {
  email: string;
  nombre: string;
  rol: string;
}

// Los SQLSTATE los pone la migración (`raise exception ... using errcode`), así
// que la API no compara textos. Cualquier otro error es la BD, no la petición.
const ERROR_POR_SQLSTATE: Record<string, () => HttpException> = {
  RF001: () => new BadRequestException('El modelo facial no es el configurado'),
  RF002: () => new BadRequestException('El vector no tiene 512 dimensiones'),
  RF003: () => new BadRequestException('El vector facial está vacío'),
  RF004: () => new ConflictException('Esa cara ya estaba registrada'),
  RF005: () => new NotFoundException('El usuario no existe'),
  RF006: () => new ForbiddenException('Solo un admin puede borrar la plantilla'),
};

function traducir(error: unknown): HttpException {
  const codigo = (error as { code?: string }).code;
  const crear = codigo ? ERROR_POR_SQLSTATE[codigo] : undefined;
  return crear ? crear() : new ServiceUnavailableException('La base de datos no está disponible');
}

/** pgvector acepta el literal `[a,b,c]`; con un array de JS manda `{a,b,c}`. */
function aVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

function aRol(rol: string | undefined): Rol {
  return rol === 'revisor' || rol === 'admin' ? rol : 'viajero';
}

@Injectable()
export class CaraService {
  constructor(
    private readonly bd: BdService,
    private readonly config: ConfigService,
  ) {}

  async registrar(usuarioId: string, { embedding, modelo }: RegistrarCaraDto): Promise<void> {
    await this.ejecutar('select registrar_cara($1, $2::vector, $3)', [
      usuarioId,
      aVector(embedding),
      modelo,
    ]);
  }

  async resetear(adminId: string, { usuarioId }: ResetearCaraDto): Promise<void> {
    await this.ejecutar('select resetear_cara($1, $2)', [adminId, usuarioId]);
  }

  async verificar({ email, embedding }: VerificarCaraDto): Promise<Sesion> {
    const [fila] = await this.consultar<FilaVerificacion>(
      'select usuario_id, coincide from verificar_cara($1, $2::vector)',
      [email, aVector(embedding)],
    );

    if (!fila?.coincide) {
      // Mismo mensaje siempre: «sin plantilla», «no coincide» y «modelo distinto»
      // no se distinguen, y la similitud no se devuelve (sería un oráculo).
      throw new UnauthorizedException('La cara no coincide');
    }

    const usuario = await this.usuario(fila.usuario_id, email);
    return {
      token: await this.firmar(usuario),
      usuario: { ...usuario, caraRegistrada: true },
    };
  }

  private async usuario(id: string, emailPedido: string): Promise<UsuarioSesion> {
    const [fila] = await this.consultar<FilaUsuario>(
      `select u.email, p.nombre, p.rol
         from perfiles p
         join auth.users u on u.id = p.id
        where p.id = $1`,
      [id],
    );

    return {
      id,
      nombre: fila?.nombre ?? emailPedido,
      email: fila?.email ?? emailPedido,
      rol: aRol(fila?.rol),
    };
  }

  /** El rol no viaja en el token: el guard lo lee de `perfiles.rol`, igual entre cara y contraseña. */
  private async firmar({ id, email }: UsuarioSesion): Promise<string> {
    const secreto = this.config.get<string>('JWT_SECRET');
    if (!secreto) {
      throw new ServiceUnavailableException('La API no tiene configurado JWT_SECRET');
    }

    return firmarToken({ id, email }, secreto);
  }

  private async ejecutar(sql: string, valores: unknown[]): Promise<void> {
    try {
      await this.bd.consultar(sql, valores);
    } catch (error) {
      throw traducir(error);
    }
  }

  private async consultar<T extends QueryResultRow>(
    sql: string,
    valores: unknown[],
  ): Promise<T[]> {
    try {
      const { rows } = await this.bd.consultar<T>(sql, valores);
      return rows;
    } catch (error) {
      throw traducir(error);
    }
  }
}
