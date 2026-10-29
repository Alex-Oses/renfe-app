---
fecha: 2026-10-29
autor: Rubén
area: api
para: todos
rama: feat/api-cara-perfiles
pr: (pendiente)
tags: [handoff]
---

# Handoff — el rol sale de `perfiles` y los endpoints quedan listos para la BD

## Qué se hizo

**El rol ya tiene una sola fuente: `perfiles.rol`.** Antes había tres y se contradecían: Postgres lo
leía de `perfiles` (lo que hace `resetear_cara`), `CaraService` lo firmaba desde
`auth.users.raw_app_meta_data` y el guard lo leía de `app_metadata` del token. Un `revisor` que
entrara con contraseña era `viajero` para la API.

- `SupabaseJwtGuard`: el token lleva solo `sub`, `email`, `iat` y `exp`. El rol se resuelve con una
  consulta por clave primaria a `perfiles` (una por petición autenticada). Sin fila → `viajero`; si
  la BD no responde → **503**, sin degradar a `viajero` en silencio.
- `CaraService.usuario()`: `perfiles` join `auth.users` para `nombre`, `rol` y `email`. El token que
  firma ya no lleva `app_metadata`.
- Contrato actualizado en [[endpoints]] § Autenticación y dos líneas en
  [[ADR-007-reconocimiento-facial]].

**La API ya lee el `.env` de la raíz.** Los scripts de pnpm corren en `backend/api`, así que
`ConfigModule` buscaba `backend/api/.env` y nunca encontraba el de la raíz. Ahora
`envFilePath: ['../../.env', '.env']`. Los e2e hacen lo mismo con `process.loadEnvFile`.

**`test/bd.e2e-spec.ts` nuevo.** Se salta entero sin `DATABASE_URL`, así que CI sigue verde. Con BD:
`/health` con `baseDatos: "ok"`, `/estaciones` con datos de `avld`, `/trenes` con un viaje que
circule hoy (si no hay ninguno, se salta ese caso), el detalle con las paradas en orden, y los
caminos de error del facial (404 RF005, 403 RF006, 401). El camino feliz del facial necesita
`/auth/registro`, que todavía no existe.

**Camino Docker documentado, sin ejecutarlo**: `pnpm db:start` → `pnpm db:reset` →
`pnpm gtfs:importar` → `.env` con `DATABASE_URL` → `pnpm --filter @renfe/api test:e2e` →
`pnpm dev:api`. Está en `backend/api/README.md` § Base de datos. **No he levantado Docker ni me he
conectado a ninguna BD**: no hay `.env` en esta máquina.

## Qué queda

- **Probar de verdad.** El primer `test:e2e` con BD es la prueba real de todo esto. Sospechosos, por
  orden: SSL del pooler en la nube (`BdService` no configura `ssl`), `interval::text` con horas > 24
  y `total` como string.
- **`/auth/registro` y `/auth/login`.** Sin `perfiles` no hay facial: la FK de `embeddings_faciales`
  va a `perfiles`. Hoy el facial solo se puede probar por los caminos de error.
- Render: `DATABASE_URL` = session pooler (la directa es IPv6), según [[supabase-nube]].

## Bloqueos / preguntas para otros

- **Marina**: nada tuyo bloqueado. Solo he actualizado el estado de las migraciones en
  `backend/database/README.md` y `supabase/migrations/README.md` (decían "3 migraciones, sin
  aplicar" y ya son 4, validadas en tu VM). Revísalo por si me he pasado de frenada en tu zona.
- **Alex**: el comentario de `frontend/shared/api/tipos.ts` (~línea 107) sigue diciendo que el rol va
  en `app_metadata`. Ya no: sale de `perfiles.rol`. Es tu zona, no lo he tocado. Y `Usuario` sigue
  necesitando el campo `rol`.
- **Kevin**: `backend/face-service/` ya no existe; tampoco su servicio en `docker-compose.yml`, su
  línea de `CODEOWNERS`, el bloque `pip` de `dependabot.yml`, la etiqueta de `labeler.yml` ni
  `FACE_SERVICE_URL`. Queda borrar la etiqueta `face` en GitHub si quieres.

## Cambios en contratos

[[endpoints]] § Autenticación: claims `sub`, `email`, `iat`, `exp`; el rol no viaja en el token y se
lee de `perfiles.rol`; `503` si la BD no está al resolver el rol. Nota del `reset` corregida.

## Ficheros tocados

- `backend/api/src/common/auth/supabase-jwt.guard.ts` y `.spec.ts`
- `backend/api/src/modules/auth/cara.service.ts` y `.spec.ts`
- `backend/api/src/app.module.ts` (`envFilePath`)
- `backend/api/vitest.config.e2e.ts` (carga el `.env` de la raíz)
- `backend/api/test/bd.e2e-spec.ts` (nuevo)
- `backend/api/README.md` (§ Base de datos + runbook Docker, § Auth corregida)
- `backend/database/README.md`, `backend/database/supabase/migrations/README.md` (estado real)
- `obsidian/02-contratos-api/endpoints.md`, `obsidian/03-decisiones/ADR-007-reconocimiento-facial.md`
