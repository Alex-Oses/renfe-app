// Cruza las posiciones de GTFS-RT (solo traen trip_id y parada) con el catálogo de la BD para
// rellenar los «campos del viaje para el mapa» del contrato (nombre, origen, destino, próxima parada
// y llegada) y saber si el tren va a la hora aunque Renfe no publique su retraso.
import type { BdService } from '../../common/bd/bd.service.js';
import type { Feed } from '../../common/gtfs/feeds.js';
import { hoyMadrid, instanteAIso, intervaloAIso, sumarDias } from '../../common/gtfs/tiempo.js';

export type EstadoHorario = 'a_tiempo' | 'retraso' | 'adelanto' | 'sin_datos';

export interface Estacion {
  id: string;
  nombre: string;
}

export interface CamposViaje {
  nombre: string | null;
  linea: string | null;
  origen: Estacion | null;
  destino: Estacion | null;
  proximaParada: (Estacion & { llegada: string | null }) | null;
  llegadaDestino: string | null;
  retrasoFuente: 'renfe' | 'horario' | null;
  estadoHorario: EstadoHorario;
}

export interface Enriquecible {
  feed: Feed;
  tripId: string;
  estado: string | null;
  paradaActual: string | null;
  retrasoSeg: number | null;
}

export type Enriquecida<T> = T & CamposViaje;

interface FilaViaje {
  viaje_id: string;
  numero: string | null;
  nombre_corto: string | null;
  origen_id: string;
  origen_nombre: string;
  destino_id: string;
  destino_nombre: string;
  llegada: string;
  h_llega: string | null;
  h_sale: string | null;
  h_estacion_id: string | null;
  h_estacion_nombre: string | null;
  sig_id: string | null;
  sig_nombre: string | null;
  sig_llega: string | null;
}

// Un viaje por trip_id. La parada actual es un stop_id del feed: se traduce con estacion_feeds.
// `sig_*` es la parada siguiente a la actual (para cuando el tren está parado en ella).
const SQL = `
  with p(viaje_id, stop_id) as (select * from unnest($2::text[], $3::text[]))
  select distinct on (v.id)
         v.id as viaje_id, v.numero, r.nombre_corto,
         v.origen_id, eo.nombre as origen_nombre, v.destino_id, ed.nombre as destino_nombre,
         v.llegada::text as llegada,
         h.llega::text as h_llega, h.sale::text as h_sale,
         h.estacion_id as h_estacion_id, eh.nombre as h_estacion_nombre,
         sig.estacion_id as sig_id, es.nombre as sig_nombre, sig.llega::text as sig_llega
    from p
    join viajes v on v.feed = $1 and v.id = p.viaje_id
    join rutas r on r.feed = v.feed and r.id = v.ruta_id
    join estaciones eo on eo.id = v.origen_id
    join estaciones ed on ed.id = v.destino_id
    left join estacion_feeds ef on ef.feed = $1 and ef.stop_id = p.stop_id
    left join horarios h
      on h.feed = v.feed and h.viaje_id = v.id and h.estacion_id = coalesce(ef.estacion_id, p.stop_id)
    left join estaciones eh on eh.id = h.estacion_id
    left join lateral (
      select h2.estacion_id, h2.llega
        from horarios h2
       where h2.feed = v.feed and h2.viaje_id = v.id and h2.secuencia > h.secuencia
       order by h2.secuencia
       limit 1
    ) sig on true
    left join estaciones es on es.id = sig.estacion_id
   order by v.id, h.secuencia
`;

/** Margen para considerar que un tren va «a tiempo» (Renfe redondea a minutos). */
const MARGEN_SEG = 180;

export function estadoHorario(retrasoSeg: number | null): EstadoHorario {
  if (retrasoSeg === null) return 'sin_datos';
  if (retrasoSeg >= MARGEN_SEG) return 'retraso';
  if (retrasoSeg <= -MARGEN_SEG) return 'adelanto';
  return 'a_tiempo';
}

/** Día de servicio: hoy, o ayer si la hora queda > 12 h en el futuro (trenes que cruzan la medianoche). */
function fechaServicio(intervalo: string, ahora: Date): string {
  const hoy = hoyMadrid(ahora);
  return Date.parse(intervaloAIso(hoy, intervalo)) - ahora.getTime() > 12 * 3600_000
    ? sumarDias(hoy, -1)
    : hoy;
}

/**
 * Retraso estimado con el horario de la BD en la parada actual frente a `ahora`.
 * Parado en la estación: cuenta desde la salida prevista. En camino: desde la llegada prevista.
 * Antes de la hora prevista da 0: con GTFS-RT no se puede saber si va adelantado.
 */
export function retrasoPorHorario(
  estado: string | null,
  llega: string | null,
  sale: string | null,
  ahora: Date,
): number | null {
  const referencia = estado === 'STOPPED_AT' ? (sale ?? llega) : (llega ?? sale);
  if (!referencia) return null;
  const prevista = Date.parse(intervaloAIso(fechaServicio(referencia, ahora), referencia));
  return Math.max(0, Math.round((ahora.getTime() - prevista) / 1000));
}

/** Suma el retraso a una hora del horario (el contrato pide las horas con el retraso aplicado). */
function conRetraso(fecha: string, intervalo: string | null, retrasoSeg: number | null): string | null {
  if (!intervalo) return null;
  const iso = intervaloAIso(fecha, intervalo);
  return retrasoSeg ? instanteAIso(new Date(Date.parse(iso) + retrasoSeg * 1000)) : iso;
}

const VACIO: Omit<CamposViaje, 'retrasoFuente' | 'estadoHorario'> = {
  nombre: null,
  linea: null,
  origen: null,
  destino: null,
  proximaParada: null,
  llegadaDestino: null,
};

/** Une cada posición con su viaje del catálogo. Sin BD (o si falla) devuelve las posiciones de Renfe tal cual. */
export async function enriquecer<T extends Enriquecible>(
  posiciones: T[],
  bd: BdService | undefined,
  ahora = new Date(),
): Promise<Enriquecida<T>[]> {
  const filas = new Map<string, FilaViaje>();
  if (bd && (await bd.estado()) === 'ok') {
    const porFeed = new Map<Feed, T[]>();
    for (const p of posiciones) porFeed.set(p.feed, [...(porFeed.get(p.feed) ?? []), p]);
    for (const [feed, lista] of porFeed) {
      try {
        const { rows } = await bd.consultar<FilaViaje>(SQL, [
          feed,
          lista.map((p) => p.tripId),
          lista.map((p) => p.paradaActual ?? ''),
        ]);
        for (const fila of rows) filas.set(`${feed}:${fila.viaje_id}`, fila);
      } catch {
        // La BD es un extra para el mapa: si falla, se sirven las posiciones de Renfe sin cruzar.
      }
    }
  }

  return posiciones.map((p) => {
    const fila = filas.get(`${p.feed}:${p.tripId}`);
    const estimado = fila ? retrasoPorHorario(p.estado, fila.h_llega, fila.h_sale, ahora) : null;
    const retrasoSeg = p.retrasoSeg ?? estimado;
    const estado = {
      retrasoSeg,
      retrasoFuente: p.retrasoSeg !== null ? ('renfe' as const) : estimado !== null ? ('horario' as const) : null,
      estadoHorario: estadoHorario(retrasoSeg),
    };
    if (!fila) return { ...p, ...VACIO, ...estado };

    const fecha = fechaServicio(fila.llegada, ahora);
    // Parado en una estación: la próxima es la siguiente. En camino: la próxima es la parada actual.
    const parado = p.estado === 'STOPPED_AT';
    const prox = parado
      ? fila.sig_id && { id: fila.sig_id, nombre: fila.sig_nombre ?? '', llega: fila.sig_llega }
      : fila.h_estacion_id && { id: fila.h_estacion_id, nombre: fila.h_estacion_nombre ?? '', llega: fila.h_llega };
    return {
      ...p,
      ...estado,
      nombre: [fila.nombre_corto, fila.numero].filter(Boolean).join(' ') || null,
      linea: p.feed === 'cercanias' ? fila.nombre_corto : null,
      origen: { id: fila.origen_id, nombre: fila.origen_nombre },
      destino: { id: fila.destino_id, nombre: fila.destino_nombre },
      proximaParada: prox
        ? { id: prox.id, nombre: prox.nombre, llegada: conRetraso(fecha, prox.llega, retrasoSeg) }
        : null,
      llegadaDestino: conRetraso(fecha, fila.llegada, retrasoSeg),
    };
  });
}
