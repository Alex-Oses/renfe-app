---
fecha: 2026-10-27
autor: Rubén
area: api
para: todos
rama: feat/api-detalle-tren
pr:
tags: [handoff, api, trenes]
estado: cerrado
---

# Handoff — `GET /trenes/:feed/:tripId` (detalle del viaje)

## Qué se hizo

Cuarto endpoint de datos: paradas y horas de un viaje concreto para una fecha ([[endpoints]]).

- **Una consulta** a `viajes` + `rutas` + `horarios` + `estaciones`, ordenada por `secuencia`. La
  fecha se resuelve con la misma condición que `/trenes`, ahora extraída a
  `common/gtfs/sql.ts` (`SERVICIO_ACTIVO`) para que no haya dos copias del trozo de SQL más
  delicado del modelo (calendarios + excepciones).
- `origen`/`destino` y `salida`/`llegada` salen de la primera y la última parada. Si a la primera le
  falta `sale` se usa su `llega`, y al revés en la última: GTFS exige una de las dos.
- `404` si el viaje no existe **o** si ese día no circula (la fecha se comprueba en la consulta).
- `400` si falta `fecha`, la fecha está mal formada o el `feed` no es `avld`/`cercanias`.

4 tests nuevos (mapeo de paradas y extremos, primera parada sin `sale`, `404` y `503`). 43 unitarios
+ 3 e2e en verde; lint y build limpios. Smoke test con `API_PORT=3010`: sin `fecha` → `400`, `feed`
inválido → `400`, fecha mal formada → `400`, sin `DATABASE_URL` → `503`, y las dos rutas de trenes
aparecen en `/docs-json`.

## Qué queda

- **`/incidencias`**: mismo patrón que `/posiciones` (`alerts.json`), ~69 avisos. No necesita BD.
- **`retrasoSeg`** (en el viaje y en cada parada): sale de `trip_updates.json`. Con `/posiciones`
  montado es poco trabajo añadir ese tercer feed.
- **Ver los tres endpoints de BD contra el Supabase real** cuando Marina tenga las migraciones.

## Bloqueos / preguntas para otros

- **Marina:** siguen sin confirmarse los **nombres de tabla** (`estaciones`/`horarios` sin prefijo
  vs. `gtfs_*` de [[sprint-actual]]). Afecta a `/estaciones`, `/trenes` y este detalle.
- **Todos:** `/trenes/:feed/:tripId/posicion` del contrato **no se puede implementar** con los datos
  actuales: el `tripId` de GTFS-RT no coincide con el `trip_id` estático. Marcado como bloqueado en
  [[endpoints]]; hace falta decisión (cruzar por número de tren + fecha, o retirarlo).
- **Alex:** el detalle ya tiene la forma que pide el contrato, así que `tipos.ts` puede apuntar a
  `/trenes/:feed/:tripId?fecha=` sin cambios de esquema.

## Cambios en contratos

[[endpoints]]: `/trenes/:feed/:tripId` pasa a **implementado** y `/trenes/:feed/:tripId/posicion`
queda marcado como **bloqueado** con el motivo.

## Ficheros tocados

- `backend/api/src/modules/trenes/` (`trenes.controller.ts`, `trenes.service.ts` + spec,
  `dto/detalle-tren.dto.ts`)
- `backend/api/src/common/gtfs/sql.ts` (nuevo: `SERVICIO_ACTIVO`), `common/gtfs/feeds.ts` (nuevo)
- `backend/api/src/modules/posiciones/` (usa `common/gtfs/feeds.ts`)
- `backend/api/README.md`, `obsidian/02-contratos-api/endpoints.md`
