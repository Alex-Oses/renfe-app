-- =============================================================================
-- 01 · Extensiones y funciones compartidas
-- =============================================================================
-- Contrato:  obsidian/02-contratos-api/modelo-datos.md (§3 y §4)
-- Decisiones: obsidian/05-areas/migracion-catalogo-gtfs.md
--
-- Esta migración no crea tablas: prepara el terreno para las dos siguientes
-- (02 · identidad y 03 · catálogo GTFS) y se puede revertir sin perder datos.
-- =============================================================================

-- Las extensiones viven en el esquema `extensions`, como en Supabase. El
-- esquema ya existe en un Supabase recién creado, pero se asegura para que la
-- migración también valga aplicada con `psql` sobre un PostgreSQL limpio.
create schema if not exists extensions;

-- `vector`  → embeddings faciales de 512 dimensiones (InsightFace). Nunca fotos.
-- `pg_trgm` → autocompletado de estaciones por nombre (§4.1).
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- `gen_random_uuid()` es nativo desde PostgreSQL 13: no hace falta `pgcrypto`.
-- `unaccent` no se instala: la API normaliza con `translate()` y el contrato no
-- lo prevé (ver la nota de decisiones).

-- -----------------------------------------------------------------------------
-- Trigger genérico de `actualizado_en`
-- -----------------------------------------------------------------------------
-- Una sola función para todas las tablas del contrato que llevan la columna
-- (`perfiles`, `estaciones`, `rutas`, `viajes`). Los triggers se crean en las
-- migraciones que crean cada tabla.
--
-- `set search_path = ''` es el endurecimiento habitual en Supabase: la función
-- no resuelve nombres a través del `search_path` del rol que la ejecute, así
-- que nadie puede "secuestrarla" creando un `now()` en un esquema propio.
create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

comment on function public.set_actualizado_en() is
  'Rellena actualizado_en con now() en cada UPDATE (modelo-datos §3.1, §4.1, §4.3 y §4.6).';
