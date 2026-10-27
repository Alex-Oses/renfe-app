import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { BdService } from '../../common/bd/bd.service.js';
import type { BuscarEstacionesDto } from './dto/buscar-estaciones.dto.js';

export interface Estacion {
  id: string;
  nombre: string;
  ciudad: string;
  lat: number;
  lon: number;
  feeds: string[];
}

interface FilaEstacion {
  id: string;
  nombre: string;
  ciudad: string | null;
  lat: number;
  lon: number;
  feeds: string[];
  total: string;
}

// shortcut: translate() en vez de `unaccent`, para no depender de una extensión
// que el modelo de datos no prevé. No usa el índice pg_trgm de `nombre`: con
// ~1.150 estaciones da igual. Si la tabla crece, añadir unaccent + índice.
const SQL_BUSCAR = `
  select e.id,
         e.nombre,
         e.ciudad,
         e.lat,
         e.lon,
         coalesce(array_agg(distinct ef.feed) filter (where ef.feed is not null), '{}') as feeds,
         count(*) over () as total
    from estaciones e
    left join estacion_feeds ef on ef.estacion_id = e.id
   where translate(lower(e.nombre), 'áéíóúüñ', 'aeiouun')
         like '%' || translate(lower($1), 'áéíóúüñ', 'aeiouun') || '%'
     and ($2::text is null
          or exists (select 1 from estacion_feeds f
                      where f.estacion_id = e.id and f.feed = $2))
   group by e.id
   order by e.nombre
   limit $3
`;

@Injectable()
export class EstacionesService {
  constructor(private readonly bd: BdService) {}

  async buscar({ q, feed, limit }: BuscarEstacionesDto): Promise<{
    datos: Estacion[];
    total: number;
  }> {
    let filas: FilaEstacion[];
    try {
      ({ rows: filas } = await this.bd.consultar<FilaEstacion>(SQL_BUSCAR, [
        q.trim(),
        feed ?? null,
        limit,
      ]));
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible');
    }

    return {
      datos: filas.map((fila) => ({
        id: fila.id,
        nombre: fila.nombre,
        ciudad: fila.ciudad ?? '',
        lat: fila.lat,
        lon: fila.lon,
        feeds: fila.feeds,
      })),
      total: filas.length > 0 ? Number(filas[0].total) : 0,
    };
  }
}
