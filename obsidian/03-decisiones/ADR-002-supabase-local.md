---
fecha: 2026-10-26
estado: aceptado
autor: Marina
tags: [adr, supabase, base-datos]
---

# ADR-002 — Supabase local: CLI como devDependency y layout `backend/database/supabase/`

## Contexto
El Sprint 0 pide `supabase init` en `backend/database`. La CLI de Supabase no era
dependencia del repo y el README asumía instalación manual, así que cada persona podía
acabar con una versión distinta (y el CLI cambia opciones entre versiones menores).
Además el esqueleto tenía `migrations/` y `seed.sql` directamente en `backend/database/`,
pero la CLI siempre busca `<workdir>/supabase/{config.toml,migrations/,seed.sql}`.

## Decisión
- La CLI `supabase` va como **devDependency de la raíz** (`pnpm add -Dw supabase`), versión
  fijada en el lockfile. Se instala sola con `pnpm install`.
- Scripts en el `package.json` raíz con `--workdir backend/database` para no repetir la ruta:
  `pnpm db:start`, `pnpm db:stop`, `pnpm db:reset`, `pnpm db:status`.
- Layout estándar de Supabase **dentro** de `backend/database/`:
  `supabase/config.toml`, `supabase/migrations/`, `supabase/seed.sql`.
  `project_id = "renfe-app"`.
- Puertos locales por defecto: Postgres `54322`, API `54321`, Studio `54323`
  (coinciden con `DATABASE_URL` de `.env.example`).

## Alternativas descartadas
- **Instalación global de la CLI:** versiones distintas por persona, nada reproducible; el CI
  también necesita la misma versión.
- **`pnpm dlx supabase` en cada comando:** descarga la última versión cada vez, lento y sin fijar.
- **Dejar `migrations/` y `seed.sql` donde estaban:** la CLI no los leería; habría que pasar rutas
  a mano en cada comando y se rompería `db reset`.
- **`backend/supabase/`:** separa la BD de su README y del área de Marina sin ganar nada.

## Consecuencias
- `pnpm install` instala la CLI (~10 s extra) y `node_modules` crece un poco.
- Hay que actualizar la CLI a mano (`pnpm add -Dw supabase`) cuando se quiera una versión nueva.
- `supabase start` necesita **Docker Desktop abierto**; sin Docker, `db:*` falla con
  `failed to connect to the docker API`.
- Las migraciones se crean con `pnpm exec supabase migration new <nombre> --workdir backend/database`
  y se aplican con `pnpm db:reset`.
