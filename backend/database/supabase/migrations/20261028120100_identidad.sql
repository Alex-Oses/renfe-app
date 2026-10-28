-- =============================================================================
-- 02 · Identidad y acceso
-- =============================================================================
-- Contrato:   obsidian/02-contratos-api/modelo-datos.md §3.1 (`perfiles`),
--             §3.2 (`embeddings_faciales`) y §7 (resumen de permisos).
-- Decisiones: obsidian/05-areas/migracion-catalogo-gtfs.md
--
-- Depende de: 20261028120000_extensiones_y_funciones.sql
--             (esquema `extensions` y función `public.set_actualizado_en()`).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 · perfiles
-- -----------------------------------------------------------------------------
-- Extiende `auth.users` (que gestiona Supabase Auth y no se toca). El perfil lo
-- crea la API en `POST /auth/registro`, no un trigger sobre `auth.users`.
create table public.perfiles (
  id uuid primary key
    references auth.users (id) on delete cascade,
  rol text not null default 'viajero'
    constraint perfiles_rol_check check (rol in ('viajero', 'revisor')),
  nombre text not null
    constraint perfiles_nombre_check check (length(btrim(nombre)) between 1 and 120),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.perfiles is
  'Perfil de la app, 1:1 con auth.users. Lo crea la API en POST /auth/registro.';
comment on column public.perfiles.rol is
  'viajero | revisor. Solo lo cambia la API con service_role (el cliente no puede).';

-- Índice parcial para el panel del revisor (§3.1): los viajeros no lo usan.
create index perfiles_revisor_idx on public.perfiles (rol) where rol = 'revisor';

create trigger perfiles_actualizado_en
  before update on public.perfiles
  for each row execute function public.set_actualizado_en();

-- RLS -------------------------------------------------------------------------
alter table public.perfiles enable row level security;

-- Supabase concede ALL a `anon` y `authenticated` en las tablas nuevas de
-- `public` (auto_expose_new_tables). Se revoca y se dan permisos mínimos.
revoke all on public.perfiles from anon, authenticated;

-- `rol` no se puede tocar desde la app: se concede UPDATE **por columna** y no
-- por tabla. La alternativa —comparar `rol` con su valor actual dentro de la
-- política— obliga a leer `perfiles` desde una política de `perfiles` y Postgres
-- lo rechaza por recursión.
grant select on public.perfiles to authenticated;
grant update (nombre) on public.perfiles to authenticated;

create policy perfiles_select_propio on public.perfiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy perfiles_update_propio on public.perfiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- 3.2 · embeddings_faciales
-- -----------------------------------------------------------------------------
-- 1:1 con el perfil. Se guarda el vector normalizado (L2 = 1), nunca la foto.
-- `extensions.vector` va cualificado para que la migración no dependa del
-- `search_path` (Supabase incluye `extensions`, `psql` puro no).
create table public.embeddings_faciales (
  usuario_id uuid primary key
    references public.perfiles (id) on delete cascade,
  embedding extensions.vector(512) not null,
  modelo text not null,
  creado_en timestamptz not null default now()
);

comment on table public.embeddings_faciales is
  'Un embedding facial por usuario (1:1). Nunca se guarda la foto. Solo service_role.';
comment on column public.embeddings_faciales.modelo is
  'p. ej. insightface/buffalo_l. Permite invalidar los vectores al cambiar de modelo.';

-- RLS -------------------------------------------------------------------------
alter table public.embeddings_faciales enable row level security;

-- Sin políticas **a propósito** (§3.2 y §7): ni `anon` ni `authenticated` leen
-- el embedding desde la app. Solo entra `service_role`, que salta RLS, y lo usa
-- la API o el face-service. La comparación nunca ocurre en el móvil.
revoke all on public.embeddings_faciales from anon, authenticated;

-- Sin índice HNSW: hoy la verificación es 1:1 (la app dice quién es). Si algún
-- día se hace búsqueda 1:N, se añade `using hnsw (embedding vector_cosine_ops)`.
