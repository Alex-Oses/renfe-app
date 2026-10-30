import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { SERVICIO_ACTIVO } from '../../common/gtfs/sql.js';
import { duracionMin, intervaloAIso } from '../../common/gtfs/tiempo.js';
import type { BuscarTrenesDto } from './dto/buscar-trenes.dto.js';
import { plazasSimuladas, precioSimulado } from './simulado.js';

export interface Tren {
  id: string;
  feed: string;
  tripId: string;
  fecha: string;
  linea: string;
  tipo: string;
  numero: string | null;
  origen: { id: string; nombre: string };
  destino: { id: string; nombre: string };
  salida: string;
  llegada: string;
  duracionMin: number;
  numParadas: number;
  retrasoSeg: number | null;
  precioDesde: number;
  plazasLibres: number;
}

export interface Parada {
  seq: number;
  estacion: { id: string; nombre: string };
  llega: string | null;
  sale: string | null;
  retrasoSeg: number | null;
}

export interface TrenDetalle {
  feed: string;
  tripId: string;
  fecha: string;
  linea: string;
  tipo: string;
  numero: string | null;
  origen: { id: string; nombre: string };
  destino: { id: string; nombre: string };
  salida: string;
  llegada: string;
  retrasoSeg: number | null;
  paradas: Parada[];
  /** Trazado real [lat, lon] para el mapa; `null` si no hay geometría (se dibuja parada a parada). */
  recorrido: [number, number][] | null;
}

interface FilaParada {
  feed: string;
  viaje_id: string;
  numero: string | null;
  nombre_corto: string | null;
  nombre: string;
  tipo_servicio: string | null;
  secuencia: number;
  estacion_id: string;
  estacion_nombre: string;
  llega: string | null;
  sale: string | null;
}

interface FilaTren {
  feed: string;
  viaje_id: string;
  numero: string | null;
  nombre_corto: string | null;
  nombre: string;
  tipo_servicio: string | null;
  origen_id: string;
  origen_nombre: string;
  destino_id: string;
  destino_nombre: string;
  sale: string;
  llega: string;
  num_paradas: string;
  total: string;
}

// Viajes directos: la misma estación de origen y de destino dentro del mismo
// viaje, en orden. La fecha se resuelve con `calendarios` (día de la semana y
// rango) y `calendario_excepciones` (festivos y refuerzos), como pide el modelo.
const SQL_BUSCAR = `
  select v.feed,
         v.id as viaje_id,
         v.numero,
         r.nombre_corto,
         r.nombre,
         r.tipo_servicio,
         o.estacion_id as origen_id,
         eo.nombre as origen_nombre,
         d.estacion_id as destino_id,
         ed.nombre as destino_nombre,
         o.sale::text as sale,
         d.llega::text as llega,
         (select count(*)
            from horarios h
           where h.feed = v.feed
             and h.viaje_id = v.id
             and h.secuencia between o.secuencia and d.secuencia) as num_paradas,
         count(*) over () as total
    from horarios o
    join horarios d
      on d.feed = o.feed
     and d.viaje_id = o.viaje_id
     and d.secuencia > o.secuencia
    join viajes v on v.feed = o.feed and v.id = o.viaje_id
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join estaciones eo on eo.id = o.estacion_id
    join estaciones ed on ed.id = d.estacion_id
   where o.estacion_id = $1
     and d.estacion_id = $2
     and o.sale is not null
     and d.llega is not null
     and o.recoge
     and d.deja
     and ${SERVICIO_ACTIVO}
   order by o.sale
   limit $4
`;

const lineaDe = (fila: { nombre_corto: string | null; nombre: string }) =>
  fila.nombre_corto ?? fila.nombre;
const tipoDe = (tipoServicio: string | null) => tipoServicio?.toUpperCase() ?? 'DESCONOCIDO';
const numeroDe = (nombreCorto: string | null) => nombreCorto?.match(/(\d+)\s*$/)?.[1] ?? null;

// El feed de Renfe publica a veces el mismo tren con dos trip_id activos el mismo día
// (p. ej. 0307312026-10-28 y 0307322026-10-28): se queda el primero por número y salida.
export function sinViajesDuplicados<T extends { numero: string | null; sale: string; viaje_id: string }>(
  filas: T[],
): T[] {
  const vistos = new Set<string>();
  return filas.filter((f) => {
    const clave = `${f.numero ?? f.viaje_id}|${f.sale}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

// Todas las paradas del viaje, en orden. El viaje tiene que circular ese día.
const SQL_DETALLE = `
  select v.feed,
         v.id as viaje_id,
         v.numero,
         r.nombre_corto,
         r.nombre,
         r.tipo_servicio,
         h.secuencia,
         h.estacion_id,
         e.nombre as estacion_nombre,
         h.llega::text as llega,
         h.sale::text as sale
    from viajes v
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join horarios h on h.feed = v.feed and h.viaje_id = v.id
    join estaciones e on e.id = h.estacion_id
   where v.feed = $1
     and v.id = $2
     and ${SERVICIO_ACTIVO}
   order by h.secuencia
`;

const SQL_ESTACIONES = 'select id from estaciones where id = any($1::text[])';

@Injectable()
export class TrenesService {
  constructor(private readonly bd: BdService) {}

  async buscar({ origen, destino, fecha, limit }: BuscarTrenesDto): Promise<{
    datos: Tren[];
    total: number;
  }> {
    let filas: FilaTren[];
    try {
      ({ rows: filas } = await this.bd.consultar<FilaTren>(SQL_BUSCAR, [
        origen,
        destino,
        fecha,
        limit,
      ]));

      if (filas.length === 0) {
        const { rows: estaciones } = await this.bd.consultar<{ id: string }>(SQL_ESTACIONES, [
          [origen, destino],
        ]);
        if (estaciones.length < new Set([origen, destino]).size) {
          throw new NotFoundException('Estación de origen o destino inexistente');
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }

    const unicas = sinViajesDuplicados(filas);
    return {
      datos: unicas.map((fila) => {
        const clave = `${fila.feed}:${fila.viaje_id}:${fecha}`;
        return {
          id: clave,
          feed: fila.feed,
          tripId: fila.viaje_id,
          fecha,
          linea: lineaDe(fila),
          tipo: tipoDe(fila.tipo_servicio),
          numero: fila.numero ?? numeroDe(fila.nombre_corto),
          origen: { id: fila.origen_id, nombre: fila.origen_nombre },
          destino: { id: fila.destino_id, nombre: fila.destino_nombre },
          salida: intervaloAIso(fecha, fila.sale),
          llegada: intervaloAIso(fecha, fila.llega),
          duracionMin: duracionMin(fila.sale, fila.llega),
          numParadas: Number(fila.num_paradas),
          retrasoSeg: null,
          precioDesde: precioSimulado(clave),
          plazasLibres: plazasSimuladas(clave),
        };
      }),
      total: filas.length > 0 ? Number(filas[0].total) - (filas.length - unicas.length) : 0,
    };
  }

  async detalle(feed: string, tripId: string, fecha: string): Promise<TrenDetalle> {
    let filas: FilaParada[];
    try {
      ({ rows: filas } = await this.bd.consultar<FilaParada>(SQL_DETALLE, [feed, tripId, fecha]));
      if (filas.length === 0) {
        // El mapa pide el trip_id del tiempo real, cuya fecha final puede no coincidir con la del catálogo (AV/LD).
        const { rows } = await this.bd.consultar<{ id: string }>(SQL_VIAJE_EQUIVALENTE, [feed, tripId]);
        if (rows[0]) {
          tripId = rows[0].id;
          ({ rows: filas } = await this.bd.consultar<FilaParada>(SQL_DETALLE, [feed, tripId, fecha]));
        }
      }
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }

    if (filas.length === 0) {
      throw new NotFoundException('Ese viaje no circula en esa fecha');
    }

    const primera = filas[0]!;
    const ultima = filas.at(-1)!;
    const recorrido = await this.recorrido(feed, tripId);

    return {
      feed: primera.feed,
      tripId: primera.viaje_id,
      fecha,
      linea: lineaDe(primera),
      tipo: tipoDe(primera.tipo_servicio),
      numero: primera.numero ?? numeroDe(primera.nombre_corto),
      origen: { id: primera.estacion_id, nombre: primera.estacion_nombre },
      destino: { id: ultima.estacion_id, nombre: ultima.estacion_nombre },
      // GTFS exige hora de llegada o de salida en cada parada: la que falte se toma de la otra.
      salida: intervaloAIso(fecha, (primera.sale ?? primera.llega)!),
      llegada: intervaloAIso(fecha, (ultima.llega ?? ultima.sale)!),
      retrasoSeg: null,
      paradas: filas.map((fila) => ({
        seq: fila.secuencia,
        estacion: { id: fila.estacion_id, nombre: fila.estacion_nombre },
        llega: fila.llega === null ? null : intervaloAIso(fecha, fila.llega),
        sale: fila.sale === null ? null : intervaloAIso(fecha, fila.sale),
        retrasoSeg: null,
      })),
      recorrido,
    };
  }

  // Forma de shapes.txt (Cercanías) o, si no hay, los tramos por las vías de OSM entre paradas
  // seguidas; donde falte un tramo, línea recta entre esas dos paradas. Un fallo aquí no tumba el detalle.
  private async recorrido(feed: string, tripId: string): Promise<[number, number][] | null> {
    try {
      const { rows } = await this.bd.consultar<{ forma: Punto[] | null; tramos: Punto[][] | null }>(SQL_RECORRIDO, [feed, tripId]);
      const { forma, tramos } = rows[0] ?? { forma: null, tramos: null };
      if (forma?.length) return forma;
      return tramos?.length ? unirTramos(tramos) : null;
    } catch {
      return null;
    }
  }
}

type Punto = [number, number];

/** Encadena tramos sin repetir el punto de unión (el final de uno es el principio del siguiente). */
export function unirTramos(tramos: Punto[][]): Punto[] {
  const salida: Punto[] = [];
  for (const tramo of tramos) {
    for (const p of tramo) {
      const ultimo = salida.at(-1);
      if (!ultimo || ultimo[0] !== p[0] || ultimo[1] !== p[1]) salida.push(p);
    }
  }
  return salida;
}

const SQL_VIAJE_EQUIVALENTE = `
  select id
    from viajes
   where feed = $1
     and $2 ~ '\\d{4}-\\d{2}-\\d{2}$'
     and id like left($2, -10) || '%'
     and right(id, 10) <= right($2, 10)
   order by right(id, 10) desc
   limit 1
`;

const SQL_RECORRIDO = `
  with viaje as (
    select forma_id from viajes where feed = $1 and id = $2
  ),
  paradas as (
    select h.secuencia, h.estacion_id,
           lead(h.estacion_id) over (order by h.secuencia) as siguiente
      from horarios h
     where h.feed = $1 and h.viaje_id = $2
  )
  select (select f.puntos from formas f join viaje v on f.feed = $1 and f.id = v.forma_id) as forma,
         (select jsonb_agg(
                   coalesce(t.puntos, jsonb_build_array(jsonb_build_array(eo.lat, eo.lon),
                                                        jsonb_build_array(ed.lat, ed.lon)))
                   order by p.secuencia)
            from paradas p
            join estaciones eo on eo.id = p.estacion_id
            join estaciones ed on ed.id = p.siguiente
            left join tramos_via t on t.origen_id = p.estacion_id and t.destino_id = p.siguiente) as tramos
`;
