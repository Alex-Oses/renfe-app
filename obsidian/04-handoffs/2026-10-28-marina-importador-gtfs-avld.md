---
fecha: 2026-10-28
autor: Marina (IA: OpenCode)
area: database
para: [Marina, Alex, Rubén, Kevin]
rama: feat/gtfs-importador-catalogo-avld
pr: pendiente de abrir (3 ramas, ver abajo)
tags: [handoff, gtfs, supabase]
---

# Handoff — Catálogo AV/LD: migración, importación y siguiente paso

## Qué se hizo

### 1. Migración (rama `feat/db-migracion-catalogo-gtfs`)

- `20261028120200_catalogo_gtfs.sql`: extensiones + identidad + catálogo, **9 tablas**
  (`estaciones`, `estacion_feeds`, `rutas`, `calendarios`, `calendario_excepciones`,
  `viajes`, `horarios`, `perfiles`, `embeddings_faciales`) con RLS en todas.
- Escrita contra el contrato v2 de [[modelo-datos]] (rama `docs/db-contrato-feeds-reales`).
- **Validada en la VM `genai-openllm-vm`**: `pnpm db:start` y `pnpm db:reset` en verde,
  las 9 tablas creadas, sin errores de aplicación. Las 87 sentencias pasan el parser real
  de PostgreSQL (`pglast`), UTF-8 sin BOM, sin referencias hacia delante.

### 2. Importador (rama `feat/gtfs-importador-catalogo-avld`)

El worker estaba **vacío** (esqueleto con `echo`), así que se implementó el importador
completo en TypeScript, sin dependencias nuevas salvo `pg` (lector ZIP con `node:zlib` y
parser CSV propios):

- Descarga el feed AV/LD/MD y `estaciones.csv`, transforma al contrato (§4) y carga en
  **una transacción** por lotes de 1 000 filas con `jsonb_to_recordset`.
- `pnpm gtfs:importar` (`--simular`, `--reemplazar`, `--zip`, `--estaciones`) y
  `pnpm gtfs:verificar` (conteos, integridad y la consulta real de la API).
- 26 tests nuevos; `pnpm lint` y `pnpm test` en verde en todo el monorepo.

### 3. Carga real y verificación en la VM ✅

`pnpm gtfs:importar --reemplazar` y `pnpm gtfs:verificar`, **todo exacto y en verde**:

| Tabla | Filas |
|---|---|
| `estaciones` | 1 035 |
| `estacion_feeds` | 1 008 |
| `rutas` | 663 |
| `calendarios` | 8 729 |
| `calendario_excepciones` | 31 702 |
| `viajes` | 8 729 |
| `horarios` | 69 670 |

- 0 horarios huérfanos · 0 viajes sin horarios · 0 rutas en `otro` · 0 viajes con
  origen = destino · 0 viajes con salida > llegada.
- La consulta real de la API (`SERVICIO_ACTIVO`) devuelve viajes válidos para hoy.

**Conclusión: el catálogo AV/LD queda validado de punta a punta en local.** Lo que falta
no es técnico, es de repo y de despliegue.

## Qué queda

1. **Mergear las tres ramas**, en este orden (la migración está escrita contra el contrato v2):
   `docs/db-contrato-feeds-reales` → `feat/db-migracion-catalogo-gtfs` →
   `feat/gtfs-importador-catalogo-avld`. Mientras no estén en `develop`, el riesgo
   «la BD solo existe en la VM de Marina» **sigue abierto**.
2. **Supabase en la nube + Render** (siguiente paso recomendado, ver [[supabase-nube]]):
   crear proyecto, `db push`, cargar el catálogo, verificar y poner `DATABASE_URL`
   (**session pooler**) en Render. Es lo que desbloquea `/estaciones` y `/trenes`, hoy en 503.
3. **Idempotencia** (2 min, criterio de aceptación de [[plan-ingesta-gtfs]] §10): lanzar
   `pnpm gtfs:importar` **sin** `--reemplazar` y comprobar con `pnpm gtfs:verificar` que los
   conteos no cambian.
4. **Reimportación semanal programada** cuando el feed esté estable en la nube.
5. **Fuera de alcance**: Cercanías (497 paradas sin `CODIGO`), `posiciones_trenes` y Stripe.

## Bloqueos / preguntas para otros

- **Alex / Kevin:** la `DATABASE_URL` de Render la pone quien tenga acceso al panel; el
  runbook con la cadena correcta y los errores típicos está en [[supabase-nube]].
  `render.yaml` ya declara la variable con `sync: false`.
- **Rubén:** la verificación copia la condición `SERVICIO_ACTIVO` de
  `backend/api/src/common/gtfs/sql.ts`. Si la cambiáis, cambiadla también en
  `backend/gtfs-worker/src/verificar.ts` (está comentado a propósito).
- **Alex:** `rutas.nombre` nunca es `null` (se rellena con
  `route_long_name || route_short_name`), así que `FilaTren.nombre: string` se cumple.
- Nada bloquea el siguiente paso por mi parte.

## Cambios en contratos

Ninguno: el importador **implementa** [[modelo-datos]] tal cual. Las reglas de transformación
están documentadas en `backend/gtfs-worker/README.md` (§ Reglas de transformación) y en
[[migracion-catalogo-gtfs]].

## Ficheros tocados

- `backend/database/supabase/migrations/20261028120200_catalogo_gtfs.sql` (rama de la migración)
- `backend/gtfs-worker/src/`: `csv.ts`, `zip.ts`, `entorno.ts`, `sql.ts`, `bd.ts`,
  `importar.ts`, `verificar.ts`, `pruebas.test.ts`, `gtfs/{avld,estaciones,tiempo,tipo-servicio}.ts`
- `backend/gtfs-worker/package.json`, `tsconfig.json`, `README.md`, `src/README.md`
- `package.json` (scripts `gtfs:importar`, `gtfs:verificar`), `.env.example`, `pnpm-lock.yaml`
- `obsidian/05-areas/supabase-nube.md` (nuevo runbook), `obsidian/01-estado/estado-equipo.md`,
  este handoff
