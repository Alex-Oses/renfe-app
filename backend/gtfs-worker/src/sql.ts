/**
 * SQL de carga del catálogo. Una sentencia por tabla, todas idempotentes.
 *
 * El lote viaja como **un solo parámetro `jsonb`** y se expande en el servidor con
 * `jsonb_to_recordset`: una petición por lote en vez de una por fila, sin montar
 * SQL dinámico ni escapar valores a mano. Las horas y fechas se mandan como texto
 * y se convierten aquí, para que TypeScript no tenga que hablar en `interval`.
 */
export const CARGAS = {
  estaciones: `
    insert into public.estaciones (id, nombre, ciudad, provincia, lat, lon, accesible)
    select id, nombre, ciudad, provincia, lat, lon, accesible
      from jsonb_to_recordset($1::jsonb) as x(
        id text, nombre text, ciudad text, provincia text,
        lat double precision, lon double precision, accesible boolean)
    on conflict (id) do update set
      nombre = excluded.nombre,
      ciudad = excluded.ciudad,
      provincia = excluded.provincia,
      lat = excluded.lat,
      lon = excluded.lon,
      -- El CSV no trae accesibilidad: si esta importación no lo sabe, no se borra lo que ya había.
      accesible = coalesce(excluded.accesible, estaciones.accesible)
  `,

  estacion_feeds: `
    insert into public.estacion_feeds (estacion_id, feed, stop_id, anden)
    select estacion_id, feed, stop_id, anden
      from jsonb_to_recordset($1::jsonb) as x(
        estacion_id text, feed text, stop_id text, anden text)
    on conflict (estacion_id, feed) do update set
      stop_id = excluded.stop_id,
      anden = excluded.anden
  `,

  rutas: `
    insert into public.rutas (feed, id, nombre, nombre_corto, tipo_servicio, color)
    select feed, id, nombre, nombre_corto, tipo_servicio, color
      from jsonb_to_recordset($1::jsonb) as x(
        feed text, id text, nombre text, nombre_corto text,
        tipo_servicio text, color text)
    on conflict (feed, id) do update set
      nombre = excluded.nombre,
      nombre_corto = excluded.nombre_corto,
      tipo_servicio = excluded.tipo_servicio,
      color = excluded.color
  `,

  calendarios: `
    insert into public.calendarios
      (feed, id, lunes, martes, miercoles, jueves, viernes, sabado, domingo, inicio, fin)
    select feed, id, lunes, martes, miercoles, jueves, viernes, sabado, domingo,
           inicio::date, fin::date
      from jsonb_to_recordset($1::jsonb) as x(
        feed text, id text, lunes boolean, martes boolean, miercoles boolean,
        jueves boolean, viernes boolean, sabado boolean, domingo boolean,
        inicio text, fin text)
    on conflict (feed, id) do update set
      lunes = excluded.lunes,
      martes = excluded.martes,
      miercoles = excluded.miercoles,
      jueves = excluded.jueves,
      viernes = excluded.viernes,
      sabado = excluded.sabado,
      domingo = excluded.domingo,
      inicio = excluded.inicio,
      fin = excluded.fin
  `,

  calendario_excepciones: `
    insert into public.calendario_excepciones (feed, servicio_id, fecha, tipo)
    select feed, servicio_id, fecha::date, tipo
      from jsonb_to_recordset($1::jsonb) as x(
        feed text, servicio_id text, fecha text, tipo text)
    on conflict (feed, servicio_id, fecha) do update set
      tipo = excluded.tipo
  `,

  viajes: `
    insert into public.viajes
      (feed, id, numero, ruta_id, servicio_id, fecha_inicio, fecha_fin,
       origen_id, destino_id, salida, llegada, num_paradas, sentido, accesible)
    select feed, id, numero, ruta_id, servicio_id, fecha_inicio::date, fecha_fin::date,
           origen_id, destino_id, salida::interval, llegada::interval,
           num_paradas, sentido, accesible
      from jsonb_to_recordset($1::jsonb) as x(
        feed text, id text, numero text, ruta_id text, servicio_id text,
        fecha_inicio text, fecha_fin text, origen_id text, destino_id text,
        salida text, llegada text, num_paradas smallint,
        sentido smallint, accesible boolean)
    on conflict (feed, id) do update set
      numero = excluded.numero,
      ruta_id = excluded.ruta_id,
      servicio_id = excluded.servicio_id,
      fecha_inicio = excluded.fecha_inicio,
      fecha_fin = excluded.fecha_fin,
      origen_id = excluded.origen_id,
      destino_id = excluded.destino_id,
      salida = excluded.salida,
      llegada = excluded.llegada,
      num_paradas = excluded.num_paradas,
      sentido = excluded.sentido,
      accesible = excluded.accesible
  `,

  horarios: `
    insert into public.horarios (feed, viaje_id, secuencia, estacion_id, llega, sale, recoge, deja)
    select feed, viaje_id, secuencia, estacion_id,
           nullif(llega, '')::interval, nullif(sale, '')::interval, recoge, deja
      from jsonb_to_recordset($1::jsonb) as x(
        feed text, viaje_id text, secuencia integer, estacion_id text,
        llega text, sale text, recoge boolean, deja boolean)
    on conflict (feed, viaje_id, secuencia) do update set
      estacion_id = excluded.estacion_id,
      llega = excluded.llega,
      sale = excluded.sale,
      recoge = excluded.recoge,
      deja = excluded.deja
  `,
} as const;

export type TablaCarga = keyof typeof CARGAS;

/**
 * Orden obligatorio: respeta las claves ajenas del contrato (§4).
 * `estaciones` va primero y `horarios` al final.
 */
export const ORDEN_CARGA: TablaCarga[] = [
  "estaciones",
  "estacion_feeds",
  "rutas",
  "calendarios",
  "calendario_excepciones",
  "viajes",
  "horarios",
];

/**
 * Orden inverso para vaciar un feed antes de recargarlo. `estaciones` no se toca:
 * es compartida con el otro feed y solo se actualiza por `upsert`.
 */
export const ORDEN_VACIADO = [
  "horarios",
  "viajes",
  "calendario_excepciones",
  "calendarios",
  "rutas",
  "estacion_feeds",
] as const;
