---
fecha: 2026-10-27
autor: Rubén
area: api
para: todos
rama: feat/api-busqueda-trenes
pr: 33
tags: [handoff, api, trenes]
estado: cerrado
---

# Handoff — `GET /trenes` (búsqueda de viajes directos)

## Qué se hizo

Segundo endpoint de datos del [[endpoints|contrato]]: `GET /trenes?origen=&destino=&fecha=&limit=`.

- **SQL de una sola consulta** contra `horarios`, `viajes`, `rutas` y `estaciones` del
  [[modelo-datos]]: self-join de `horarios` (misma estación de origen y de destino dentro del mismo
  viaje, con `d.secuencia > o.secuencia`), `recoge`/`deja` para descartar paradas técnicas y la
  fecha resuelta en la misma consulta con `calendarios` + `calendario_excepciones` (festivos y
  refuerzos, `añadido` gana a `eliminado`).
- `total` real con `count(*) over ()`; `numParadas` con una subconsulta entre las dos secuencias.
- **`common/gtfs/tiempo.ts`**: horas GTFS → ISO 8601 con offset de Madrid. GTFS permite horas
  ≥ 24 (`25:10` = 01:10 del día siguiente) y el offset cambia con el horario de verano, así que la
  conversión se hace en JS con `Intl` en vez de en Postgres. 9 tests, incluidos los dos cambios de
  hora de 2026 y el salto de mes y de año.
- `precioDesde` y `plazasLibres` son **simulados y deterministas** (hash FNV de
  `feed:tripId:fecha`): la misma búsqueda devuelve siempre lo mismo, para que la demo no cambie.
- `400` sin parámetros o con `fecha` mal formada, `404` si una estación no existe, `503` sin BD.

Tests: 11 unitarios de `TrenesService` (mapeo, parámetros, determinismo, `nombre_corto`/`tipo_servicio`
nulos, `total` 0, 404, 503), 9 de `tiempo`, 2 e2e (`400` sin parámetros y con fecha inválida).
27 unitarios + 3 e2e en verde; lint y build también. Smoke test real con `API_PORT=3010`:
`/trenes` sin parámetros → `400`, con parámetros y sin `DATABASE_URL` → `503`, y aparece en
`/docs-json`.

## Qué queda

- **Verlo contra el Supabase de verdad.** El SQL está razonado contra el modelo pero **no
  ejecutado** (en este PC no hay Docker ni Postgres). Es lo primero al llegar las migraciones.
  Como con `/estaciones`, PGlite sirve para validarlo en local pero **no se queda en el repo**:
  rompe el preview de Vercel.
- **`/trenes/:feed/:tripId`** (detalle con paradas) y **`/posiciones`** (GTFS-RT en memoria cada
  30 s). `/posiciones` es lo que desbloquea el mapa de la demo.
- **`retrasoSeg` es siempre `null`** hoy: `/trenes` no consulta GTFS-RT. Se rellena cuando exista
  `/posiciones`.

## Bloqueos / preguntas para otros

- **Marina:** confirmar los **nombres de tabla**. Tu [[modelo-datos]] usa `estaciones`, `horarios`…
  sin prefijo, pero [[sprint-actual]] habla de tablas `gtfs_*`. El SQL de `/estaciones` y `/trenes`
  usa los nombres sin prefijo. Si al migrar les pones prefijo, hay que tocar las dos queries.
  - También: ¿entra **Cercanías** en la importación o solo AVE/LD? El endpoint funciona con
    cualquiera de los dos, pero el plan habla solo de AVE/LD.
- **Alex:** `numero` **puede ser `null`** (si `route_short_name` no acaba en número) y `tipo` puede
  ser `"DESCONOCIDO"`. Que la UI tenga plan B para los dos.
- **Kevin:** la CI sigue sin ejecutar lint ni tests. Estos dos endpoints están verdes en local pero
  nadie lo comprueba en cada PR.

## Cambios en contratos

[[endpoints]]: `/trenes` pasa a **implementado** y se afinan las notas (`retrasoSeg` siempre `null`
de momento, `tipo` desde `rutas.tipo_servicio`, `numero` puede ser `null`).

## Ficheros tocados

- `backend/api/src/common/gtfs/tiempo.ts` (+ `tiempo.spec.ts`)
- `backend/api/src/modules/trenes/` (`trenes.controller.ts`, `trenes.service.ts` + spec,
  `trenes.module.ts`, `dto/buscar-trenes.dto.ts`, `simulado.ts`)
- `backend/api/src/app.module.ts`, `backend/api/test/app.e2e-spec.ts`, `backend/api/README.md`
- `obsidian/02-contratos-api/endpoints.md`
