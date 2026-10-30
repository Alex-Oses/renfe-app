-- Recorrido real de los trenes en el mapa (en vez de líneas rectas entre paradas).
-- * `formas`: el `shapes.txt` de GTFS (solo lo publica Cercanías), un trazado por forma.
-- * `tramos_via`: trazado por las vías entre dos estaciones seguidas, calculado con la red
--   ferroviaria de OpenStreetMap (`pnpm gtfs:vias`). Lo usa AV/LD/MD, que no trae shapes.
-- `puntos` es un array JSON de [lat, lon], ya simplificado para el mapa.

create table public.formas (
  feed text not null,
  id text not null,
  puntos jsonb not null,
  primary key (feed, id)
);

alter table public.viajes add column forma_id text;

create table public.tramos_via (
  origen_id text not null references public.estaciones (id) on delete cascade,
  destino_id text not null references public.estaciones (id) on delete cascade,
  puntos jsonb not null,
  metros integer not null,
  actualizado_en timestamptz not null default now(),
  primary key (origen_id, destino_id)
);

-- Catálogo público, como el resto del GTFS: lectura para todos, escritura solo service_role.
alter table public.formas enable row level security;
grant select on public.formas to anon, authenticated;
create policy formas_lectura on public.formas for select using (true);

alter table public.tramos_via enable row level security;
grant select on public.tramos_via to anon, authenticated;
create policy tramos_via_lectura on public.tramos_via for select using (true);
