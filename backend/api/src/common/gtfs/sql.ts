// Trozos de SQL compartidos por las consultas de GTFS.

/**
 * Condición «este servicio circula el día `$3`», con `$3` = fecha de servicio.
 * Espera que `viajes` esté aliasado como `v`. `añadido` gana a `eliminado`, como en GTFS.
 */
export const SERVICIO_ACTIVO = `
      (
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
      )`;
