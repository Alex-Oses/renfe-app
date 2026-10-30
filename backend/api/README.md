# @renfe/api — API NestJS

**Responsable:** Rubén · IA: OpenCode

API REST única de la app. Contexto y diagramas: [`docs/arquitectura.md`](../../docs/arquitectura.md).

## Estado

Esqueleto listo (fase F0): Nest 12 (ESM), validación de entorno al arrancar, CORS, Swagger,
autenticación propia con roles y acceso opcional a Postgres.

**Endpoints de datos (fase F1): `GET /estaciones`, `GET /trenes`, `GET /trenes/:feed/:tripId`,
`GET /trenes/:feed/:tripId/posicion` y `GET /posiciones`**, con SQL directo contra el modelo de datos
de [`obsidian/02-contratos-api/modelo-datos.md`](../../obsidian/02-contratos-api/modelo-datos.md)
(sin ORM). Sin `DATABASE_URL` responden `503`. `/posiciones` y `/trenes/:feed/:tripId/posicion` son
la excepción: leen GTFS-RT de Renfe en memoria cada 30 s, no tocan la BD y funcionan sin Supabase.
`/posiciones` trae también el retraso real de `trip_updates` (puede ser negativo: tren adelantado).

Los datos son reales (GTFS) y el resto va simulado: **`POST /auth/registro` y `POST /auth/login`**
(Supabase Auth con `service_role`), **login facial** (`/auth/cara/*`), **`POST /reservas`** (pago
simulado: crea la reserva pagada y emite un billete con QR por pasajero), **`GET /billetes`**,
**`GET /billetes/:id/qr`**, **`POST /billetes/validar`** (rol `revisor`/`admin`) y **`/abonos`**
(`GET`, `POST` y `GET /:id`). El contrato está en
[`obsidian/02-contratos-api/endpoints.md`](../../obsidian/02-contratos-api/endpoints.md).

`POST /chatbot/mensaje` ofrece consultas conversacionales sobre estaciones, trenes y posiciones en
tiempo real. Usa Gemini con herramientas internas de solo lectura y un contexto/guardrails que impiden
prompt injection, acceso a SQL, URLs arbitrarias ni a los datos privados de otro usuario. Requiere
`GEMINI_API_KEY`; sin esa
variable responde `503`, pero la API puede arrancar y servir el resto de rutas.

Lo demás sigue pendiente: `/incidencias` y compañía necesitan las migraciones de Marina
(`backend/database/`) y el worker GTFS, y `/pagos/*` es Stripe en modo test (Kevin).

## Arrancar

```bash
pnpm install
pnpm dev:api        # desde la raíz del monorepo
```

La API carga el `.env` del directorio de trabajo y, si no existe, el `.env` de la raíz del
monorepo. No es necesario crear un `.env` adicional dentro de `backend/api`.

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
  common/bd/          BdService: pool de Postgres opcional (+ transacciones)
  common/gtfs/        tiempo (horas GTFS → ISO con offset), feeds y el SQL de calendarios
  common/qr/          firma y verificación de los QR RNF1/RNA1 (HMAC-SHA256)
  common/simulado/    precio simulado y determinista
  modules/
    abonos/           GET/POST /abonos y GET /abonos/:id (QR RNA1)
    auth/             /auth/registro, /auth/login (Supabase Auth) y /auth/cara/*
    billetes/         GET /billetes, /billetes/:id/qr y POST /billetes/validar
    chatbot/          POST /chatbot/mensaje (Gemini + tools de consultas públicas)
    estaciones/       GET /estaciones (SQL sobre estaciones + estacion_feeds)
    health/           GET /health
    posiciones/       GET /posiciones (GTFS-RT en memoria, sin BD) y la posición por viaje
    reservas/         POST /reservas (pago simulado, butacas y QR por pasajero)
    trenes/           GET /trenes, /trenes/:feed/:tripId y /:feed/:tripId/posicion
                      (precio y plazas simulados)
```

## Base de datos

`BdService` (`common/bd/`) crea un pool de `pg` **solo si existe `DATABASE_URL`**. Sin ella la API
arranca igual, `GET /health` devuelve `"baseDatos": "no configurada"` y los endpoints de datos
responderán `503`. Sin ORM: `bd.consultar(sql, valores)` y SQL a mano (ver ADR-002).

## Auth

`SupabaseJwtGuard` verifica el `Bearer` contra `JWT_SECRET` (HS256) y deja en
`request.usuario` → `{ id, email, rol }`. El rol sale de `app_metadata.rol` (`viajero` por defecto,
`revisor` y `admin` explícitos). `RolesGuard` + `@Roles('revisor')` limitan endpoints por rol.

```ts
@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles('revisor')
@Post('billetes/validar')
```

### Login facial

Dos formas de entrar, **un solo formato de token propio de la API**. Supabase Auth solo valida las
credenciales internamente; tanto con contraseña como con la cara lo firma la API (`HS256`, mismos
claims, 12 h, sin `refresh_token`). Ver
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

### Registro y login con contraseña

`POST /auth/registro` y `POST /auth/login` usan **Supabase Auth con `service_role`**
(`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`): la API crea el usuario y su fila en `perfiles`, y
devuelve un JWT propio firmado con `JWT_SECRET` más el perfil (`nombre`, `rol` y `caraRegistrada`). El alta
siempre nace con rol `viajero`; el rol no se puede tocar desde el cliente.

Código en `src/modules/auth/`. El contrato está en `obsidian/02-contratos-api/endpoints.md`.

### QR de billetes y abonos

`common/qr/firma.ts` firma `RNF1.<datos>.<firma>` y `RNA1.<datos>.<firma>` con **HMAC-SHA256** y
`QR_SIGNING_SECRET` (32+ caracteres; sin él, emitir un billete o abono responde `503`). El contrato
prevé Ed25519 con `QR_SIGNING_PRIVATE_KEY`; cambiar la firma no toca los servicios ni el formato.

## Módulos

| Módulo | Qué hace | Responsable |
|---|---|---|
| `auth` | Registro/login con Supabase Auth, login facial (la decisión la toma Postgres) | Rubén |
| `estaciones` | Búsqueda de estaciones sobre datos GTFS | Rubén |
| `trenes` | Búsqueda por origen/destino/fecha, detalle, retrasos, posiciones | Rubén |
| `reservas` | Reserva pagada simulada: butacas y un billete con QR por pasajero | Rubén |
| `pagos` | PaymentIntent de Stripe test + webhook (pendiente) | Kevin |
| `billetes` | Mis billetes, QR firmado y validación para el revisor | Rubén |
| `abonos` | Abonos y bonos simulados con QR propio | Rubén |
| `chatbot` | Gemini API con function calling y guardrails | Rubén |

## Reglas

- Cada endpoint se escribe en `obsidian/02-contratos-api/endpoints.md` **antes** de implementarlo.
- Swagger siempre al día: es la documentación viva de la API.
- Sin ORM: `pg` + SQL para horarios (1,9 M filas). Ver ADR-002.
- `pnpm --filter @renfe/api lint|test|test:e2e|build` en verde antes de cada PR.
