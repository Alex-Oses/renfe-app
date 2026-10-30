---
fecha: 2026-10-28
autor: Marina (con OpenCode)
area: database
para: [Alex, Rubén, Kevin]
rama: docs/db-contrato-feeds-reales
pr: (pendiente de abrir)
tags: [handoff, contrato, base-datos, gtfs]
estado: cerrado
---

# Handoff — Contrato v2 revisado contra los feeds reales

## Qué se hizo

Se descargaron e inspeccionaron los ficheros reales de Renfe (GTFS de Cercanías y de AV/LD/MD, el CSV
de estaciones y los cuatro endpoints de GTFS-RT) y se corrigió [[modelo-datos]] con lo que dicen los
datos. **No se ha generado ninguna migración ni se ha tocado ninguna base de datos.**

Cambios aplicados:

1. **`viajes` con horizonte real.** El feed **ya viene expandido por fecha**: AV/LD/MD trae 8 729
   viajes con la fecha dentro del `trip_id` (`0019012026-10-28`); Cercanías, 139 900 en 30 días con
   450 servicios de un solo día. Se añaden `fecha_inicio`, `fecha_fin` (para purgar), `origen_id`,
   `destino_id`, `salida`, `llegada` y `num_paradas` (calculadas en la importación), y se elimina
   `destino`, que viene vacío en AV/LD/MD.
2. **`viajes.numero`** (`trip_short_name`): es el número de tren. En AV/LD/MD `route_short_name` es
   el **producto** (`ALVIA`), no un número, así que sin esta columna la UI no puede componer
   «ALVIA 00190». `rutas.nombre` pasa a nullable porque `route_long_name` viene vacío.
3. **`posiciones_trenes.fecha_servicio`.** El GTFS-RT **no envía `trip.start_date`** (0 de ~450
   entidades), así que `feed` + `viaje_id` no identifican una fila: la clave pasa a
   `(feed, viaje_id, fecha_servicio)`. Se añaden `proxima_parada_id` (el `stopId` de RT es la
   **siguiente** parada), `proxima_secuencia`, `llegada_prevista` y `cancelado`, y se quita la FK a
   `viajes` para poder pintar trenes cuyo viaje ya se purgó.
4. **`incidencias` ajustada al `Alert` real.** El feed **no publica `headerText` ni `cause`/`effect`**
   (0 de 69 avisos): `titulo` pasa a nullable y se deriva de la descripción. `informedEntity` trae solo
   `routeId` en 45 avisos y solo `stopId` en 24. Solo hay alertas de **Cercanías** (`alerts_LD.json`
   → 404).
5. **`recoge`/`deja` con `default true`**: Cercanías no publica `pickup_type`/`drop_off_type`.
6. **Estaciones unificadas por el CSV.** `estaciones.id` = `CODIGO`: cubre el **100 %** de AV/LD/MD
   (1 008) y el **57 %** de Cercanías (650 de 1 147); las 497 restantes, por nombre + coordenadas y,
   si falla, id sintético `cer:<stop_id>` + informe manual.

También se actualizaron §1, §8 (volúmenes medidos), §9, §10.1 (seis respuestas nuevas), §10.2
(Kevin deja de bloquear), §11 y §12, y [[eventos-realtime]] con el payload nuevo.

## Dos cosas que desbloquean a Rubén

1. **El `tripId` de GTFS-RT SÍ coincide con el `trip_id` del GTFS estático**, si se compara **cada
   feed con el suyo**. La nota de [[endpoints]] dice que no coinciden (`0029112026-10-27` vs
   `3097L23537C1`), pero eso es comparar una posición del feed **AV/LD/MD** contra el estático de
   **Cercanías**. Comprobado con los ficheros de hoy:
   - `vehicle_positions.json` (Cercanías) → `3099X23512C1`, presente en `fomento_transit.zip`.
   - `vehicle_positions_LD.json` → `0019012026-10-28`, presente en `google_transit.zip`.
   Con `feed` + `tripId` + `fecha_servicio` se cruza sin trucos. **`/trenes/:feed/:tripId/posicion`
   deja de estar bloqueado**; solo hay que deducir la fecha (regla en [[modelo-datos]] §6.1).
2. **`numero` de la API:** `numeroDe()` saca los dígitos de `nombre_corto`
   (`frontend`/`API`: `trenes.service.ts`). En AV/LD/MD `nombre_corto` es `ALVIA`, así que devuelve
   `null` y la línea queda como «ALVIA». Con `viajes.numero` (de `trip_short_name`) se compone
   «ALVIA 00190». La consulta ya trae `v.*` por lo que solo hay que seleccionar `v.numero`.

## Encaje con lo ya implementado

La API de Rubén (en `develop`) ya consulta **nuestros nombres** (`viajes`, `calendarios`,
`calendario_excepciones`, `horarios`, `estaciones`, `estacion_feeds`, `rutas`), así que `gtfs_*` de
[[sprint-actual]] es solo una abreviatura. No hay que renombrar nada.
Una regla de importación para no romper su `FilaTren.nombre: string`: **`rutas.nombre` se rellena con
`coalesce(route_long_name, route_short_name, '')`** aunque el contrato la deje nullable.

## Documento nuevo

[[plan-ingesta-gtfs]]: alcance del sprint (solo AV/LD), fases, comandos, tolerancias del parser,
purga, enriquecimiento del mapa y reparto entre manual y automatizable.

## Entorno

Todo lo que necesite Docker, Supabase o contenedores se ejecuta en la **VM Linux de Azure
`genai-openllm-vm`**. Docker Desktop está bloqueado en el portátil corporativo: allí solo se escribe
código y documentación.

## Qué queda

- Revisión de [[modelo-datos]] v2 y de [[plan-ingesta-gtfs]] → contrato a `estado: aceptado`.
- **Primera migración** (`vector` + identidad + catálogo), sin RT ni reservas: **lo siguiente y lo que
  bloquea a Rubén**. No se ha empezado a propósito, a la espera de cerrar el contrato.
- Import del feed `avld` (69 670 horarios).
- Rellenar a mano el mapeo de las 497 paradas de Cercanías (fuera del sprint).
- Kevin: §10.2 antes del webhook de Stripe (no bloquea).

## Ficheros tocados

- `obsidian/02-contratos-api/modelo-datos.md`, `obsidian/02-contratos-api/eventos-realtime.md`
- `obsidian/05-areas/plan-ingesta-gtfs.md` (nuevo), `obsidian/05-areas/base-datos.md`
- `obsidian/01-estado/estado-equipo.md`, `obsidian/01-estado/sprint-actual.md`
- `obsidian/04-handoffs/2026-10-28-marina-contrato-v2.md` (este fichero)
