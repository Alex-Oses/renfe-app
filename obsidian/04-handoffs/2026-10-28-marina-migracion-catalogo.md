---
fecha: 2026-10-28
autor: Marina (con OpenCode)
area: database
para: todos
rama: feat/db-migracion-catalogo-gtfs
pr: (pendiente de abrir)
tags: [handoff, base-datos, migracion, gtfs]
---

# Handoff — Primera migración: extensiones, identidad y catálogo GTFS

## Qué se hizo

Se escribieron las **tres primeras migraciones** de Supabase, **sin aplicarlas** en ningún entorno y
sin importar datos.

| # | Fichero | Contenido |
|---|---|---|
| 01 | `20261028120000_extensiones_y_funciones.sql` | Esquema `extensions`; `vector` y `pg_trgm`; función `set_actualizado_en()` |
| 02 | `20261028120100_identidad.sql` | `perfiles` + `embeddings_faciales`, con RLS |
| 03 | `20261028120200_catalogo_gtfs.sql` | `estaciones`, `estacion_feeds`, `rutas`, `calendarios`, `calendario_excepciones`, `viajes`, `horarios` + índices + RLS |

**Por qué cada línea está como está:** [[migracion-catalogo-gtfs]] (nota nueva). Está pensada como
guía de revisión: una tabla con *decisión → dónde se ve en el SQL → por qué*, separando lo que viene
de los feeds reales (A1–A8) de lo que he decidido yo porque el contrato no lo fija (B1–B19), más las
dudas abiertas para el revisor.

Los ficheros van **UTF-8 sin BOM** (importa por los literales `'añadido'`/`'eliminado'`, que deben
coincidir con `SERVICIO_ACTIVO` de `backend/api/src/common/gtfs/sql.ts`). Pasé un parser de
PostgreSQL sobre los tres: no hay erratas de sintaxis, pero **eso no sustituye a aplicarlos**.

También se actualizaron `backend/database/README.md` y `backend/database/supabase/migrations/README.md`
con el orden, el alcance y el aviso de «escritas y sin aplicar».

## Qué queda

1. **Revisar el SQL** (Rubén: es quien lo va a consumir; Alex: RLS y datos que ve la web).
2. **Aplicarlo en la VM** `genai-openllm-vm`: `pnpm db:start` + `pnpm db:reset`. Si sale en verde,
   importar el feed `avld` con [[plan-ingesta-gtfs]] (69 670 horarios, ~2–3 min).
3. Proyecto de Supabase en la nube y `DATABASE_URL` en Render: **es lo que desbloquea `/estaciones` y
   `/trenes`**, que hoy dan 503.
4. Segunda migración: `posiciones_trenes` + `incidencias` y reserva/pago/billete.

## Bloqueos / preguntas para otros

- **Alex:** en [[migracion-catalogo-gtfs]] §6 dejo una duda que te toca: el catálogo (`viajes`,
  `horarios`) es de **lectura pública con la clave `anon`** porque lo dice [[modelo-datos]] §7. Si
  prefieres que solo salga por la API, se quita el `grant select` de esas dos tablas.
- **Rubén:** el SQL asume los nombres que ya usa tu código (`viajes`, `calendarios`,
  `calendario_excepciones`, `horarios`, `estaciones`, `estacion_feeds`, `rutas`). Dos detalles:
  `viajes.numero` ya existe (para componer «ALVIA 00190`) y `rutas.nombre` es nullable, así que el
  importador lo rellena con `coalesce(route_long_name, route_short_name, '')` para que tu
  `FilaTren.nombre: string` no reciba `null`.
- **Kevin:** `embeddings_faciales` está sin políticas a propósito (solo `service_role`). Y sigue
  abierta tu duda de §10.2 del contrato (webhook de Stripe): **no bloquea** nada de esto.
- **Conflicto pequeño:** el PR del contrato (`docs/db-contrato-feeds-reales`) y este tocan los dos
  `obsidian/01-estado/estado-equipo.md`. Quien mergee el segundo resuelve una línea.

## Cambios en contratos

**Ninguno.** El SQL se escribió contra [[modelo-datos]] v2, que está en el PR
`docs/db-contrato-feeds-reales` (todavía sin mergear). Si ese PR cambia algo del esquema, esta
migración hay que ajustarla antes de aplicarla.

## Ficheros tocados

- `backend/database/supabase/migrations/20261028120000_extensiones_y_funciones.sql` (nuevo)
- `backend/database/supabase/migrations/20261028120100_identidad.sql` (nuevo)
- `backend/database/supabase/migrations/20261028120200_catalogo_gtfs.sql` (nuevo)
- `backend/database/supabase/migrations/README.md`
- `backend/database/README.md`
- `obsidian/05-areas/migracion-catalogo-gtfs.md` (nuevo)
- `obsidian/04-handoffs/2026-10-28-marina-migracion-catalogo.md` (este fichero)
- `obsidian/01-estado/estado-equipo.md` (solo mi fila)
