import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QueryResultRow } from 'pg';
import { BdService } from '../../common/bd/bd.service.js';
import { referencia } from '../../common/formato.js';
import { hoyMadrid, instanteAIso, sumarDias } from '../../common/gtfs/tiempo.js';
import { PREFIJO_ABONO, firmar } from '../../common/qr/firma.js';
import type { CrearAbonoDto } from './dto/crear-abono.dto.js';
import { productoDe, type TipoAbono } from './productos.js';

export interface Abono {
  id: string;
  tipo: TipoAbono;
  nombre: string;
  origen: { id: string; nombre: string } | null;
  destino: { id: string; nombre: string } | null;
  inicio: string;
  fin: string;
  viajesTotales: number | null;
  viajesRestantes: number | null;
  precio: number;
  creado: string;
  qr: string;
}

interface FilaAbono {
  referencia: string;
  tipo: string;
  nombre: string;
  inicio: string;
  fin: string;
  viajes_totales: number | null;
  viajes_restantes: number | null;
  precio_centimos: number;
  qr: string | null;
  creado_en: Date;
  origen_id: string | null;
  origen_nombre: string | null;
  destino_id: string | null;
  destino_nombre: string | null;
}

interface FilaEstacion {
  id: string;
  nombre: string;
}

const SELECT_ABONO = `
  select a.referencia,
         a.tipo,
         a.nombre,
         to_char(a.inicio, 'YYYY-MM-DD') as inicio,
         to_char(a.fin, 'YYYY-MM-DD') as fin,
         a.viajes_totales,
         a.viajes_restantes,
         a.precio_centimos,
         a.qr,
         a.creado_en,
         eo.id as origen_id,
         eo.nombre as origen_nombre,
         ed.id as destino_id,
         ed.nombre as destino_nombre
    from abonos a
    left join estaciones eo on eo.id = a.origen_id
    left join estaciones ed on ed.id = a.destino_id
`;

const SQL_LISTAR = `
  ${SELECT_ABONO}
   where a.usuario_id = $1
   order by a.creado_en desc
`;

const SQL_DETALLE = `
  ${SELECT_ABONO}
   where a.referencia = $1 and a.usuario_id = $2
`;

const SQL_ESTACIONES = 'select id, nombre from estaciones where id = any($1::text[])';

const SQL_PERFIL = 'select nombre from perfiles where id = $1';

// Sin Stripe: el abono nace `activo` (el pago es simulado) y con el QR firmado.
const SQL_CREAR = `
  insert into abonos (referencia, usuario_id, tipo, nombre, origen_id, destino_id,
                      inicio, fin, viajes_totales, viajes_restantes, precio_centimos,
                      estado, qr)
  values ($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, $10, $11, 'activo', $12)
  returning referencia, tipo, nombre, to_char(inicio, 'YYYY-MM-DD') as inicio,
            to_char(fin, 'YYYY-MM-DD') as fin, viajes_totales, viajes_restantes,
            precio_centimos, qr, creado_en, origen_id, destino_id
`;

const SQL_GUARDAR_QR = 'update abonos set qr = $1 where referencia = $2 and usuario_id = $3';

const DIAS_MAXIMOS = 60;

@Injectable()
export class AbonosService {
  constructor(
    private readonly bd: BdService,
    private readonly config: ConfigService,
  ) {}

  async crear(usuarioId: string, dto: CrearAbonoDto): Promise<Abono> {
    const producto = productoDe(dto.tipo);
    if (!producto) throw new BadRequestException('Tipo de abono desconocido');

    const hoy = hoyMadrid();
    if (dto.inicio < hoy) {
      throw new BadRequestException('El abono no puede empezar en el pasado');
    }
    if (dto.inicio > sumarDias(hoy, DIAS_MAXIMOS)) {
      throw new BadRequestException(`El abono no puede empezar a más de ${DIAS_MAXIMOS} días`);
    }

    const trayecto = await this.resolverTrayecto(producto.trayecto, dto);
    const fin = sumarDias(dto.inicio, producto.dias - 1);
    const titular = await this.titular(usuarioId);

    const id = `AB-${referencia()}`;
    const qr = this.firmarQr(
      {
        v: 1,
        id,
        t: dto.tipo,
        o: trayecto?.origen.nombre ?? null,
        d: trayecto?.destino.nombre ?? null,
        ini: dto.inicio,
        fin,
        vr: producto.viajes,
        p: titular,
      },
      'QR_SIGNING_SECRET',
    );

    const [fila] = await this.consultar<FilaAbono>(SQL_CREAR, [
      id,
      usuarioId,
      dto.tipo,
      producto.nombre,
      trayecto?.origen.id ?? null,
      trayecto?.destino.id ?? null,
      dto.inicio,
      fin,
      producto.viajes,
      producto.viajes,
      producto.precio * 100,
      qr,
    ]);

    if (!fila) {
      throw new ServiceUnavailableException('La base de datos no ha creado el abono');
    }

    return this.aAbono({
      ...fila,
      origen_nombre: trayecto?.origen.nombre ?? null,
      destino_nombre: trayecto?.destino.nombre ?? null,
    });
  }

  async listar(usuarioId: string): Promise<{ datos: Abono[]; total: number }> {
    const filas = await this.consultar<FilaAbono>(SQL_LISTAR, [usuarioId]);
    return { datos: filas.map((fila) => this.aAbono(fila)), total: filas.length };
  }

  async detalle(usuarioId: string, id: string): Promise<Abono> {
    const [fila] = await this.consultar<FilaAbono>(SQL_DETALLE, [id, usuarioId]);
    if (!fila) throw new NotFoundException('Abono no encontrado');

    // Los abonos antiguos creados pendientes de pago aún no tienen QR.
    if (!fila.qr) {
      const qr = this.firmarQr(
        {
          v: 1,
          id: fila.referencia,
          t: fila.tipo,
          o: fila.origen_nombre,
          d: fila.destino_nombre,
          ini: fila.inicio,
          fin: fila.fin,
          vr: fila.viajes_restantes,
          p: await this.titular(usuarioId),
        },
        'QR_SIGNING_SECRET',
      );
      await this.bd
        .consultar(SQL_GUARDAR_QR, [qr, fila.referencia, usuarioId])
        .catch(() => {
          throw new ServiceUnavailableException('La base de datos no está disponible');
        });
      fila.qr = qr;
    }

    return this.aAbono(fila);
  }

  private async resolverTrayecto(
    conTrayecto: boolean,
    { origenId, destinoId }: CrearAbonoDto,
  ): Promise<{ origen: FilaEstacion; destino: FilaEstacion } | undefined> {
    if (!conTrayecto) {
      if (origenId || destinoId) {
        throw new BadRequestException('Este abono no lleva trayecto');
      }
      return undefined;
    }

    if (!origenId || !destinoId) {
      throw new BadRequestException('Faltan la estación de origen o la de destino');
    }
    if (origenId === destinoId) {
      throw new BadRequestException('El origen y el destino no pueden ser la misma estación');
    }

    const estaciones = await this.consultar<FilaEstacion>(SQL_ESTACIONES, [
      [origenId, destinoId],
    ]);
    const origen = estaciones.find((estacion) => estacion.id === origenId);
    const destino = estaciones.find((estacion) => estacion.id === destinoId);
    if (!origen || !destino) {
      throw new NotFoundException('Estación de origen o destino inexistente');
    }

    return { origen, destino };
  }

  private async titular(usuarioId: string): Promise<string> {
    const [fila] = await this.consultar<{ nombre: string }>(SQL_PERFIL, [usuarioId]);
    return fila?.nombre ?? 'Titular';
  }

  private firmarQr(datos: object, variable: 'QR_SIGNING_SECRET'): string {
    const secreto = this.config.get<string>(variable);
    if (!secreto) {
      throw new ServiceUnavailableException(`La API no tiene configurado ${variable}`);
    }
    return firmar(PREFIJO_ABONO, datos, secreto);
  }

  private aAbono(fila: FilaAbono): Abono {
    return {
      id: fila.referencia,
      tipo: fila.tipo as TipoAbono,
      nombre: fila.nombre,
      origen: fila.origen_id
        ? { id: fila.origen_id, nombre: fila.origen_nombre ?? '' }
        : null,
      destino: fila.destino_id
        ? { id: fila.destino_id, nombre: fila.destino_nombre ?? '' }
        : null,
      inicio: fila.inicio,
      fin: fila.fin,
      viajesTotales: fila.viajes_totales,
      viajesRestantes: fila.viajes_restantes,
      precio: fila.precio_centimos / 100,
      creado: instanteAIso(fila.creado_en),
      qr: fila.qr ?? '',
    };
  }

  private async consultar<T extends QueryResultRow>(sql: string, valores: unknown[]): Promise<T[]> {
    try {
      const { rows } = await this.bd.consultar<T>(sql, valores);
      return rows;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
  }
}
