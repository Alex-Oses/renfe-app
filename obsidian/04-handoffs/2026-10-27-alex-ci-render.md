---
fecha: 2026-10-27
autor: Alex
area: infra
para: Kevin, Marina, Rubén
rama: ci/infra-ci-y-render
pr: (ver PR de esta rama)
tags: [handoff, ci]
estado: abierto
---

# Handoff — CI real y blueprint de Render (descarga de Kevin)

## Qué se hizo
- `.github/workflows/ci.yml`: el job `ok` ahora ejecuta `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test` y `pnpm build`. Lo decidió Alex como PO para quitar trabajo a Kevin antes de la entrega.
- `render.yaml`: blueprint de la API. Node 22, build de `@renfe/api`, `start:prod`, health en `/health`, `API_PORT=10000`, `CORS_ORIGINS` = web de Vercel.
- [[sprint-actual]]: tareas de Kevin marcadas y nuevo riesgo de la base de datos.

## Qué queda
- **Kevin:** revisar ambos ficheros. En Render: New → Blueprint → este repo; rellenar `DATABASE_URL` (pooler de Supabase en la nube) y `SUPABASE_JWT_SECRET`. Sin `DATABASE_URL` la API arranca igual (`/health` dice "no configurada").
- **Marina:** subir las migraciones `gtfs_*` en cuanto vuelva; ahora solo están en su PC.
- **Rubén:** si el 29/10 no están, escribir la migración mínima de `gtfs_*` desde [[modelo-datos]].

## Bloqueos / preguntas para otros
- La base de datos solo existe en el PC de Marina. Es el mayor riesgo de la entrega.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `.github/workflows/ci.yml`, `render.yaml`
- `obsidian/01-estado/{sprint-actual,estado-equipo}.md`, `obsidian/05-areas/devops.md`, este handoff.
