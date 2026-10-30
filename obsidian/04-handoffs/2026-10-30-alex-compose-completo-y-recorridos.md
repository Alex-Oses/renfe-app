---
fecha: 2026-10-30
autor: Alex
area: devops
para: todos
rama: feat/infra-compose-completo
pr:
tags: [handoff, docker, gtfs, mapa]
---

# Handoff — Todo el stack local con `docker compose up` y recorrido real de los trenes

## Qué se hizo
- `docker compose up -d --build` levanta API (:3000), web (:5173) y la app Expo exportada a web (:8081), todo contra Supabase local (`pnpm db:start`). Nuevo `frontend/Dockerfile` (un solo Dockerfile con `APP=web|mobile`, nginx).
- Integradas en la rama la app móvil funcional (`feat/mobile-app-funcional`), la API de billetes/abonos, el docker local y el recorrido real (`feat/gtfs-recorridos`).
- Recorrido real en el mapa: Cercanías usa `shapes.txt` (tabla `formas`); AV/LD/MD usa tramos por las vías de OSM (`tramos_via`, `pnpm --filter @renfe/gtfs-worker vias`). Comprobado: Madrid-Chamartín → Badajoz devuelve 418 puntos por las vías.
- `pnpm local` ya calcula los tramos y levanta los tres servicios.

## Qué queda
- ~720 tramos AV/LD/MD sin vía conectada en OSM siguen en línea recta.
- Probar en Expo Go en el móvil (fuera de Docker, `EXPO_PUBLIC_API_URL=http://<IP>:3000`).
- `pnpm gtfs:importar` / `pnpm gtfs:vias` desde la raíz fallan si `pnpm` no está en el PATH (solo con corepack): usar `corepack pnpm --filter @renfe/gtfs-worker …`.

## Bloqueos / preguntas para otros
- Marina: aplicar en Supabase Cloud la migración `20261029140000_recorridos.sql` y cargar `formas`/`tramos_via` cuando toque desplegar.
- Kevin: revisa el compose nuevo (zona tuya).

## Cambios en contratos
Ninguno nuevo: `recorrido` en el detalle del tren ya estaba en [[endpoints]]; tablas `formas` y `tramos_via` en la migración de recorridos.

## Ficheros tocados
`docker-compose.yml`, `.dockerignore`, `frontend/Dockerfile`, `frontend/nginx.conf`, `scripts/levantar-local.mjs`, `backend/gtfs-worker/src/{gtfs/geometria.ts,gtfs/vias.ts,trazar-vias.ts,vias.test.ts}`, migración `20261029140000_recorridos.sql`.
