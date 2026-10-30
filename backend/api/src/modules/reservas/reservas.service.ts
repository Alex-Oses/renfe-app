import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { hoyMadrid, intervaloAIso, instanteAIso } from '../../common/gtfs/tiempo.js';
import {
  claseVisible,
  enmascararDocumento,
  etiquetaAsiento,
  numeroVisible,
  referencia,
  tipoVisible,
} from '../../common/formato.js';
import { PREFIJO_BILLETE, firmar } from '../../common/qr/firma.js';
import { BdService } from '../../common/bd/bd.service.js';
import { precioSimulado } from '../../common/simulado/precio.js';
import { SERVICIO_ACTIVO } from '../../common/gtfs/sql.js';
import type { CrearReservaDto } from './dto/crear-reserva.dto.js';

export interface BilleteEmitido {
  id: string;
  qr: string;
  coche: number;
  asiento: string;
  clase: string;
  precio: number;
}

export interface ReservaCreada {
  id: string;
  localizador: string;
  estado: 'pagada';
  total: number;
  creada: string;
  billetes: BilleteEmitido[];
}

interface FilaViaje {
  nombre_corto: string | null;
  tipo_servicio: string | null;
  numero: string | null;
  sale: string;
  llega: string;
  origen_nombre: string;
  destino_nombre: string;
}

interface FilaReserva {
  id: string;
  referencia: string;
  creada_en: Date;
}

interface FilaAsiento {
  id: string;
  coche: number;
  numero: number;
  clase: string;
}

// El viaje, su producto y las horas **del trayecto vendido** (no del viaje
// completo): el billete se vende de Atocha a Zaragoza aunque el tren acabe en
// Barcelona. `$3` es la fecha de servicio y lo usa SERVICIO_ACTIVO.
const SQL_VIAJE = `
  select r.nombre_corto,
         r.tipo_servicio,
         v.numero,
         o.sale::text as sale,
         d.llega::text as llega,
         eo.nombre as origen_nombre,
         ed.nombre as destino_nombre
    from viajes v
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join horarios o on o.feed = v.feed and o.viaje_id = v.id
    join horarios d
      on d.feed = o.feed
     and d.viaje_id = o.viaje_id
     and d.secuencia > o.secuencia
    join estaciones eo on eo.id = o.estacion_id
    join estaciones ed on ed.id = d.estacion_id
   where v.feed = $1
     and v.id = $2
     and o.estacion_id = $4
     and d.estacion_id = $5
     and o.sale is not null
     and d.llega is not null
     and o.recoge
     and d.deja
     and ${SERVICIO_ACTIVO}
   order by o.secuencia, d.secuencia
   limit 1
`;

// Generación perezosa de butacas (modelo-datos §5.1): plantilla de 3 coches ×
// 40 butacas por viaje y fecha. Coche 1 preferente en los productos de AV/LD.
// Se puede repetir sin miedo (`on conflict do nothing`).
const SQL_PLANTILLA = `
  insert into asientos (feed, viaje_id, fecha_servicio, coche, numero, clase, ventanilla)
  select $1, $2, $3::date, c, n,
         case
           when c = 1 and $4 in ('ave', 'avlo', 'alvia', 'avant') then 'preferente'
           else 'turista'
         end,
         (n - 1) % 4 in (0, 3)
    from generate_series(1, 3) as c
    cross join generate_series(1, 40) as n
  on conflict (feed, viaje_id, fecha_servicio, coche, numero) do nothing
`;

// Sin Stripe: la reserva nace pagada (el pago es simulado).
const SQL_RESERVA = `
  insert into reservas (usuario_id, feed, viaje_id, fecha_servicio, origen_id, destino_id,
                        referencia, estado, importe_centimos)
  values ($1, $2, $3, $4::date, $5, $6, $7, 'pagada', $8)
  returning id, referencia, creada_en
`;

// `for update skip locked` resuelve la carrera sin bloqueos explícitos: si dos
// peticiones piden la misma butaca, una se la queda y la otra pasa a la siguiente.
const SQL_ASIENTOS = `
  select id, coche, numero, clase
    from asientos
   where feed = $1
     and viaje_id = $2
     and fecha_servicio = $3::date
     and reserva_id is null
   order by coche, numero
   for update skip locked
   limit $4
`;

const SQL_OCUPAR = `
  update asientos
     set reserva_id = $1
   where id = any($2::uuid[])
  returning id, coche, numero, clase
`;

const SQL_BILLETE = `
  insert into billetes (id, reserva_id, asiento_id, usuario_id, feed, viaje_id, fecha_servicio,
                        origen_id, destino_id, coche, asiento, clase, precio_centimos, qr, expira_en)
  values ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, $11, $12, $13, $14, $15::timestamptz)
`;

@Injectable()
export class ReservasService {
  constructor(
    private readonly bd: BdService,
    private readonly config: ConfigService,
  ) {}

  async crear(usuarioId: string, dto: CrearReservaDto): Promise<ReservaCreada> {
    if (dto.origenId === dto.destinoId) {
      throw new BadRequestException('El origen y el destino no pueden ser la misma estación');
    }
    if (dto.fecha < hoyMadrid()) {
      throw new BadRequestException('La fecha del viaje ya ha pasado');
    }

    // Se lee antes de abrir la transacción: sin secreto no hay QR que emitir.
    const secreto = this.config.get<string>('QR_SIGNING_SECRET');
    if (!secreto) {
      throw new ServiceUnavailableException('La API no tiene configurado QR_SIGNING_SECRET');
    }

    try {
      return await this.bd.transaccion((cliente) =>
        this.crearEn(cliente, usuarioId, dto, secreto),
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
  }

  private async crearEn(
    cliente: PoolClient,
    usuarioId: string,
    dto: CrearReservaDto,
    secreto: string,
  ): Promise<ReservaCreada> {
    const { rows: viajes } = await cliente.query<FilaViaje>(SQL_VIAJE, [
      dto.feed,
      dto.viajeId,
      dto.fecha,
      dto.origenId,
      dto.destinoId,
    ]);
    const viaje = viajes[0];
    if (!viaje) {
      throw new NotFoundException('Ese viaje no circula en esa fecha o el trayecto no existe');
    }

    await cliente.query(SQL_PLANTILLA, [
      dto.feed,
      dto.viajeId,
      dto.fecha,
      viaje.tipo_servicio,
    ]);

    const plazas = dto.pasajeros.length;
    const precioCentimos = Math.round(
      precioSimulado(`${dto.feed}:${dto.viajeId}:${dto.fecha}:${dto.origenId}:${dto.destinoId}`) *
        100,
    );
    const totalCentimos = precioCentimos * plazas;

    const { rows: reservas } = await cliente.query<FilaReserva>(SQL_RESERVA, [
      usuarioId,
      dto.feed,
      dto.viajeId,
      dto.fecha,
      dto.origenId,
      dto.destinoId,
      `R-${referencia()}`,
      totalCentimos,
    ]);
    const reserva = reservas[0]!;

    const { rows: libres } = await cliente.query<FilaAsiento>(SQL_ASIENTOS, [
      dto.feed,
      dto.viajeId,
      dto.fecha,
      plazas,
    ]);
    if (libres.length < plazas) {
      throw new ConflictException('No quedan butacas libres para ese viaje');
    }

    const { rows: ocupados } = await cliente.query<FilaAsiento>(SQL_OCUPAR, [
      reserva.id,
      libres.map((asiento) => asiento.id),
    ]);
    const asientos = ocupados.sort((a, b) => a.coche - b.coche || a.numero - b.numero);

    const salida = intervaloAIso(dto.fecha, viaje.sale);
    const llegada = intervaloAIso(dto.fecha, viaje.llega);
    const expira = new Date(intervaloAIso(dto.fecha, '26:00:00')).toISOString();

    const billetes: BilleteEmitido[] = [];
    for (const [indice, asiento] of asientos.entries()) {
      const pasajero = dto.pasajeros[indice]!;
      const id = randomUUID();
      const asientoEtiqueta = etiquetaAsiento(asiento.numero);
      const qr = firmar(
        PREFIJO_BILLETE,
        {
          v: 1,
          id,
          rid: reserva.id,
          loc: reserva.referencia,
          tipo: tipoVisible(viaje.tipo_servicio),
          num: numeroVisible(viaje.nombre_corto, viaje.numero),
          sal: salida,
          lle: llegada,
          o: viaje.origen_nombre,
          d: viaje.destino_nombre,
          co: asiento.coche,
          as: asientoEtiqueta,
          cl: claseVisible(asiento.clase),
          p: pasajero.nombre,
          doc: enmascararDocumento(pasajero.documento),
        },
        secreto,
      );

      await cliente.query(SQL_BILLETE, [
        id,
        reserva.id,
        asiento.id,
        usuarioId,
        dto.feed,
        dto.viajeId,
        dto.fecha,
        dto.origenId,
        dto.destinoId,
        asiento.coche,
        asientoEtiqueta,
        asiento.clase,
        precioCentimos,
        qr,
        expira,
      ]);

      billetes.push({
        id,
        qr,
        coche: asiento.coche,
        asiento: asientoEtiqueta,
        clase: claseVisible(asiento.clase),
        precio: precioCentimos / 100,
      });
    }

    return {
      id: reserva.id,
      localizador: reserva.referencia,
      estado: 'pagada',
      total: totalCentimos / 100,
      creada: instanteAIso(reserva.creada_en),
      billetes,
    };
  }
}
