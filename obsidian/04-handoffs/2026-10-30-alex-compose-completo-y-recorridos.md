---
fecha: 2026-10-30
autor: Alex
area: devops
para: todos
rama: feat/infra-compose-completo
pr: 98
tags: [handoff, docker, gtfs, mapa]
---

# Handoff — Todo el stack local con `docker compose up` y recorrido real de los trenes

## Qué se hizo
- `pnpm docker:local` (`docker-compose.local.yml`; el `docker-compose.yml` es el del servidor de Kevin) levanta API (:3000), web (:5173) y la app Expo exportada a web (:8081), todo contra Supabase local (`pnpm db:start`). Nuevo `frontend/Dockerfile` (un solo Dockerfile con `APP=web|mobile`, nginx).
- Integradas en la rama la app móvil funcional (`feat/mobile-app-funcional`), la API de billetes/abonos, el docker local y el recorrido real (`feat/gtfs-recorridos`).
- Recorrido real en el mapa: Cercanías usa `shapes.txt` (tabla `formas`); AV/LD/MD usa tramos por las vías de OSM (`tramos_via`, `pnpm --filter @renfe/gtfs-worker vias`). Comprobado: Madrid-Chamartín → Badajoz devuelve 418 puntos por las vías.
- `pnpm local` ya calcula los tramos y levanta los tres servicios, y genera `JWT_SECRET`.
- Fusionado `origin/develop`. El `.dockerignore` raíz excluía `**/*.md` y la API se caía al arrancar porque el chatbot lee `RENFE_CONTEXT.md` y `RENFE_GUARDRAILS.md`: añadida la excepción `!backend/api/src/modules/chatbot/**/*.md`. Ese fallo también afecta a `develop`.

## Qué queda
- ~720 tramos AV/LD/MD sin vía conectada en OSM siguen en línea recta.
- Probar en Expo Go en el móvil (fuera de Docker, `EXPO_PUBLIC_API_URL=http://<IP>:3000`).
- `pnpm gtfs:importar` / `pnpm gtfs:vias` desde la raíz fallan si `pnpm` no está en el PATH (solo con corepack): usar `corepack pnpm --filter @renfe/gtfs-worker …`.

## Bloqueos / preguntas para otros
- Marina: el 30/10 Alex aplicó en Supabase Cloud (`db push`) `20261029120000_billetes_y_abonos`, `20261029130000_modelo_cara_w600k_mbf` y `20261029140000_recorridos`, con el PR #98 aún sin mergear. Falta cargar `formas`/`tramos_via` en Cloud (siguen vacías) y actualizar [[supabase-nube]], que aún habla de 4 migraciones.
- Todos: `config_cara` pasa a `arcface/w600k_mbf`; las caras ya registradas en Cloud devuelven `modelo_distinto` y hay que volver a registrarlas.
- Kevin: revisa el compose nuevo y la excepción del `.dockerignore` raíz (zona tuya).

## Cambios en contratos
Ninguno nuevo: `recorrido` en el detalle del tren ya estaba en [[endpoints]]; tablas `formas` y `tramos_via` en la migración de recorridos.

## Ficheros tocados
`docker-compose.local.yml`, `frontend/Dockerfile`, `frontend/Dockerfile.dockerignore`, `package.json`, `frontend/nginx.conf`, `scripts/levantar-local.mjs`, `backend/gtfs-worker/src/{gtfs/geometria.ts,gtfs/vias.ts,trazar-vias.ts,vias.test.ts}`, migración `20261029140000_recorridos.sql`.
