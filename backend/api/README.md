# @renfe/api — API NestJS

**Responsable:** Rubén · IA: OpenCode

API REST única de la app. Contexto y diagramas: [`docs/arquitectura.md`](../../docs/arquitectura.md).

## Estado

Esqueleto listo (fase F0): Nest 12 (ESM), validación de entorno al arrancar, CORS, Swagger,
`GET /health`, auth de Supabase con roles y acceso opcional a Postgres.

**Primer endpoint de datos: `GET /estaciones`** (fase F1), contra las tablas `estaciones` y
`estacion_feeds` del modelo de datos. Sin `DATABASE_URL` responde `503`.

Lo demás sigue pendiente: `/trenes` y compañía necesitan las migraciones de Marina
(`backend/database/`) y el worker GTFS.

## Arrancar

```bash
pnpm install
pnpm dev:api        # desde la raíz del monorepo
```

- `GET /health` → estado del servicio
- `GET /docs` → Swagger · `GET /docs-json` → OpenAPI

Variables: `API_PORT`, `CORS_ORIGINS`, `NODE_ENV` (ver `.env.example`). En producción
`CORS_ORIGINS` es obligatorio y el arranque falla si falta.

> En este PC el puerto 3000 lo ocupa `AMAgent`: pon `API_PORT=3100` en tu `.env`.

## Estructura

```
src/
  main.ts             CORS, ValidationPipe global, Swagger
  app.module.ts       ConfigModule validado + módulos
  config/entorno.ts   validación de variables de entorno
  common/auth/        SupabaseJwtGuard, RolesGuard y decorador @Roles
  common/bd/          BdService: pool de Postgres opcional
  modules/
    estaciones/       GET /estaciones (SQL sobre estaciones + estacion_feeds)
    health/           GET /health
```

## Base de datos

`BdService` (`common/bd/`) crea un pool de `pg` **solo si existe `DATABASE_URL`**. Sin ella la API
arranca igual, `GET /health` devuelve `"baseDatos": "no configurada"` y los endpoints de datos
responderán `503`. Sin ORM: `bd.consultar(sql, valores)` y SQL a mano (ver ADR-002).

## Auth

`SupabaseJwtGuard` verifica el `Bearer` contra `SUPABASE_JWT_SECRET` (HS256) y deja en
`request.usuario` → `{ id, email, rol }`. El rol sale de `app_metadata.rol` (`viajero` por defecto,
`revisor` explícito). `RolesGuard` + `@Roles('revisor')` limitan endpoints por rol.

```ts
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles('revisor')
@Post('billetes/validar')
```

Todavía no hay endpoints privados: los guards están listos para cuando lleguen `/auth`, `/reservas`
y `/billetes`. El contrato de auth está en `obsidian/02-contratos-api/endpoints.md`.

## Módulos previstos

| Módulo | Qué hace | Responsable |
|---|---|---|
| `auth` | Registro/login con Supabase Auth, login facial (llama a face-service) | Rubén |
| `estaciones` | Búsqueda de estaciones sobre datos GTFS | Rubén |
| `trenes` | Búsqueda por origen/destino/fecha, detalle, retrasos, posiciones | Rubén |
| `reservas` | Asientos y reservas simulados | Rubén |
| `pagos` | PaymentIntent de Stripe test + webhook | Kevin |
| `billetes` | QR firmado (Ed25519) y validación para el revisor | Rubén |
| `chatbot` | Claude API con tool use | Rubén |

## Reglas

- Cada endpoint se escribe en `obsidian/02-contratos-api/endpoints.md` **antes** de implementarlo.
- Swagger siempre al día: es la documentación viva de la API.
- Sin ORM: `pg` + SQL para horarios (1,9 M filas). Ver ADR-002.
- `pnpm --filter @renfe/api lint|test|test:e2e|build` en verde antes de cada PR.
