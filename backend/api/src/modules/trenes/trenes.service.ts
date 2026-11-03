import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import { SERVICIO_ACTIVO } from '../../common/gtfs/sql.js';
import { duracionMin, intervaloAIso } from '../../common/gtfs/tiempo.js';
import type { BuscarTrenesDto } from './dto/buscar-trenes.dto.js';
import { claseVisible, etiquetaAsiento } from '../../common/formato.js';
import { kmTrayecto, plazasSimuladas, precioSimulado } from './simulado.js';
import { esperaSuficiente } from './transbordos.js';

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
  km_lat_o: number;
  km_lon_o: number;
  km_lat_d: number;
  km_lon_d: number;
  sale: string;
  llega: string;
  num_paradas: string;
  total: string;
}

// Estaciones que sirven a cada punta de la búsqueda (`$1` origen, `$2` destino). Devuelve
// `origenes` y `destinos` como arrays; `null` si alguna de las dos no existe.
// - Ciudades distintas: todas las estaciones de cada ciudad. El usuario busca «Tarragona →
//   Barcelona», no una estación suelta, y así también salen los viajes que no son de la estación
//   exacta (antes: sin resultados).
// - Misma ciudad: solo las pedidas (buscar Sants → Passeig no debe devolver toda Barcelona).
// Muchas de Cercanías no traen `ciudad`: toman la de la estación con ciudad más cercana y, al
// expandir, entran si están a ~3,5 km de la estación pedida. La ciudad inferida también tiene tope
// (~5,5 km): sin él, una estación sin ciudad heredaba la de otra región (Tarragona → Barcelona) y la
// búsqueda devolvía trenes de otra ciudad (ticket 007).
const SQL_SERVICIO = `
  with lugar as (
    select e.id, e.lat, e.lon,
           coalesce(e.ciudad, (select c.ciudad from estaciones c
                                where c.ciudad is not null
                                  and abs(c.lat - e.lat) < 0.05 and abs(c.lon - e.lon) < 0.06
                                order by (c.lat - e.lat) ^ 2 + (c.lon - e.lon) ^ 2 limit 1)) as ciudad
      from estaciones e where e.id in ($1, $2)
  ), par as (
    select (select ciudad from lugar where id = $1) as co,
           (select ciudad from lugar where id = $2) as cd
  )
  select
    (select array_agg(s.id)
       from estaciones s, lugar l, par p
      where l.id = $1
        and (s.id = $1
             or (p.co is distinct from p.cd
                 and (s.ciudad = l.ciudad
                      or (s.ciudad is null
                          and abs(s.lat - l.lat) < 0.032 and abs(s.lon - l.lon) < 0.042))))) as origenes,
    (select array_agg(s.id)
       from estaciones s, lugar l, par p
      where l.id = $2
        and (s.id = $2
             or (p.co is distinct from p.cd
                 and (s.ciudad = l.ciudad
                      or (s.ciudad is null
                          and abs(s.lat - l.lat) < 0.032 and abs(s.lon - l.lon) < 0.042))))) as destinos
`;

// Viajes directos entre cualquier estación de `$1` y de `$2` (`text[]`), dentro del mismo viaje y
// en orden. La fecha se resuelve con `calendarios` (día de la semana y rango) y
// `calendario_excepciones` (festivos y refuerzos), como pide el modelo.
// El mismo tren en dos feeds (mismas estaciones, salida y llegada) cuenta una vez: gana avld.
// Pide el doble del límite porque luego se quitan en JS los trip_id repetidos del mismo número.
const SQL_BUSCAR = `
  select *, count(*) over () as total from (
  select distinct on (o.estacion_id, d.estacion_id, o.sale, d.llega)
         v.feed,
         v.id as viaje_id,
         v.numero,
         r.nombre_corto,
         r.nombre,
         r.tipo_servicio,
         o.estacion_id as origen_id,
         eo.nombre as origen_nombre,
         d.estacion_id as destino_id,
         ed.nombre as destino_nombre,
         eo.lat as km_lat_o, eo.lon as km_lon_o, ed.lat as km_lat_d, ed.lon as km_lon_d,
         o.sale::text as sale,
         d.llega::text as llega,
         (select count(*)
            from horarios h
           where h.feed = v.feed
             and h.viaje_id = v.id
             and h.secuencia between o.secuencia and d.secuencia) as num_paradas
    from horarios o
    join horarios d
      on d.feed = o.feed
     and d.viaje_id = o.viaje_id
     and d.secuencia > o.secuencia
    join viajes v on v.feed = o.feed and v.id = o.viaje_id
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join estaciones eo on eo.id = o.estacion_id
    join estaciones ed on ed.id = d.estacion_id
   where o.estacion_id = any($1::text[])
     and d.estacion_id = any($2::text[])
     and o.sale is not null
     and d.llega is not null
     and o.recoge
     and d.deja
     and ${SERVICIO_ACTIVO}
   order by o.estacion_id, d.estacion_id, o.sale, d.llega, v.feed = 'avld' desc
  ) t
   order by sale, origen_id, destino_id
   limit $4 * 2
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

// El mismo tren sale en `avld` y en `cercanias` con trip_id y número distintos (15000 vs R15):
// mismas estaciones, salida y llegada = mismo tren. Se queda el primero; el SQL ordena `avld` delante.
export function sinDuplicadosEntreFeeds<
  T extends { origen_id: string; destino_id: string; sale: string; llega: string },
>(filas: T[]): T[] {
  const vistos = new Set<string>();
  return filas.filter((f) => {
    const clave = `${f.origen_id}|${f.destino_id}|${f.sale}|${f.llega}`;
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

const aTren = (fila: FilaTren, fecha: string): Tren => {
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
          precioDesde: precioSimulado(
            fila.tipo_servicio,
            kmTrayecto(fila.km_lat_o, fila.km_lon_o, fila.km_lat_d, fila.km_lon_d),
            `${fila.feed}:${fila.viaje_id}:${fecha}:${fila.origen_id}:${fila.destino_id}`,
          ),
          plazasLibres: plazasSimuladas(clave),
        };
};

export interface OpcionTransbordo {
  tramos: [Tren, Tren];
  transbordo: { id: string; nombre: string };
  /** `true` si el segundo tren sale de otra estación de la misma ciudad (`transbordoSalida`). */
  cambioEstacion?: boolean;
  transbordoSalida?: { id: string; nombre: string };
  esperaMin: number;
  duracionMin: number;
  precio: number;
}

// Una opción por primer tren: el enlace que antes llega. `$3` es la fecha que usa SERVICIO_ACTIVO.
const COLUMNAS_TRAMO = `
         v.feed, v.id as viaje_id, v.numero, r.nombre_corto, r.nombre, r.tipo_servicio,
         o.estacion_id as origen_id, eo.nombre as origen_nombre,
         d.estacion_id as destino_id, ed.nombre as destino_nombre,
         eo.lat as km_lat_o, eo.lon as km_lon_o, ed.lat as km_lat_d, ed.lon as km_lon_d,
         o.sale::text as sale, d.llega::text as llega,
         (d.secuencia - o.secuencia + 1)::text as num_paradas, '0' as total,
         o.sale as sale_i, d.llega as llega_i,
         coalesce(eo.ciudad, o.estacion_id) as origen_lugar, coalesce(ed.ciudad, d.estacion_id) as destino_lugar`;
const ENTRE_PARADAS = `
    from horarios o
    join horarios d on d.feed = o.feed and d.viaje_id = o.viaje_id and d.secuencia > o.secuencia
    join viajes v on v.feed = o.feed and v.id = o.viaje_id
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join estaciones eo on eo.id = o.estacion_id
    join estaciones ed on ed.id = d.estacion_id`;
// El cambio vale en la misma estación (15 min) o en otra de la misma ciudad (30 min, `cambio_estacion`).
// Luego: una opción por primer tren, una por par salida/llegada (gana avld) y fuera las dominadas
// (otra sale igual o más tarde y llega igual o antes). Quedan las mejores, por llegada.
const SQL_TRANSBORDOS = `with ida as (
    select ${COLUMNAS_TRAMO} ${ENTRE_PARADAS}
     where o.estacion_id = any($1::text[]) and d.estacion_id <> all($2::text[])
       and o.sale is not null and d.llega is not null and o.recoge and d.deja and ${SERVICIO_ACTIVO}
  ), sigue as (
    select ${COLUMNAS_TRAMO} ${ENTRE_PARADAS}
     where d.estacion_id = any($2::text[]) and o.estacion_id <> all($1::text[])
       and o.sale is not null and d.llega is not null and o.recoge and d.deja and ${SERVICIO_ACTIVO}
  ), enlaces as (
    select distinct on (a.viaje_id) to_jsonb(a) as a, to_jsonb(b) as b, a.sale_i, b.llega_i,
           a.feed = 'avld' and b.feed = 'avld' as solo_avld
      from ida a
      join sigue b
        on b.origen_lugar = a.destino_lugar
       and b.viaje_id <> a.viaje_id
       and b.sale_i <= a.llega_i + interval '3 hours'
       and b.sale_i >= a.llega_i + case when b.origen_id = a.destino_id
                                        then interval '15 minutes' else interval '30 minutes' end
     order by a.viaje_id, b.llega_i, a.llega_i desc
  ), unicas as (
    select distinct on (sale_i, llega_i) * from enlaces order by sale_i, llega_i, solo_avld desc
  )
  select a, b from unicas u
   where not exists (select 1 from unicas w
                      where w.sale_i >= u.sale_i and w.llega_i <= u.llega_i
                        and (w.sale_i > u.sale_i or w.llega_i < u.llega_i))
   order by llega_i limit $4
`;

@Injectable()
export class TrenesService {
  constructor(private readonly bd: BdService) {}

  // La expansión por ciudad cambia poco y se pide en cada búsqueda: se guarda en memoria.
  private readonly cacheEstaciones = new Map<string, { origenes: string[]; destinos: string[] }>();

  /** Estaciones que sirven a cada punta; `NotFoundException` si alguna no existe. */
  private async estacionesDe(origen: string, destino: string) {
    const clave = `${origen}|${destino}`;
    const guardado = this.cacheEstaciones.get(clave);
    if (guardado) return guardado;

    const { rows } = await this.bd.consultar<{
      origenes: string[] | null;
      destinos: string[] | null;
    }>(SQL_SERVICIO, [origen, destino]);
    const fila = rows[0];
    if (!fila?.origenes || !fila.destinos) {
      throw new NotFoundException('Estación de origen o destino inexistente');
    }

    const valor = { origenes: fila.origenes, destinos: fila.destinos };
    if (this.cacheEstaciones.size > 500) this.cacheEstaciones.clear();
    this.cacheEstaciones.set(clave, valor);
    return valor;
  }

  async buscar({ origen, destino, fecha, limit }: BuscarTrenesDto): Promise<{
    datos: Tren[];
    total: number;
  }> {
    let filas: FilaTren[];
    try {
      const { origenes, destinos } = await this.estacionesDe(origen, destino);
      ({ rows: filas } = await this.bd.consultar<FilaTren>(SQL_BUSCAR, [
        origenes,
        destinos,
        fecha,
        limit,
      ]));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }

    const unicas = sinDuplicadosEntreFeeds(sinViajesDuplicados(filas));
    return {
      datos: unicas.slice(0, limit).map((fila) => aTren(fila, fecha)),
      total: filas.length > 0 ? Number(filas[0].total) - (filas.length - unicas.length) : 0,
    };
  }

  async transbordos({ origen, destino, fecha, limit }: BuscarTrenesDto): Promise<{
    datos: OpcionTransbordo[];
    total: number;
  }> {
    let filas: { a: FilaTren; b: FilaTren }[];
    try {
      const { origenes, destinos } = await this.estacionesDe(origen, destino);
      ({ rows: filas } = await this.bd.consultar<{ a: FilaTren; b: FilaTren }>(SQL_TRANSBORDOS, [
        origenes,
        destinos,
        fecha,
        limit,
      ]));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
    const datos = filas
      .map(({ a, b }) => {
        const tramos: [Tren, Tren] = [aTren(a, fecha), aTren(b, fecha)];
        const cambioEstacion = a.destino_id !== b.origen_id;
        return {
          tramos,
          transbordo: { id: a.destino_id, nombre: a.destino_nombre },
          cambioEstacion,
          ...(cambioEstacion && { transbordoSalida: { id: b.origen_id, nombre: b.origen_nombre } }),
          // Se recalcula con los ISO: `minutosDe` fallaba al cruzar la medianoche.
          esperaMin: Math.round(
            (Date.parse(tramos[1].salida) - Date.parse(tramos[0].llegada)) / 60_000,
          ),
          duracionMin: Math.round(
            (Date.parse(tramos[1].llegada) - Date.parse(tramos[0].salida)) / 60_000,
          ),
          precio: Math.round((tramos[0].precioDesde + tramos[1].precioDesde) * 100) / 100,
        };
      })
      // Defensa en profundidad: si el SQL o los datos cambian, nunca sale un enlace imposible.
      .filter((opcion) =>
        esperaSuficiente(opcion.tramos[0].llegada, opcion.tramos[1].salida, opcion.cambioEstacion),
      );
    return { datos, total: datos.length };
  }

  /** Mapa de butacas del viaje: 3 coches de 40 plazas; ocupada = con reserva en vigor. */
  async asientos(feed: string, tripId: string, fecha: string, origen?: string, destino?: string) {
    let tipo: string | null = null;
    let km = 0;
    const ocupadas = new Set<string>();
    try {
      const [viaje, filas, estaciones] = await Promise.all([
        this.bd.consultar<{ tipo_servicio: string | null }>(
          'select r.tipo_servicio from viajes v join rutas r on r.feed = v.feed and r.id = v.ruta_id where v.feed = $1 and v.id = $2',
          [feed, tripId],
        ),
        this.bd.consultar<{ coche: number; numero: number }>(
          'select coche, numero from asientos where feed = $1 and viaje_id = $2 and fecha_servicio = $3::date and reserva_id is not null',
          [feed, tripId, fecha],
        ),
        this.bd.consultar<{ id: string; lat: number; lon: number }>(
          'select id, lat, lon from estaciones where id = any($1::text[])',
          [[origen ?? '', destino ?? '']],
        ),
      ]);
      if (!viaje.rows[0]) throw new NotFoundException('Ese viaje no existe');
      tipo = viaje.rows[0].tipo_servicio;
      for (const f of filas.rows) ocupadas.add(`${f.coche}-${f.numero}`);
      const o = estaciones.rows.find((e) => e.id === origen);
      const d = estaciones.rows.find((e) => e.id === destino);
      if (o && d) km = kmTrayecto(o.lat, o.lon, d.lat, d.lon);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }
    const precio = precioSimulado(tipo, km, `${feed}:${tripId}:${fecha}:${origen}:${destino}`);
    const datos = [1, 2, 3].flatMap((coche) =>
      Array.from({ length: 40 }, (_, i) => {
        const numero = i + 1;
        return {
          id: `${coche}-${etiquetaAsiento(numero)}`,
          coche,
          fila: Math.ceil(numero / 4),
          letra: 'ABCD'[i % 4]!,
          clase: claseVisible(coche === 1 && ['ave', 'avlo', 'alvia', 'avant'].includes(tipo ?? '') ? 'preferente' : 'turista'),
          libre: !ocupadas.has(`${coche}-${numero}`),
          precio,
        };
      }),
    );
    return { datos, total: datos.length };
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
