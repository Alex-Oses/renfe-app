import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
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

interface FilaTren {
  feed: string;
  viaje_id: string;
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
     and (
       exists (select 1 from calendario_excepciones x
                where x.feed = v.feed
                  and x.servicio_id = v.servicio_id
                  and x.fecha = $3::date
                  and x.tipo = 'añadido')
       or (
         not exists (select 1 from calendario_excepciones x
                      where x.feed = v.feed
                        and x.servicio_id = v.servicio_id
                        and x.fecha = $3::date
                        and x.tipo = 'eliminado')
         and exists (select 1 from calendarios c
                      where c.feed = v.feed
                        and c.id = v.servicio_id
                        and $3::date between c.inicio and c.fin
                        and case extract(isodow from $3::date)
                              when 1 then c.lunes
                              when 2 then c.martes
                              when 3 then c.miercoles
                              when 4 then c.jueves
                              when 5 then c.viernes
                              when 6 then c.sabado
                              else c.domingo
                            end)
       )
     )
   order by o.sale
   limit $4
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

    return {
      datos: filas.map((fila) => {
        const clave = `${fila.feed}:${fila.viaje_id}:${fecha}`;
        return {
          id: clave,
          feed: fila.feed,
          tripId: fila.viaje_id,
          fecha,
          linea: fila.nombre_corto ?? fila.nombre,
          tipo: fila.tipo_servicio?.toUpperCase() ?? 'DESCONOCIDO',
          numero: fila.nombre_corto?.match(/(\d+)\s*$/)?.[1] ?? null,
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
      total: filas.length > 0 ? Number(filas[0].total) : 0,
    };
  }
}
