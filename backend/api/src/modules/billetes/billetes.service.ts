import {
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QueryResultRow } from 'pg';
import type { EstadoValidacion } from '../../common/tipos-validacion.js';
import { BdService } from '../../common/bd/bd.service.js';
import {
  claseVisible,
  enmascararTitular,
  numeroVisible,
  tipoVisible,
} from '../../common/formato.js';
import { intervaloAIso, instanteAIso, hoyMadrid } from '../../common/gtfs/tiempo.js';
import {
  PREFIJO_BILLETE,
  verificar,
} from '../../common/qr/firma.js';
import type { ValidarBilleteDto } from './dto/validar-billete.dto.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface Billete {
  id: string;
  localizador: string;
  /** Viaje del billete, para cruzarlo con /posiciones (retraso real y avisos). */
  feed: string;
  viajeId: string;
  estado: string;
  tipo: string;
  numero: string | null;
  salida: string;
  llegada: string;
  origen: { id: string; nombre: string };
  destino: { id: string; nombre: string };
  coche: number;
  asiento: string;
  clase: string;
  precio: number;
  emitido: string;
  expira: string;
  qr: string;
}

/** Lo que ve el revisor del billete escaneado (sin datos internos). */
export interface BilleteValidado {
  id: string;
  localizador: string;
  pasajero: string;
  documento: string;
  tipo: string;
  numero: string;
  salida: string;
  llegada: string;
  origen: string;
  destino: string;
  coche: number;
  asiento: string;
  clase: string;
}

export interface AbonoValidado {
  id: string;
  nombre: string;
  titular: string;
  origen: string | null;
  destino: string | null;
  inicio: string;
  fin: string;
  viajesRestantes: number | null;
}

export interface ResultadoValidacion {
  estado: EstadoValidacion;
  billete?: BilleteValidado;
  abono?: AbonoValidado;
  validadoEn: string;
  primeraValidacion: string | null;
  comprobadoEnServidor: true;
}

interface FilaBillete {
  id: string;
  feed: string;
  viaje_id: string;
  estado: string;
  referencia: string;
  reserva_estado: string;
  fecha: string;
  origen_id: string;
  origen_nombre: string;
  destino_id: string;
  destino_nombre: string;
  coche: number;
  asiento: string;
  clase: string;
  precio_centimos: number;
  qr: string;
  emitido_en: Date;
  expira_en: Date;
  expirado: boolean;
  nombre_corto: string | null;
  tipo_servicio: string | null;
  numero: string | null;
  sale: string;
  llega: string;
  primera: Date | null;
}

interface FilaAbono {
  id: string;
  referencia: string;
  nombre: string;
  estado: string;
  inicio: string;
  fin: string;
  viajes_restantes: number | null;
  origen_nombre: string | null;
  destino_nombre: string | null;
}

// Una fila de billete con todo lo que necesitan la lista, el QR y el revisor:
// las horas del **trayecto vendido** se resuelven con dos laterales sobre
// `horarios`, para no traer el viaje entero.
const SELECT_BILLETE = `
  select b.id,
         b.feed,
         b.viaje_id,
         b.estado,
         r.referencia,
         r.estado as reserva_estado,
         to_char(b.fecha_servicio, 'YYYY-MM-DD') as fecha,
         b.origen_id,
         eo.nombre as origen_nombre,
         b.destino_id,
         ed.nombre as destino_nombre,
         b.coche,
         b.asiento,
         b.clase,
         b.precio_centimos,
         b.qr,
         b.emitido_en,
         b.expira_en,
         (b.expira_en < now()) as expirado,
         rt.nombre_corto,
         rt.tipo_servicio,
         v.numero,
         ho.sale::text as sale,
         hd.llega::text as llega,
         (select min(va.validado_en) from validaciones va where va.billete_id = b.id) as primera
    from billetes b
    join reservas r on r.id = b.reserva_id
    join estaciones eo on eo.id = b.origen_id
    join estaciones ed on ed.id = b.destino_id
    join viajes v on v.feed = b.feed and v.id = b.viaje_id
    join rutas rt on rt.feed = v.feed and rt.id = v.ruta_id
    join lateral (
      select h.secuencia, coalesce(h.sale, h.llega) as sale
        from horarios h
       where h.feed = b.feed
         and h.viaje_id = b.viaje_id
         and h.estacion_id = b.origen_id
       order by h.secuencia
       limit 1
    ) ho on true
    join lateral (
      select coalesce(h.llega, h.sale) as llega
        from horarios h
       where h.feed = b.feed
         and h.viaje_id = b.viaje_id
         and h.estacion_id = b.destino_id
         and h.secuencia > ho.secuencia
       order by h.secuencia
       limit 1
    ) hd on true
`;

const SQL_BILLETES = `
  ${SELECT_BILLETE}
   where b.usuario_id = $1
   order by b.emitido_en desc
`;

const SQL_BILLETE = `
  ${SELECT_BILLETE}
   where b.id = $1::uuid
`;

const SQL_QR = 'select qr from billetes where id = $1::uuid and usuario_id = $2';

const SQL_ABONO = `
  select a.id,
         a.referencia,
         a.nombre,
         a.estado,
         to_char(a.inicio, 'YYYY-MM-DD') as inicio,
         to_char(a.fin, 'YYYY-MM-DD') as fin,
         a.viajes_restantes,
         eo.nombre as origen_nombre,
         ed.nombre as destino_nombre
    from abonos a
    left join estaciones eo on eo.id = a.origen_id
    left join estaciones ed on ed.id = a.destino_id
   where a.referencia = $1
`;

const SQL_VALIDACION = `
  insert into validaciones (billete_id, abono_id, revisor_id, resultado, motivo)
  values ($1, $2, $3, $4, $5)
`;

const SQL_USAR = `
  update billetes set estado = 'usado', usado_en = now()
   where id = $1::uuid and estado = 'valido'
`;

const SQL_DESCUENTO = `
  update abonos set viajes_restantes = viajes_restantes - 1
   where id = $1 and viajes_restantes > 0
  returning viajes_restantes
`;

@Injectable()
export class BilletesService {
  constructor(
    private readonly bd: BdService,
    private readonly config: ConfigService,
  ) {}

  async listar(usuarioId: string): Promise<{ datos: Billete[]; total: number }> {
    const filas = await this.consultar<FilaBillete>(SQL_BILLETES, [usuarioId]);
    return { datos: filas.map((fila) => this.aBillete(fila)), total: filas.length };
  }

  async qr(usuarioId: string, id: string): Promise<{ id: string; qr: string }> {
    if (!UUID.test(id)) throw new NotFoundException('Billete no encontrado');

    const [fila] = await this.consultar<{ qr: string }>(SQL_QR, [id, usuarioId]);
    if (!fila) throw new NotFoundException('Billete no encontrado');

    // Se devuelve el guardado, no uno nuevo: misma petición, mismo token.
    return { id, qr: fila.qr };
  }

  async validar(revisorId: string, { qr }: ValidarBilleteDto): Promise<ResultadoValidacion> {
    const secreto = this.config.get<string>('QR_SIGNING_SECRET');
    if (!secreto) {
      throw new ServiceUnavailableException('La API no tiene configurado QR_SIGNING_SECRET');
    }

    const validadoEn = instanteAIso(new Date());
    const verificado = verificar(qr, secreto);

    if (!verificado) {
      await this.apuntar(revisorId, 'falso', { motivo: 'Firma o prefijo incorrectos' });
      return {
        estado: 'falso',
        validadoEn,
        primeraValidacion: null,
        comprobadoEnServidor: true,
      };
    }

    try {
      return verificado.prefijo === PREFIJO_BILLETE
        ? await this.validarBillete(revisorId, verificado.datos, validadoEn)
        : await this.validarAbono(revisorId, verificado.datos, validadoEn);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
  }

  private async validarBillete(
    revisorId: string,
    datos: Record<string, unknown>,
    validadoEn: string,
  ): Promise<ResultadoValidacion> {
    const id = typeof datos.id === 'string' ? datos.id : '';
    const [fila] = UUID.test(id)
      ? await this.consultar<FilaBillete>(SQL_BILLETE, [id])
      : [];

    if (!fila) {
      await this.apuntar(revisorId, 'no_existe', { motivo: 'El billete no está en la BD' });
      return {
        estado: 'no_existe',
        billete: this.desdeQr(datos),
        validadoEn,
        primeraValidacion: null,
        comprobadoEnServidor: true,
      };
    }

    const estado = this.estadoBillete(fila);
    if (estado === 'valido') {
      await this.bd.consultar(SQL_USAR, [fila.id]).catch(() => {
        throw new ServiceUnavailableException('La base de datos no está disponible');
      });
    }

    await this.apuntar(revisorId, estado, { billeteId: fila.id });

    return {
      estado,
      billete: this.aValidado(fila),
      validadoEn,
      primeraValidacion: estado === 'ya_validado' && fila.primera
        ? instanteAIso(fila.primera)
        : null,
      comprobadoEnServidor: true,
    };
  }

  private async validarAbono(
    revisorId: string,
    datos: Record<string, unknown>,
    validadoEn: string,
  ): Promise<ResultadoValidacion> {
    const referencia = typeof datos.id === 'string' ? datos.id : '';
    const [fila] = await this.consultar<FilaAbono>(SQL_ABONO, [referencia]);

    if (!fila) {
      await this.apuntar(revisorId, 'no_existe', { motivo: 'El abono no está en la BD' });
      return {
        estado: 'no_existe',
        validadoEn,
        primeraValidacion: null,
        comprobadoEnServidor: true,
      };
    }

    let estado = this.estadoAbono(fila);
    let restantes = fila.viajes_restantes;
    if (estado === 'valido' && restantes !== null) {
      const [actualizado] = await this.consultar<{ viajes_restantes: number }>(SQL_DESCUENTO, [
        fila.id,
      ]);
      restantes = actualizado?.viajes_restantes ?? restantes;
    }

    await this.apuntar(revisorId, estado, { abonoId: fila.id });

    const titular =
      typeof datos.p === 'string' ? enmascararTitular(datos.p) : enmascararTitular(fila.nombre);

    return {
      estado,
      abono: {
        id: fila.referencia,
        nombre: fila.nombre,
        titular,
        origen: fila.origen_nombre,
        destino: fila.destino_nombre,
        inicio: fila.inicio,
        fin: fila.fin,
        viajesRestantes: restantes,
      },
      validadoEn,
      primeraValidacion: null,
      comprobadoEnServidor: true,
    };
  }

  private estadoBillete(fila: FilaBillete): EstadoValidacion {
    if (fila.estado === 'anulado' || fila.reserva_estado !== 'pagada') return 'anulado';
    if (fila.expirado) return 'caducado';
    if (fila.fecha !== hoyMadrid()) return 'otro_dia';
    if (fila.estado === 'usado' || fila.primera) return 'ya_validado';
    return 'valido';
  }

  private estadoAbono(fila: FilaAbono): EstadoValidacion {
    const hoy = hoyMadrid();
    if (fila.estado !== 'activo') return 'anulado';
    if (hoy > fila.fin) return 'caducado';
    if (hoy < fila.inicio) return 'otro_dia';
    if (fila.viajes_restantes === 0) return 'agotado';
    return 'valido';
  }

  private async apuntar(
    revisorId: string,
    resultado: EstadoValidacion,
    opciones: { billeteId?: string; abonoId?: string; motivo?: string } = {},
  ): Promise<void> {
    await this.bd
      .consultar(SQL_VALIDACION, [
        opciones.billeteId ?? null,
        opciones.abonoId ?? null,
        revisorId,
        resultado,
        opciones.motivo ?? null,
      ])
      .catch(() => {
        throw new ServiceUnavailableException('La base de datos no está disponible');
      });
  }

  private aBillete(fila: FilaBillete): Billete {
    return {
      feed: fila.feed,
      viajeId: fila.viaje_id,
      id: fila.id,
      localizador: fila.referencia,
      estado: fila.estado,
      tipo: tipoVisible(fila.tipo_servicio),
      numero: numeroVisible(fila.nombre_corto, fila.numero),
      salida: intervaloAIso(fila.fecha, fila.sale),
      llegada: intervaloAIso(fila.fecha, fila.llega),
      origen: { id: fila.origen_id, nombre: fila.origen_nombre },
      destino: { id: fila.destino_id, nombre: fila.destino_nombre },
      coche: fila.coche,
      asiento: fila.asiento,
      clase: claseVisible(fila.clase),
      precio: fila.precio_centimos / 100,
      emitido: instanteAIso(fila.emitido_en),
      expira: instanteAIso(fila.expira_en),
      qr: fila.qr,
    };
  }

  private aValidado(fila: FilaBillete): BilleteValidado {
    return {
      id: fila.id,
      localizador: fila.referencia,
      pasajero: this.pasajeroDelQr(fila.qr, 'p'),
      documento: this.pasajeroDelQr(fila.qr, 'doc'),
      tipo: tipoVisible(fila.tipo_servicio),
      numero: numeroVisible(fila.nombre_corto, fila.numero) ?? '',
      salida: intervaloAIso(fila.fecha, fila.sale),
      llegada: intervaloAIso(fila.fecha, fila.llega),
      origen: fila.origen_nombre,
      destino: fila.destino_nombre,
      coche: fila.coche,
      asiento: fila.asiento,
      clase: claseVisible(fila.clase),
    };
  }

  /** El nombre y el documento viajan en el QR firmado; no hay columna para ellos. */
  private pasajeroDelQr(qr: string, clave: 'p' | 'doc'): string {
    const secreto = this.config.get<string>('QR_SIGNING_SECRET');
    if (!secreto) return '';
    const datos = verificar(qr, secreto)?.datos;
    const valor = datos?.[clave];
    return typeof valor === 'string' ? valor : '';
  }

  private desdeQr(datos: Record<string, unknown>): BilleteValidado {
    const texto = (clave: string) => (typeof datos[clave] === 'string' ? datos[clave] : '');
    return {
      id: texto('id'),
      localizador: texto('loc'),
      pasajero: texto('p'),
      documento: texto('doc'),
      tipo: texto('tipo') || 'DESCONOCIDO',
      numero: texto('num'),
      salida: texto('sal'),
      llegada: texto('lle'),
      origen: texto('o'),
      destino: texto('d'),
      coche: Number(datos.co ?? 0),
      asiento: texto('as'),
      clase: texto('cl'),
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
