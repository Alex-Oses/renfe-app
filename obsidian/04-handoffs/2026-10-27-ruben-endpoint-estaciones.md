---
fecha: 2026-10-27
autor: Rubén (con OpenCode)
area: api
para: Marina, todos
rama: feat/api-estaciones
pr: pendiente
tags: [handoff]
---

# Handoff — `GET /estaciones` implementado contra el modelo de datos

## Qué se hizo

- `GET /estaciones?q=&feed=&limit=` implementado según [[endpoints]]: busca por nombre ignorando
  tildes y mayúsculas, filtra por feed y devuelve `{ datos, total }` con `feeds[]` por estación.
- SQL contra las tablas del modelo de datos de Marina (`estaciones` + `estacion_feeds`), tal como
  están en [[modelo-datos]] de la rama `docs/db-borrador-modelo-datos`:
  - `array_agg(distinct ef.feed)` para `feeds[]`, con `filter (where ef.feed is not null)` para que
    una estación sin feeds dé `[]` y no `[null]`;
  - `count(*) over ()` para el `total` real con una sola consulta;
  - `ciudad` nula → `""` (el contrato prohíbe inventarla);
  - `limit` 1–50 (20 por defecto) validado con DTO, `q` obligatorio de 1 a 60 caracteres.
- Sin `DATABASE_URL` el endpoint responde `503`; parámetros inválidos, `400`. Verificado en vivo.
- 6 tests nuevos con dobles de `BdService` (mapeo, parámetros, `ciudad` vacía, `total` 0, 503) y
  un e2e para el `400` sin `q`. Total: 16 unitarios + 2 e2e en verde.
- `ValidationPipe` añadido al e2e para que valide igual que `main.ts`.

## Qué queda

- **Probarlo contra una BD real.** En este PC no hay Docker ni Postgres, así que el SQL está
  razonado contra el modelo pero **no ejecutado**. Es lo primero que hay que hacer cuando existan
  las migraciones: si `translate()` o el `group by e.id` dan guerra, se ven en 30 segundos.
- **Rubén:** `/trenes` (búsqueda directa) y `/trenes/:feed/:tripId` en cuanto el SQL de
  `/estaciones` esté validado contra la BD.
- **Marina:** migraciones de §4 del modelo (las que necesita `/estaciones` son solo `estaciones` y
  `estacion_feeds`; con esas dos ya se puede probar esto de verdad).

## Bloqueos / preguntas para otros

- Nada bloqueante para este endpoint, pero sin migraciones no se puede verificar.
- Aviso: el filtro sin tildes usa `translate()` y **no** aprovecha el índice `pg_trgm` de
  `nombre`. Con ~1.150 estaciones da igual; queda anotado en el código.

## Cambios en contratos

- [[endpoints]]: `/estaciones` pasa de `propuesto · detallado` a **implementado**, con la nota del
  `translate()` y de que falta validarlo contra la BD.
- Sin cambios de forma: el contrato ya estaba escrito y se ha implementado tal cual.

## Ficheros tocados

- `backend/api/src/modules/estaciones/` (controlador, servicio, DTO, módulo, tests)
- `backend/api/src/app.module.ts`, `backend/api/test/app.e2e-spec.ts`, `backend/api/README.md`
- `obsidian/02-contratos-api/endpoints.md`
- `obsidian/04-handoffs/2026-10-27-ruben-endpoint-estaciones.md`
- `obsidian/01-estado/estado-equipo.md` (solo mi fila)
