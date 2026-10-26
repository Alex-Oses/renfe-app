---
fecha: 2026-10-26
autor: Marina (con OpenCode)
area: database
para: todos
rama: chore/db-supabase-init
pr: (pendiente de abrir)
tags: [handoff, supabase, base-datos]
---

# Handoff — Supabase local inicializado

## Qué se hizo
- `supabase init` ejecutado: existe `backend/database/supabase/config.toml` con `project_id = "renfe-app"`.
- CLI `supabase` añadida como **devDependency de la raíz** (versión fijada en `pnpm-lock.yaml`), más scripts `pnpm db:start | db:stop | db:reset | db:status` con `--workdir backend/database`.
- Layout ordenado al estándar de la CLI: `migrations/` y `seed.sql` movidos a `backend/database/supabase/`. Cero cambios en el contrato.
- `backend/database/README.md` y `docs/primeros-pasos.md` actualizados (ya no hay que instalar la CLI a mano); `.gitignore` apunta a las rutas nuevas.
- Decisión registrada en [[ADR-002-supabase-local]].

## Qué queda
- Marina (siguiente rama): borrador completo de [[modelo-datos]] tabla por tabla (columnas, RLS, índices) y, a partir de él, la primera migración (`create extension vector` + tablas).
- Marina: localizar las URLs de GTFS / GTFS-RT de Renfe.
- Rubén: el borrador de [[endpoints]] puede avanzar ya con la lista prevista; los nombres de tablas de `modelo-datos` aún pueden cambiar, así que no cerréis tipos compartidos hasta que esté completo.
- Kevin: si el CI necesita Supabase para tests, la CLI ya está en el repo; hace falta decidir si se levanta la BD en el workflow.

## Bloqueos / preguntas para otros
- **Sin probar `pnpm db:start` ni `pnpm db:reset`:** Docker Desktop estaba cerrado en mi PC (`failed to connect to the docker API`). La config se parsea bien (el CLI llega hasta el paso de Docker). El primero que lo arranque, que confirme que el `config.toml` vale.
- Nadie más necesita nada de momento.

## Cambios en contratos
Ninguno. [[modelo-datos]] sigue `estado: borrador` y sin tocar en esta rama.

## Ficheros tocados
- `backend/database/README.md`
- `backend/database/supabase/` (nuevo: `config.toml`, `.gitignore`, `migrations/`, `seed.sql`)
- `package.json`, `pnpm-lock.yaml`, `.gitignore`, `docs/primeros-pasos.md`
- `obsidian/03-decisiones/ADR-002-supabase-local.md`
