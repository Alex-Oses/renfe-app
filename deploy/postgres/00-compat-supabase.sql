# Compatibilidad con Supabase para un PostgreSQL pelado (imagen pgvector).
#
# Las migraciones de `backend/database/supabase/migrations/` asumen el entorno de
# Supabase: los roles `anon` / `authenticated` / `service_role`, el esquema `auth`
# con `auth.users` y la función `auth.uid()`. Este fichero crea lo mínimo para que
# se apliquen **tal cual**, sin tocar ni una línea de las migraciones.
#
# Cuándo se usa: solo con el servicio `db` de docker-compose.yml. Si la base de
# datos es un Supabase (Cloud o self-hosted con el stack completo), NO se usa:
# ya trae todo esto y hay que apuntar `DATABASE_URL_DOCKER` a ella.
#
# Cuándo se ejecuta: una sola vez, al crear el volumen de datos.
# `/docker-entrypoint-initdb.d/` solo se lee con el directorio vacío. Si el
# volumen ya existe, este fichero no hace nada.
#
# Ojo: la API se conecta como `postgres`, que es superusuario y **salta RLS**.
# Las políticas de las migraciones quedan por coherencia con Supabase y por si
# algún día la API usa un rol limitado.

create schema if not exists auth;

-- Los tres roles de Supabase. NOLOGIN: nadie se conecta con ellos; existen para
-- los GRANT y las políticas de las migraciones.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'create role anon nologin noinherit';
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'create role authenticated nologin noinherit';
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'create role service_role nologin noinherit bypassrls';
  end if;
end
$$;

-- Solo lo que usan de verdad las migraciones y la API: `id` (FK de `perfiles` y
-- `embeddings_faciales`) y `email` (perfil y login facial). No pretende ser el
-- `auth.users` de Supabase.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  creado_en timestamptz not null default now()
);

comment on table auth.users is
  'Sustituto mínimo de auth.users de Supabase. Solo id y email: no hay login por contraseña, el token lo firma la API (ADR-007).';

-- Igual que en Supabase: el `sub` del JWT que PostgREST deja en la sesión. Con la
-- API conectada como `postgres` devuelve null, que es lo correcto: la API no
-- actúa «como» un usuario de Supabase.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
