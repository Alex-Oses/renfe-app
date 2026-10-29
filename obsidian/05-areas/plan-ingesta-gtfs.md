---
responsable: Marina
estado: propuesta
fecha: 2026-10-28
tags: [area, gtfs, ingesta, plan]
para: [Alex, Rubén, Kevin]
---

# Plan de ingesta GTFS y GTFS-RT

> Propuesta de trabajo para la primera carga de datos reales. **No es un contrato**: el esquema está
> en [[modelo-datos]] y los endpoints en [[endpoints]]. Cualquier cambio de columnas se hace primero
> allí. Nada de esto se ejecuta todavía: primero se revisa.

## 1. Objetivo

Pasar de una base vacía a una base con el catálogo real de Renfe, de forma **repetible** (idempotente),
**verificable** (conteos y validaciones) y **acotada** (sin reventar el plan gratuito de Supabase).

## 1.bis Alcance según el Sprint final (28/10 – 06/11)

[[sprint-actual]] recorta el alcance: entra **solo GTFS estático de AVE/LD/MD** y **Cercanías queda
fuera**. Eso simplifica mucho la primera carga: **663 rutas, 1 008 paradas, 8 729 viajes y 69 670
horarios**, no los 2 M de las dos redes. Tiempo estimado: **~2–3 min** en la VM.

| Fase | ¿Entra en el sprint? |
|---|---|
| 0–4 (config, estaciones, rutas, calendarios, viajes) | Sí, solo feed `avld` |
| 5 (horarios) | Sí, solo feed `avld` (69 670 filas) |
| 5-bis (horarios y viajes de Cercanías) | **No**; queda preparado y se lanza cuando haya margen |
| 6 (validaciones) | Sí |

Las fases están escritas para los dos feeds, pero el importador acepta `--feeds avld` y es lo que se
usará en el sprint.

> `gtfs_*` en [[sprint-actual]] es una abreviatura: las tablas reales se llaman `estaciones`,
> `viajes`, `horarios`… como en [[modelo-datos]] y como ya consulta la API de Rubén.

## 2. Fuentes reales (medidas el 28/10/2026)

| Fuente | URL | Contenido |
|---|---|---|
| GTFS Cercanías | `https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip` | 274 rutas · 1 147 paradas · 139 900 viajes · 450 calendarios · **sin `calendar_dates`** · 1 918 539 horarios |
| GTFS AV/LD/MD | `https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip` | 663 rutas · 1 008 paradas · 8 729 viajes · 8 729 calendarios · 31 702 excepciones · 69 670 horarios |
| Estaciones (CSV) | `https://ssl.renfe.com/ftransit/Fichero_estaciones/estaciones.csv` | 1 035 estaciones. **CSV `;`, latin-1**, no GTFS |
| RT posiciones | `gtfsrt.renfe.com/vehicle_positions.pb` · `vehicle_positions_LD.pb` | ~450 y ~210 vehículos |
| RT trip updates | `gtfsrt.renfe.com/trip_updates.pb` · `trip_updates_LD.pb` | ~446 y ~212 viajes |
| RT alerts | `gtfsrt.renfe.com/alerts.pb` | 69 avisos. **Solo Cercanías** (`alerts_LD.json` → 404) |

Horizontes: Cercanías **30 días** (reimportar a diario); AV/LD/MD hasta **29/09/2027** (reimportar
semanalmente). Los `trip_id` de AV/LD/MD llevan la fecha dentro (`0019012026-10-28`).

## 3. Dónde se ejecuta

| Tarea | Dónde |
|---|---|
| Escribir código, scripts y documentación | Portátil (este repo) |
| `supabase start/stop`, migraciones, import completo, validaciones | **VM Linux de Azure `genai-openllm-vm`** |

Docker Desktop está bloqueado en el portátil corporativo: todo lo que necesite contenedores se lanza
por SSH en la VM. Para desarrollo, `pnpm db:start` contra la VM o contra un proyecto Supabase de
pruebas; nunca asumir Docker local.

## 4. Fases

| Fase | Comando | Qué hace | Salida |
|---|---|---|---|
| 0 | — | `.env`: `GTFS_CERCANIAS_URL`, `GTFS_AVLD_URL`, `GTFS_ESTACIONES_URL`, `GTFS_RT_*_URL`, `SUPABASE_DB_URL`. `data/` en `.gitignore` | Configuración |
| 1 | `pnpm gtfs:inspect` | Descarga, descomprime en streaming y **compara conteos con los esperados** de §2 | Informe de integridad; aborta si el feed cambió de forma |
| 2 | `pnpm gtfs:import:estaciones` | `estaciones.csv` → `estaciones` (1 035) y `stops.txt` de ambos feeds → `estacion_feeds` (2 155) | Informe de **497 paradas de Cercanías sin `CODIGO`** |
| 2b | — | Relleno manual de `data/mapeo-estaciones.csv` (se commitea: solo ids y nombres) | Unificación cerrada |
| 3 | `pnpm gtfs:import:catalogo` | `routes` (274 + 663) → `rutas` con `tipo_servicio`; `calendar` + `calendar_dates` → `calendarios` y excepciones (31 702) | Catálogo de servicios |
| 4 | `pnpm gtfs:import:viajes` | `trips` → `viajes` (148 629) calculando de paso `origen_id`, `destino_id`, `salida`, `llegada`, `num_paradas`, `numero`, `fecha_inicio`, `fecha_fin` | Viajes con resumen listo para `/trenes` y el mapa |
| 5 | `pnpm gtfs:import:horarios` | `stop_times` → `horarios` (~2 M) con `COPY` en lotes por feed | Tabla grande cargada |
| 6 | `pnpm gtfs:validate` | Huérfanos, viajes sin paradas, paradas sin estación, horas `> 24 h`, estaciones sin feed | Validación en verde |

Tiempo estimado en la VM: **8–12 min** la carga completa; **~2 min** las diarias.

## 5. Decisiones de carga

- **Ventana de días según entorno.** Local/dev: `--dias 7` (~450 000 horarios, ~180 MB). VM/prod:
  feed completo. Motivo: `horarios` + índices ocupa 350–450 MB y el plan gratuito de Supabase son
  500 MB.
- **`COPY`, no `insert` por HTTP.** 2 M de filas con `supabase-js` es inviable. Se usa el cliente
  `pg` con `pg-copy-streams` contra `SUPABASE_DB_URL` y un esquema `staging`.
- **Import atómico por feed.** `begin; delete` de lo caducado → carga en `staging` → `insert … select`
  con `on conflict do update` → `commit`. O entra el feed entero o no entra nada.
- **Idempotencia por clave natural.** Volver a lanzar la importación no duplica nada.
- **Purga.** Tras importar: borrar posiciones de viajes caducados y después los viajes con
  `fecha_fin < hoy − 2` (margen para trenes `24:xx`/`25:xx`).
- **Orden obligatorio:** estaciones → rutas → calendarios → viajes → horarios (respeta las FKs).
- **Tolerancias del parser** (si no, la carga falla):
  - `trim` en todos los campos (Cercanías trae relleno: `10T0001C1  `, `C1  `).
  - Horas `H:MM:SS` y `HH:MM:SS` (AV/LD/MD escribe `8:30:00`).
  - `stop_sequence` con ceros (`01`) → entero.
  - `calendar_dates.txt` puede no existir (Cercanías).
  - CSV de estaciones en **latin-1** y separado por `;`.
  - `pickup_type`/`drop_off_type` pueden no existir (Cercanías) → `recoge`/`deja` a `true`.

## 6. Unificación de estaciones

1. `estaciones.csv` es la **fuente canónica**: `estaciones.id` = `CODIGO`.
2. `stops.txt` de cada feed → `estacion_feeds`: **1 008/1 008** paradas de AV/LD/MD casan por código;
   **650/1 147** de Cercanías también.
3. Las **497** restantes se intentan por nombre normalizado + distancia (~150 m).
4. Las que sigan sin pareja entran con id `cer:<stop_id>` y aparecen en
   `data/informes/estaciones-huerfanas.csv` para revisión humana (marina).

## 7. Enriquecimiento del mapa

El worker **no** resuelve nombres: guarda ids y números. El texto lo pone una vista SQL.

```
posiciones_trenes
  ⨝ viajes  (feed, viaje_id)      → origen_id, destino_id, salida, llegada, numero, num_paradas
  ⨝ rutas   (feed, ruta_id)       → nombre_corto (línea), tipo_servicio (tipo)
  ⨝ estaciones × 3                → origen, destino, próxima parada
```

Campos derivados para la API: `salida_prevista`/`llegada_prevista` = horario + `retraso_seg`;
`paradas_restantes` = `num_paradas − proxima_secuencia`; frase de estado según `estado`
(`IN_TRANSIT_TO`/`INCOMING_AT` → «en marcha hacia X», `STOPPED_AT` → «parado en X»).

Resolución de `fecha_servicio` (el feed no manda `start_date`): si `fecha_inicio = fecha_fin`, esa
fecha; si es rango, se prueban {hoy, ayer} en `Europe/Madrid` y se elige el candidato en el que el
viaje circula y `salida − 2 h ≤ ahora ≤ llegada + 4 h`.

Pendiente de Rubén en [[endpoints]]: Alex ya propuso los campos exactos en
`GET /posiciones` — `nombre` (tipo + número comercial), `linea` (solo Cercanías), `origen`,
`destino`, `proximaParada { id, nombre, llegada }` y `llegadaDestino`, todos opcionales. Encajan con
`viajes.numero` + `rutas.tipo_servicio` + `viajes.origen_id`/`destino_id` + `horarios`. `rumbo` y
`velocidadKmh` se pueden retirar: Renfe no los publica.

Dos caminos válidos, a decidir con Alex y Rubén:

1. **API en memoria (lo que hay hoy):** `/posiciones` sondea Renfe cada 30 s y enriquece en el
   proceso. No necesita `posiciones_trenes` ni worker; a cambio, el catálogo tiene que estar en BD
   para hacer el join.
2. **Worker + Realtime (lo que diseña [[modelo-datos]]):** el worker escribe `posiciones_trenes` y la
   API sirve la vista enriquecida. Añade infraestructura (proceso aparte) y el sprint lo deja fuera.

Para el sprint, **(1)** es suficiente: el enriquecimiento se hace en la misma consulta que ya existe
contra `viajes`/`horarios`/`estaciones`. El modelo soporta las dos.

## 8. Reparto

**Manual (Marina):** revisar las 497 estaciones huérfanas · ajustar las palabras clave de
`tipo_servicio` cuando el worker reporte las rutas en `otro` · lanzar la importación en la VM ·
validar los conteos · abrir los PRs.

**Automatizable:** los scripts de descarga e inspección · el importador con `COPY` · el informe de
huérfanas · las columnas resumen de `viajes` · la vista de enriquecimiento · el poller de GTFS-RT ·
las consultas de validación y los tests de humo.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| El feed cambia de formato sin avisar | `gtfs:inspect` compara conteos y columnas; si algo no cuadra, aborta antes de tocar la BD |
| 500 MB del plan gratuito | Ventana de 7 días en local; feed completo solo en la VM |
| 497 estaciones sin código | Informe + mapeo manual versionado en `data/mapeo-estaciones.csv` |
| Viajes purgados con trenes aún circulando | Margen de 2 días y posiciones sin FK |
| Cercanías con 30 días de horizonte | Reimportación diaria programada; alerta si el feed no se renueva |

## 10. Criterios de aceptación

- `gtfs:validate` sin huérfanos y con los conteos de §2 (± 5 % por variación normal del feed).
- `GET /trenes?fecha=` devuelve viajes reales con origen, destino, salida y llegada.
- `GET /posiciones` devuelve trenes con línea, origen, destino y próxima parada legibles.
- `GET /incidencias` devuelve los avisos vigentes de Cercanías con línea y parada.
- Reimportar dos veces seguidas no duplica filas ni rompe claves.
