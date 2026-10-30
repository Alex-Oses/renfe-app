-- =============================================================================
-- 03 · Catálogo GTFS (datos reales de Renfe)
-- =============================================================================
-- Contrato:   obsidian/02-contratos-api/modelo-datos.md §4 (§4.1 a §4.7) y §7.
-- Decisiones: obsidian/05-areas/migracion-catalogo-gtfs.md
-- Plan de carga: obsidian/05-areas/plan-ingesta-gtfs.md
--
-- Depende de: 20261028120000_extensiones_y_funciones.sql
--             (`pg_trgm`, `set_actualizado_en()`).
--
-- Qué NO entra aquí, a propósito (segunda migración):
--   `posiciones_trenes` e `incidencias` (tiempo real, §6) y todo lo de reserva,
--   pago, billete y validación (§5).
--
-- Orden de creación = orden de importación (respeta las claves ajenas):
--   estaciones → estacion_feeds → rutas → calendarios → calendario_excepciones
--   → viajes → horarios.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 · estaciones
-- -----------------------------------------------------------------------------
-- Tabla única para los dos feeds. `id` = `CODIGO` de `estaciones.csv` (el CSV de
-- Renfe, no un feed GTFS): cubre el 100 % de las paradas de AV/LD/MD y el 57 %
-- de las de Cercanías. Las paradas sin código entran como `cer:<stop_id>`.
create table public.estaciones (
  id text primary key,
  nombre text not null,
  ciudad text,
  provincia text,
  lat double precision not null
    constraint estaciones_lat_check check (lat between -90 and 90),
  lon double precision not null
    constraint estaciones_lon_check check (lon between -180 and 180),
  accesible boolean,
  actualizado_en timestamptz not null default now()
);

comment on table public.estaciones is
  'Estación unificada de los dos feeds. id = CODIGO de estaciones.csv (o cer:<stop_id>).';
comment on column public.estaciones.ciudad is
  'POBLACION del CSV. Puede ser null: la API devuelve "" y nunca la inventa.';
comment on column public.estaciones.provincia is
  'PROVINCIA del CSV. Agrupa en la UI y desempata homónimos.';

-- Autocompletado de `GET /estaciones?q=` (§4.1). El operador de `pg_trgm` vive
-- en `extensions`, así que se cualifica: no se depende del `search_path`.
create index estaciones_nombre_trgm_idx
  on public.estaciones using gin (nombre extensions.gin_trgm_ops);

create trigger estaciones_actualizado_en
  before update on public.estaciones
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 4.2 · estacion_feeds
-- -----------------------------------------------------------------------------
-- Tabla puente: qué `stop_id` de qué feed es cada estación. Es lo que hace
-- posible `feeds[]` en `GET /estaciones` y que no haya dos «Atocha».
create table public.estacion_feeds (
  estacion_id text not null
    references public.estaciones (id) on delete cascade,
  feed text not null
    constraint estacion_feeds_feed_check check (feed in ('cercanias', 'avld')),
  stop_id text not null,
  anden text,
  primary key (estacion_id, feed),
  constraint estacion_feeds_feed_stop_id_key unique (feed, stop_id)
);

comment on table public.estacion_feeds is
  'stop_id de cada feed → estación unificada. Clave natural (feed, stop_id).';
comment on column public.estacion_feeds.anden is
  'platform_code. Ningún feed lo publica hoy: siempre null. No se inventa.';

-- El contrato pide también un índice `(estacion_id)`; NO se crea porque la
-- clave primaria ya empieza por esa columna y Postgres reutiliza ese índice.
-- El índice que sí hace falta es el de la otra dirección, y lo aporta el
-- UNIQUE (feed, stop_id) de arriba.

-- -----------------------------------------------------------------------------
-- 4.3 · rutas  ← routes.txt
-- -----------------------------------------------------------------------------
-- `route_type` vale 2 (rail) en todo Renfe, así que no distingue producto:
-- `tipo_servicio` lo deduce el worker (Rubén, 26/10).
create table public.rutas (
  feed text not null
    constraint rutas_feed_check check (feed in ('cercanias', 'avld')),
  id text not null,
  nombre text,
  nombre_corto text,
  tipo_servicio text not null
    constraint rutas_tipo_servicio_check check (tipo_servicio in (
      'cercanias', 'ave', 'avlo', 'avant', 'alvia', 'intercity',
      'media_distancia', 'regional', 'otro'
    )),
  color text,
  actualizado_en timestamptz not null default now(),
  primary key (feed, id)
);

comment on table public.rutas is
  'route_id de cada feed. nombre_corto es la línea en Cercanías y el producto en AV/LD/MD.';
comment on column public.rutas.nombre is
  'route_long_name. Nullable: viene VACÍO en las 663 rutas de AV/LD/MD. El importador lo rellena con coalesce(route_long_name, route_short_name, '''') para no romper FilaTren.nombre de la API.';
comment on column public.rutas.color is
  'route_color en hexadecimal, solo para la UI. Sin CHECK a propósito: si Renfe publica un formato raro, la importación no debe fallar (se normaliza en el worker).';

create index rutas_feed_nombre_corto_idx on public.rutas (feed, nombre_corto);

create trigger rutas_actualizado_en
  before update on public.rutas
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 4.4 · calendarios  ← calendar.txt
-- -----------------------------------------------------------------------------
-- Cercanías trae 450 servicios, todos con inicio = fin (uno por día, horizonte
-- de 30 días). AV/LD/MD trae 8 729, unos de un día y otros de rango.
create table public.calendarios (
  feed text not null
    constraint calendarios_feed_check check (feed in ('cercanias', 'avld')),
  id text not null,
  lunes boolean not null,
  martes boolean not null,
  miercoles boolean not null,
  jueves boolean not null,
  viernes boolean not null,
  sabado boolean not null,
  domingo boolean not null,
  inicio date not null,
  fin date not null,
  primary key (feed, id),
  constraint calendarios_rango_check check (fin >= inicio)
);

comment on table public.calendarios is
  'service_id de cada feed: días de la semana + rango de fechas de circulación.';

-- -----------------------------------------------------------------------------
-- 4.5 · calendario_excepciones  ← calendar_dates.txt
-- -----------------------------------------------------------------------------
-- Sin esta tabla la búsqueda por fecha miente en festivos y puentes.
-- Cercanías NO publica `calendar_dates.txt`: la tabla se queda vacía para ese
-- feed y el importador no debe fallar por su ausencia.
create table public.calendario_excepciones (
  feed text not null
    constraint calendario_excepciones_feed_check check (feed in ('cercanias', 'avld')),
  servicio_id text not null,
  fecha date not null,
  tipo text not null
    constraint calendario_excepciones_tipo_check check (tipo in ('añadido', 'eliminado')),
  primary key (feed, servicio_id, fecha),
  constraint calendario_excepciones_servicio_fkey
    foreign key (feed, servicio_id)
    references public.calendarios (feed, id) on delete cascade
);

comment on table public.calendario_excepciones is
  'exception_type 1 → añadido, 2 → eliminado. Los literales deben coincidir con SERVICIO_ACTIVO de la API (backend/api/src/common/gtfs/sql.ts).';

create index calendario_excepciones_fecha_tipo_idx
  on public.calendario_excepciones (fecha, tipo);

-- -----------------------------------------------------------------------------
-- 4.6 · viajes  ← trips.txt
-- -----------------------------------------------------------------------------
-- El feed YA viene expandido por fecha: un viaje es el viaje de un día, no una
-- plantilla perpetua. `fecha_inicio`/`fecha_fin` son el horizonte y sirven para
-- acotar la búsqueda y para purgar lo caducado.
create table public.viajes (
  feed text not null
    constraint viajes_feed_check check (feed in ('cercanias', 'avld')),
  id text not null,
  numero text,
  ruta_id text not null,
  servicio_id text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  origen_id text not null
    references public.estaciones (id) on delete restrict,
  destino_id text not null
    references public.estaciones (id) on delete restrict,
  salida interval not null,
  llegada interval not null,
  num_paradas smallint not null
    constraint viajes_num_paradas_check check (num_paradas > 0),
  sentido smallint
    constraint viajes_sentido_check check (sentido in (0, 1)),
  accesible boolean,
  actualizado_en timestamptz not null default now(),
  primary key (feed, id),
  constraint viajes_ruta_fkey
    foreign key (feed, ruta_id)
    references public.rutas (feed, id) on delete cascade,
  constraint viajes_servicio_fkey
    foreign key (feed, servicio_id)
    references public.calendarios (feed, id) on delete cascade,
  constraint viajes_fechas_check check (fecha_fin >= fecha_inicio)
);

comment on table public.viajes is
  'trip_id de cada feed, ya expandido por fecha. Clave de la API: feed:id:fecha_servicio.';
comment on column public.viajes.numero is
  'trip_short_name (00190). Null en Cercanías, que no lo publica. Junto a rutas.tipo_servicio compone la línea que ve el usuario («ALVIA 00190»).';
comment on column public.viajes.fecha_inicio is
  'Copia de calendarios.inicio: primer día en que circula.';
comment on column public.viajes.fecha_fin is
  'Copia de calendarios.fin: último día. Se usa para purgar (fecha_fin < hoy - 2).';
comment on column public.viajes.origen_id is
  'Primera parada con recoge = true. Se calcula una vez en la importación.';
comment on column public.viajes.destino_id is
  'Última parada con deja = true. Se calcula una vez en la importación.';

-- Los dos índices de FK también sirven al `on delete cascade` de arriba.
create index viajes_feed_ruta_idx on public.viajes (feed, ruta_id);
create index viajes_feed_servicio_idx on public.viajes (feed, servicio_id);
-- Purga del catálogo caducado (plan-ingesta-gtfs §5).
create index viajes_fecha_fin_idx on public.viajes (fecha_fin);
-- `GET /trenes?fecha=`: acota el horizonte antes de mirar `calendarios`.
create index viajes_feed_horizonte_idx on public.viajes (feed, fecha_inicio, fecha_fin);

create trigger viajes_actualizado_en
  before update on public.viajes
  for each row execute function public.set_actualizado_en();

-- -----------------------------------------------------------------------------
-- 4.7 · horarios  ← stop_times.txt
-- -----------------------------------------------------------------------------
-- La tabla grande: ~2 M de filas con los dos feeds (1 918 539 + 69 670).
-- `interval` y no `time` porque GTFS publica horas > 24:00 (`25:10`).
create table public.horarios (
  feed text not null,
  viaje_id text not null,
  secuencia integer not null
    constraint horarios_secuencia_check check (secuencia > 0),
  estacion_id text not null
    references public.estaciones (id) on delete restrict,
  llega interval,
  sale interval,
  recoge boolean not null default true,
  deja boolean not null default true,
  primary key (feed, viaje_id, secuencia),
  constraint horarios_viaje_fkey
    foreign key (feed, viaje_id)
    references public.viajes (feed, id) on delete cascade,
  constraint horarios_hora_check check (llega is not null or sale is not null)
);

comment on table public.horarios is
  'stop_times de cada feed. `llega`/`sale` son «tiempo desde el inicio del día de servicio» en hora de Madrid.';
comment on column public.horarios.estacion_id is
  'Estación unificada, no el stop_id crudo del feed (se resuelve con estacion_feeds).';
comment on column public.horarios.recoge is
  'pickup_type = 0. default true porque Cercanías no publica la columna.';
comment on column public.horarios.deja is
  'drop_off_type = 0. default true porque Cercanías no publica la columna.';

-- Sin CHECK de `feed` a propósito: la clave ajena a `viajes (feed, id)` ya lo
-- garantiza y un CHECK por fila encarece el COPY de 2 M de filas.

-- El join origen → destino de §4.7 y el `on delete restrict` de estaciones.
create index horarios_estacion_idx on public.horarios (estacion_id, feed, viaje_id);

-- -----------------------------------------------------------------------------
-- RLS · catálogo de lectura pública (§7)
-- -----------------------------------------------------------------------------
-- El catálogo lo lee todo el mundo (la app con `anon`), pero solo lo escribe el
-- worker con `service_role`, que salta RLS. Se revoca el ALL que Supabase
-- concede por defecto a `anon`/`authenticated` en las tablas nuevas y se deja
-- únicamente SELECT: sin esto, un `anon` con la clave pública podría escribir.
--
-- Nota: la API no depende de estas políticas; conecta con el rol `postgres`
-- (`DATABASE_URL`), que es dueño de las tablas y salta RLS.

alter table public.estaciones enable row level security;
revoke all on public.estaciones from anon, authenticated;
grant select on public.estaciones to anon, authenticated;
create policy estaciones_lectura on public.estaciones
  for select to anon, authenticated using (true);

alter table public.estacion_feeds enable row level security;
revoke all on public.estacion_feeds from anon, authenticated;
grant select on public.estacion_feeds to anon, authenticated;
create policy estacion_feeds_lectura on public.estacion_feeds
  for select to anon, authenticated using (true);

alter table public.rutas enable row level security;
revoke all on public.rutas from anon, authenticated;
grant select on public.rutas to anon, authenticated;
create policy rutas_lectura on public.rutas
  for select to anon, authenticated using (true);

alter table public.calendarios enable row level security;
revoke all on public.calendarios from anon, authenticated;
grant select on public.calendarios to anon, authenticated;
create policy calendarios_lectura on public.calendarios
  for select to anon, authenticated using (true);

alter table public.calendario_excepciones enable row level security;
revoke all on public.calendario_excepciones from anon, authenticated;
grant select on public.calendario_excepciones to anon, authenticated;
create policy calendario_excepciones_lectura on public.calendario_excepciones
  for select to anon, authenticated using (true);

alter table public.viajes enable row level security;
revoke all on public.viajes from anon, authenticated;
grant select on public.viajes to anon, authenticated;
create policy viajes_lectura on public.viajes
  for select to anon, authenticated using (true);

alter table public.horarios enable row level security;
revoke all on public.horarios from anon, authenticated;
grant select on public.horarios to anon, authenticated;
create policy horarios_lectura on public.horarios
  for select to anon, authenticated using (true);
