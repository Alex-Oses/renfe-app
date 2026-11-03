import type { PoolClient } from 'pg';
import { SERVICIO_ACTIVO } from '../gtfs/sql.js';
import { kmTrayecto, precioSimulado } from './precio.js';

export interface Trayecto {
  feed: string;
  viajeId: string;
  fecha: string;
  origenId: string;
  destinoId: string;
}

// Misma clave que usa `reservas.service.ts` al crear la reserva: así el importe que se enseña
// antes de pagar y el que se cobra salen del mismo precio determinista.
const claveTrayecto = (t: Trayecto) =>
  `${t.feed}:${t.viajeId}:${t.fecha}:${t.origenId}:${t.destinoId}`;

const SQL = `
  select r.tipo_servicio,
         eo.lat as lat_o, eo.lon as lon_o, ed.lat as lat_d, ed.lon as lon_d
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

/** Precio base de una butaca para ese trayecto, o `null` si el viaje o el trayecto no existen. */
export async function precioAsientoDe(cliente: PoolClient, t: Trayecto): Promise<number | null> {
  const { rows } = await cliente.query<{
    tipo_servicio: string | null;
    lat_o: number;
    lon_o: number;
    lat_d: number;
    lon_d: number;
  }>(SQL, [t.feed, t.viajeId, t.fecha, t.origenId, t.destinoId]);
  const viaje = rows[0];
  if (!viaje) return null;
  return precioSimulado(
    viaje.tipo_servicio,
    kmTrayecto(viaje.lat_o, viaje.lon_o, viaje.lat_d, viaje.lon_d),
    claveTrayecto(t),
  );
}
