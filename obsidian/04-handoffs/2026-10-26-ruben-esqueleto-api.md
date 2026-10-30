---
fecha: 2026-10-26
autor: Rubén (con OpenCode)
area: api
para: todos
rama: feat/api-esqueleto-nest
pr: pendiente
tags: [handoff]
estado: cerrado
---

# Handoff — Esqueleto de la API (fase F0)

## Qué se hizo

- Rama `feat/api-esqueleto-nest` desde `develop`.
- Proyecto NestJS generado en `backend/api` (Nest 12, ESM, Vitest, oxlint). Módulos de ejemplo
  eliminados; queda `AppModule` + `HealthModule`.
- Configuración validada al arrancar (`src/config/entorno.ts`): puerto, `CORS_ORIGINS`, y fallo
  explícito en producción si falta CORS.
- `main.ts` con `ValidationPipe` global, Swagger en `/docs` y `/docs-json`, y CORS desde entorno.
- Tests: unitario del health controller y e2e (`GET /health` → 200). Verificado a mano con el
  servidor levantado en 3010: health 200, docs 200, cabecera CORS correcta para `localhost:5173`.
- `common/auth/`: `SupabaseJwtGuard` (verifica HS256 contra `SUPABASE_JWT_SECRET` y expone
  `request.usuario`), `RolesGuard` + `@Roles('revisor')`. 9 tests: token válido, sin cabecera,
  firma ajena, caducado, sin secreto, y matriz de roles.
- Contrato detallado de las 6 rutas de datos en [[endpoints]] (va en la rama
  `docs/api-arquitectura-renfe`, no en esta).
- `common/bd/`: `BdService` con pool de `pg` **opcional**. Sin `DATABASE_URL` la API arranca igual
  y `GET /health` devuelve `baseDatos: "no configurada"` (verificado en vivo en 3010).
- Documentado en `backend/api/README.md` y `.env.example` (nuevas `NODE_ENV` y `CORS_ORIGINS`).
- ADR-002 con las decisiones de base (Nest 12, sin ORM, contrato propio).

## Qué queda

- **Rubén:** `/estaciones` y `/trenes` en cuanto haya tablas. El contrato ya está detallado en
  [[endpoints]]; los guards de auth están listos.
- **Marina:** migraciones de `estaciones`/`horarios` (y el worker). Sin esquema no hay `pg` ni F1.
- **Kevin:** CI real con lint/test (el actual solo hace `pnpm install`), para que los PRs validen algo.

## Bloqueos / preguntas para otros

- En este PC el puerto **3000 lo ocupa `AMAgent`** (software corporativo). Uso `API_PORT=3100` en local.
  Si a alguien más le pasa, mismo remedio; no cambio el puerto por defecto del proyecto.
- Sin BD no se puede avanzar F1/F2. Mientras tanto: contrato, guards de auth y `pagos` con Kevin.

## Cambios en contratos

Ninguno en las rutas de negocio. `GET /health` gana el campo `baseDatos`
(`ok` | `no configurada` | `error`): es infraestructura, pero Docker y el CI lo consumen.

## Ficheros tocados

- `backend/api/` (proyecto Nest completo: `src/`, `test/`, configs)
- `backend/api/README.md`, `.env.example`, `.gitignore`, `pnpm-lock.yaml`
- `obsidian/03-decisiones/ADR-002-base-api.md`
- `obsidian/04-handoffs/2026-10-26-ruben-esqueleto-api.md`
- `obsidian/01-estado/estado-equipo.md` (solo mi fila)
