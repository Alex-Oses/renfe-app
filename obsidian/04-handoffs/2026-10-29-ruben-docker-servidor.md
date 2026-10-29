---
fecha: 2026-10-29
autor: Rubén
area: devops
para: [Kevin, Marina, Alex]
rama: chore/infra-docker-servidor
pr: 87
tags: [handoff, infra, docker, despliegue]
---

# Handoff — Docker del servidor preparado (sin ejecutar)

## Qué se hizo

Todo lo necesario para desplegar la **opción A** (BD + API en el servidor) está escrito. **No se ha
construido ninguna imagen ni se ha levantado nada**: en el portátil no hay daemon de Docker
(`docker build` falla con `failed to connect to the docker API`). Lo único que se ha ejecutado es
`docker compose config`, que valida la sintaxis y la interpolación.

- **`backend/api/Dockerfile`**: multietapa no, pero sí con contexto de la **raíz** del monorepo (antes
  hacía `COPY . .` sobre `backend/api` y no veía el `pnpm-lock.yaml`). Instala con
  `--filter @renfe/api` (no arrastra Expo), compila con `nest build` y arranca con
  `node backend/api/dist/main.js`. `NODE_ENV=production` va **después** del install: si va antes, pnpm
  se salta las devDependencies y sin `@nestjs/cli` no hay build.
- **`backend/gtfs-worker/Dockerfile`**: estaba roto por dos motivos — `CMD node dist/index.js` (no
  existe) y `tsc --noEmit` (no genera `dist/`). Ahora corre con `tsx src/importar.ts` y es un **job**,
  no un servicio. Usa `node:22-slim` porque `tsx` arrastra esbuild (binario nativo) y así no hay que
  acertar la variante musl.
- **`.dockerignore`** en la raíz: sin él, el contexto se llevaba `node_modules` y el `.env`.
- **`docker-compose.yml`** reescrito: `db` (`pgvector/pgvector:pg17`, sin publicar puerto),
  `api` (solo en `127.0.0.1:${API_PUBLICO:-3010}`, healthcheck, `depends_on` con `service_healthy`) y
  `gtfs-worker` en el perfil `tools`.
- **`deploy/postgres/00-compat-supabase.sql`**: crea `anon`/`authenticated`/`service_role`, el esquema
  `auth`, `auth.users (id, email)` y `auth.uid()`. Es lo único que asumen las migraciones. Se aplica
  solo, al crear el volumen.
- **`deploy/README.md`**: runbook (levantar, migrar, importar, verificar, nginx con DNS-01,
  Cloudflare Tunnel, backups, apuntar a una BD que ya existe).
- **[[ADR-009-despliegue-servidor]]**: la decisión, las dos variantes de BD y las alternativas
  descartadas.
- `.env.example`: `POSTGRES_PASSWORD`, `DATABASE_URL_DOCKER` y `API_PUBLICO`.

## Lo que hay que saber antes de tocar nada

- **La BD del compose y Supabase Cloud no son lo mismo.** `DATABASE_URL_DOCKER` decide a cuál apunta
  la API. Vacía = la del compose. Para Cloud o para el Supabase de Marina, se pone ahí y se levanta
  con `--no-deps`.
- **Con Postgres pelado no hay Supabase Auth.** El sustituto solo crea `auth.users (id, email)`.
  Nadie va a insertar filas ahí hasta que existan `POST /auth/registro` y `POST /auth/login`, así que
  el login facial no se puede usar en esa variante.
- **El puerto**: solo hace falta **uno de entrada**, y solo para el navegador. El 80 **no** hace
  falta: Let's Encrypt se saca por DNS-01. Si no se puede abrir ninguno, Cloudflare Tunnel.
- La API escucha en `127.0.0.1` a propósito. Sin nginx o túnel delante, no se llega desde fuera.

## Qué queda

- **Construir las imágenes en el servidor.** Es la primera prueba real de los dos Dockerfile.
- **Remapear los puertos de Supabase** si Marina ya tiene el stack levantado (54321–54327, 8083).
- **Backups automáticos y una restauración probada.** Hoy solo hay el `pg_dump` del runbook.
- **Usuario no root en los contenedores** y rotación de logs: no están.

## Bloqueos / preguntas para otros

- **Marina**: el vault solo documenta Supabase Cloud. **No hay ni una línea sobre la BD del servidor**
  (contenedores, puerto interno, interfaz de escucha, con qué feed se cargó, si tiene las 4
  migraciones). Es lo que decide si la opción A cuesta dos horas o dos días. ¿Está ahí el stack
  completo de Supabase o un Postgres suelto?
- **Kevin**: los Dockerfile eran tuyos (placeholders). Los he reescrito porque el despliegue los
  necesitaba; revísalos. Si prefieres el patrón de `pnpm deploy` en vez de instalar con `--filter`, es
  el momento de decirlo.
- **Alex**: cuando la API tenga URL pública desde el servidor, `VITE_API_URL` en Vercel apunta ahí y
  Render se puede apagar.

## Cambios en contratos

Ninguno. No cambia ningún endpoint, tabla ni evento.

## Ficheros tocados

- `backend/api/Dockerfile`, `backend/gtfs-worker/Dockerfile` (reescritos)
- `docker-compose.yml` (reescrito), `.dockerignore` (nuevo)
- `deploy/postgres/00-compat-supabase.sql`, `deploy/README.md` (nuevos)
- `.env.example` (3 variables nuevas)
- `obsidian/03-decisiones/ADR-009-despliegue-servidor.md`,
  `obsidian/05-areas/infraestructura-servidor.md`, `obsidian/01-estado/estado-equipo.md`
