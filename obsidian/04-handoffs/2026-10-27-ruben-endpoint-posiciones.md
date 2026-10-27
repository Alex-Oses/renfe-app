---
fecha: 2026-10-27
autor: Rubén
area: api
para: todos
rama: feat/api-posiciones
pr: (apilada sobre #33)
tags: [handoff, api, posiciones, gtfs-rt]
---

# Handoff — `GET /posiciones` con GTFS-RT real

## Qué se hizo

Tercer endpoint de datos: `GET /posiciones?bbox=&feed=` ([[endpoints]]).

- **Lee GTFS-RT de Renfe en memoria cada 30 s** (`GTFS_RT_POLL_SECONDS`), sin worker, sin BD y sin
  añadir dependencias: Renfe publica también el feed **en JSON**, así que no hace falta
  `gtfs-realtime-bindings` ni protobuf.
- Dos feeds: `avld` (`vehicle_positions_LD.json`) y `cercanias` (`vehicle_positions.json`). Las URLs
  se pueden sobrescribir con `GTFS_RT_URL_AVLD` / `GTFS_RT_URL_CERCANIAS`.
- Una sola descarga por intervalo (promesas compartidas), así que N peticiones simultáneas no
  martillean a Renfe. Si Renfe falla se sigue sirviendo el último snapshot bueno y `actualizado`
  deja de avanzar; solo hay `503` si nunca se pudo leer.
- Filtro por `bbox` (`minLon,minLat,maxLon,maxLat`, `400` si los mínimos van al revés) y por `feed`.
- `common/gtfs/tiempo.ts`: nuevo `instanteAIso()` para pasar un epoch de GTFS-RT al reloj de Madrid
  con su offset (`2026-10-27T08:53:34+01:00`).

**Probado contra Renfe de verdad**, no solo con dobles: 508 posiciones en un snapshot (210 AVE/LD +
298 Cercanías), `bbox` de Madrid → 112 trenes, `bbox` invertida → `400`, y la ruta aparece en
`/docs-json`. 11 tests unitarios nuevos (mapeo, m/s → km/h, entidades sin posición, `bbox`, `feed`,
caché, Renfe caída con y sin datos previos). 39 unitarios + 3 e2e en verde; lint y build limpios.

## Qué queda

- **`/trenes/:feed/:tripId`** (detalle con paradas): es el que falta para la ficha del viaje.
- **`/incidencias`**: mismo patrón que `/posiciones` (`alerts.json`), ~69 avisos.
- **`retrasoSeg`**: sale de `trip_updates.json`. Con `/posiciones` montado es media hora de trabajo
  añadir un tercer feed y rellenarlo.

## Bloqueos / preguntas para otros

- **Marina:** confirmar los **nombres de tabla** (`estaciones`/`horarios` sin prefijo vs. `gtfs_*`
  de [[sprint-actual]]). Afecta al SQL de `/estaciones` y `/trenes`, no a `/posiciones`.
  - Y, si el worker sigue en pie: **el feed también está en `.json`**, se ahorra la dependencia de
    protobuf.
- **Alex:** el mapa **ya puede apuntar a `/posiciones` de verdad**, no hace falta esperar a la BD.
  Campos que la web debe tolerar como `null`: `rumbo`, `velocidadKmh` y `retrasoSeg`.
- **Todos — decisión pendiente:** el `tripId` de GTFS-RT (`0029112026-10-27`) **no coincide** con el
  `trip_id` del GTFS estático (`3097L23537C1`). Para el mapa da igual, pero
  `/trenes/:feed/:tripId/posicion` del contrato **no se puede implementar tal cual**: habría que
  cruzar por número de tren + fecha, o quitar ese endpoint y quedarse solo con `/posiciones`. Lo
  dejo abierto; no lo toco sin acuerdo.

## Cambios en contratos

[[endpoints]]: `/posiciones` pasa a **implementado**, con las notas de qué es `null` hoy y con el
aviso del `tripId`. `.env.example`: `GTFS_RT_URL_AVLD` y `GTFS_RT_URL_CERCANIAS`.

## Ficheros tocados

- `backend/api/src/modules/posiciones/` (`posiciones.controller.ts`, `posiciones.service.ts` + spec,
  `posiciones.module.ts`, `dto/posiciones.dto.ts`)
- `backend/api/src/common/gtfs/tiempo.ts` (+ spec: `instanteAIso`)
- `backend/api/src/app.module.ts`, `backend/api/README.md`, `.env.example`
- `obsidian/02-contratos-api/endpoints.md`
