---
fecha: 2026-10-28
autor: Marina (IA: OpenCode)
area: gtfs-worker
para: Marina
rama: feat/gtfs-importador-catalogo-avld
pr:
tags: [handoff, gtfs, importador]
---

# Handoff — Importador del catálogo GTFS AV/LD/MD

## Qué se hizo

El worker `backend/gtfs-worker` estaba **vacío** (solo un esqueleto con `echo`), así que
en vez de un runbook de comandos inexistentes se ha escrito el **importador completo**
en TypeScript, sin dependencias nuevas salvo `pg`.

- Descarga (o lee de disco) el zip del feed AV/LD/MD y el `estaciones.csv` de Renfe.
- Transforma al contrato de [[modelo-datos]] §4: `estaciones`, `estacion_feeds`, `rutas`,
  `calendarios`, `calendario_excepciones`, `viajes`, `horarios`.
- Carga en **una transacción**, en lotes de 1 000 filas con `jsonb_to_recordset`.
- `pnpm gtfs:verificar` comprueba conteos, integridad y la consulta real de la API.

Probado contra el feed real del **28/10** con `--simular`: salen exactamente las cifras
medidas (1 035 estaciones, 1 008 estacion_feeds, 663 rutas, 8 729 calendarios,
31 702 excepciones, 8 729 viajes, 69 670 horarios) y **0 rutas en `otro`**.
Los 7 `INSERT` pasan el parser real de PostgreSQL (`pglast`). `pnpm lint` y
`pnpm test` en verde en todo el monorepo (26 tests nuevos del worker).

## Qué queda

1. **Ejecutar la importación de verdad en la VM** (`genai-openllm-vm`), con el Supabase
   local ya levantado: `pnpm gtfs:importar --reemplazar` y luego `pnpm gtfs:verificar`.
   Comandos y variables en `backend/gtfs-worker/README.md`.
2. **Mergear antes la migración** (`feat/db-migracion-catalogo-gtfs`): este importador
   escribe en las 9 tablas de esa migración, que aún no está en `develop`.
3. **Supabase en la nube** con los datos cargados y `DATABASE_URL` en Render, para que
   `/estaciones` y `/trenes` dejen de dar 503.
4. Cercanías: fuera del sprint (497 paradas sin `CODIGO`), ver [[plan-ingesta-gtfs]].
5. Programar la importación a diario cuando esté estable en la nube.

## Bloqueos / preguntas para otros

- **Nada bloquea la ejecución** del importador: ya está escrito y probado en seco.
- Para Alex: `rutas.nombre` nunca es `null` (se rellena con `route_long_name ||
  route_short_name`), así que `FilaTren.nombre: string` se cumple.
- Para Rubén: la verificación copia la condición `SERVICIO_ACTIVO` de
  `backend/api/src/common/gtfs/sql.ts`; si la cambiáis, cambiadla también en
  `src/verificar.ts` (está comentado a propósito).

## Cambios en contratos

Ninguno: el importador **implementa** [[modelo-datos]] tal cual. Los detalles de la
transformación están en `backend/gtfs-worker/README.md` (§ Reglas de transformación) y
en [[migracion-catalogo-gtfs]].

## Ficheros tocados

- `backend/gtfs-worker/src/`: `csv.ts`, `zip.ts`, `entorno.ts`, `sql.ts`, `bd.ts`,
  `importar.ts`, `verificar.ts`, `pruebas.test.ts`, `gtfs/{avld,estaciones,tiempo,tipo-servicio}.ts`
- `backend/gtfs-worker/package.json`, `tsconfig.json`, `README.md`, `src/README.md`
- `package.json` (scripts `gtfs:importar`, `gtfs:verificar`), `.env.example`, `pnpm-lock.yaml`
- `obsidian/01-estado/estado-equipo.md`, este handoff
