# @renfe/api — API NestJS

**Responsable:** Rubén · IA: OpenCode

API REST única de la app. Contexto y diagramas: [`docs/arquitectura.md`](../../docs/arquitectura.md).

## Estado

Esqueleto listo (fase F0): Nest 12 (ESM), validación de entorno al arrancar, CORS, Swagger,
`GET /health`, auth de Supabase con roles y acceso opcional a Postgres.

**Endpoints de datos (fase F1): `GET /estaciones`, `GET /trenes`, `GET /trenes/:feed/:tripId`,
`GET /trenes/:feed/:tripId/posicion` y `GET /posiciones`**, con SQL directo contra el modelo de datos
de [`obsidian/02-contratos-api/modelo-datos.md`](../../obsidian/02-contratos-api/modelo-datos.md)
(sin ORM). Sin `DATABASE_URL` responden `503`. `/posiciones` y `/trenes/:feed/:tripId/posicion` son
la excepción: leen GTFS-RT de Renfe en memoria cada 30 s, no tocan la BD y funcionan sin Supabase.
`/posiciones` trae también el retraso real de `trip_updates` (puede ser negativo: tren adelantado).

Lo demás sigue pendiente: `/incidencias` y compañía necesitan las migraciones de Marina
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
  common/gtfs/        tiempo (horas GTFS → ISO con offset), feeds y el SQL de calendarios
  modules/
    estaciones/       GET /estaciones (SQL sobre estaciones + estacion_feeds)
    health/           GET /health
    posiciones/       GET /posiciones (GTFS-RT en memoria, sin BD) y la posición por viaje
    trenes/           GET /trenes, /trenes/:feed/:tripId y /:feed/:tripId/posicion
                      (precio y plazas simulados)
```

## Base de datos

`BdService` (`common/bd/`) crea un pool de `pg` **solo si existe `DATABASE_URL`**. Sin ella la API
arranca igual, `GET /health` devuelve `"baseDatos": "no configurada"` y los endpoints de datos
responderán `503`. Sin ORM: `bd.consultar(sql, valores)` y SQL a mano (ver ADR-002).

El `.env` se lee de la **raíz del monorepo** (`envFilePath: ['../../.env', '.env']`), porque los
scripts de pnpm corren en `backend/api` y no en la raíz.

### Probar contra la base de datos local (Docker)

```bash
# 1. Docker Desktop abierto
pnpm db:start                       # Supabase local: Postgres en 54322
pnpm db:reset                       # aplica las 4 migraciones + seed.sql
pnpm gtfs:importar                  # carga el feed avld (~70 000 horarios)

# 2. Copia .env.example a .env en la raíz y rellena SUPABASE_JWT_SECRET
#    (lo imprime `pnpm db:status`). DATABASE_URL ya apunta a localhost:54322.

# 3. Comprobación
pnpm --filter @renfe/api test:e2e   # los e2e de BD se saltan solos sin DATABASE_URL
pnpm dev:api                        # GET /health debe decir "baseDatos": "ok"
```

`test/bd.e2e-spec.ts` cubre el catálogo (`/estaciones`, `/trenes` y el detalle) y los caminos de
error del facial contra la BD real. Se salta entero si no hay `DATABASE_URL`, así que CI sigue verde
sin base de datos.

## Auth

`SupabaseJwtGuard` verifica el `Bearer` contra `SUPABASE_JWT_SECRET` (HS256) y deja en
`request.usuario` → `{ id, email, rol }`. **El rol no viaja en el token**: se lee de `perfiles.rol`
con una consulta por clave primaria (es donde vive según el modelo de datos y lo que usa
`resetear_cara`). Sin fila de perfil → `viajero`; si la BD no responde → `503`.
`RolesGuard` + `@Roles('revisor')` limitan endpoints por rol.

```ts
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles('revisor')
@Post('billetes/validar')
```

### Login facial

Dos formas de entrar, **un solo formato de token**. Con contraseña lo emite Supabase Auth; con la cara
lo firma la API (`HS256`, mismos claims, 12 h, sin `refresh_token`). Ver
`obsidian/03-decisiones/ADR-007-reconocimiento-facial.md`.

La API no decide nada: llama a las funciones de Postgres y traduce el `SQLSTATE` a HTTP.

| Función | SQLSTATE | HTTP |
|---|---|---|
| `registrar_cara` | `RF001` modelo distinto · `RF002` dimensión · `RF003` vector vacío | 400 |
| `registrar_cara` | `RF004` ya registrada | 409 |
| `registrar_cara` | `RF005` usuario inexistente | 404 |
| `resetear_cara` | `RF006` no es admin | 403 |

`verificar_cara` no lanza: devuelve `{ usuario_id, coincide, similitud, motivo }`. La `similitud` **no
se expone al cliente** (es un oráculo para reconstruir la plantilla); todos los fallos se responden con
el mismo `401`.

Código en `src/modules/auth/`: `POST /auth/cara/registrar` y `POST /auth/cara/reset` piden el `Bearer`
del login con contraseña; `POST /auth/cara/verificar` es público. El contrato está en
`obsidian/02-contratos-api/endpoints.md`.

`/auth/registro` y `/auth/login` con contraseña todavía no existen (los emite Supabase Auth), y
`/reservas` y `/billetes` llegarán después.

## Módulos previstos

| Módulo | Qué hace | Responsable |
|---|---|---|
| `auth` | Registro/login con Supabase Auth, login facial (la decisión la toma Postgres) | Rubén |
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
