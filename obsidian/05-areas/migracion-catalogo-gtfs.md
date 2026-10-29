---
responsable: Marina
estado: para revisión
fecha: 2026-10-28
tags: [area, base-datos, migracion, gtfs, revision]
para: [Alex, Rubén, Kevin]
---

# 🧱 Migración 01 — extensiones, identidad y catálogo GTFS

> **Guía de revisión del SQL.** El esquema está en [[modelo-datos]] (§3 y §4) y la carga de datos en
> [[plan-ingesta-gtfs]]. Aquí solo está **por qué** cada línea es como es, para que revisar
> `backend/database/supabase/migrations/` no obligue a reconstruir la conversación.
>
> **Estado: escrita y NO aplicada.** Ni `supabase start`, ni `db reset`, ni importaciones. Se aplica
> en la VM Linux de Azure `genai-openllm-vm`.

## 1. Qué hay

| # | Fichero | Contenido |
|---|---|---|
| 01 | `20261028120000_extensiones_y_funciones.sql` | Esquema `extensions`; `vector` y `pg_trgm`; función `set_actualizado_en()` |
| 02 | `20261028120100_identidad.sql` | `perfiles` (RLS del propio perfil, `rol` intocable) y `embeddings_faciales` (sin acceso desde la app) |
| 03 | `20261028120200_catalogo_gtfs.sql` | Las 7 tablas del catálogo + índices + RLS de lectura pública |

Orden obligatorio: 02 usa la función y el esquema de 01; 03 usa `pg_trgm` y la función.
Fuera, a propósito: `posiciones_trenes`, `incidencias`, `reservas`, `asientos`, `pagos`, `billetes`
y `validaciones` (segunda migración).

> Esta rama parte de `develop`, donde todavía no están [[modelo-datos]] v2 ni
> [[plan-ingesta-gtfs]] (van en el PR `docs/db-contrato-feeds-reales`). Los enlaces resuelven en
> cuanto se mergee ese PR; el SQL ya está escrito contra el contrato v2.

## 2. Decisiones que vienen de los feeds reales

Son las que cambian el SQL respecto al borrador del 26/10.

| # | Decisión | Dónde se ve en el SQL | Por qué |
|---|---|---|---|
| A1 | **`viajes` tiene horizonte**: `fecha_inicio`, `fecha_fin` | `03`, tabla `viajes` + índice `viajes_feed_horizonte_idx` y `viajes_fecha_fin_idx` | El feed **ya viene expandido por fecha**: AV/LD/MD trae la fecha dentro del `trip_id` (`0019012026-10-28`) y Cercanías 139 900 viajes en 30 días. La fecha sirve para acotar `GET /trenes?fecha=` y para purgar lo caducado |
| A2 | **`viajes.numero`** (`trip_short_name`) | `03`, columna `numero text` (nullable) | En AV/LD/MD `route_short_name` es el **producto** (`ALVIA`), no un número: sin esta columna la UI no puede componer «ALVIA 00190». En Cercanías no existe → `null` |
| A3 | **`rutas.nombre` nullable** | `03`, `nombre text` sin `not null` | `route_long_name` viene **vacío en las 663 rutas** de AV/LD/MD. El `comment` de la columna recuerda la regla de importación: `coalesce(route_long_name, route_short_name, '')`, para no romper `FilaTren.nombre: string` de la API |
| A4 | **`horarios.recoge`/`deja` con `default true`** | `03`, `recoge boolean not null default true` | Cercanías publica `stop_times.txt` con **solo 5 columnas**: no hay `pickup_type`/`drop_off_type`. El `COPY` puede omitir las columnas y quedan a `true` |
| A5 | **`estaciones.id` = `CODIGO` del CSV** | `03`, PK `estaciones.id` y `estacion_feeds.stop_id` aparte | `estaciones.csv` es la fuente canónica (1 035 estaciones): cubre el 100 % de AV/LD/MD y el 57 % de Cercanías. Sin el CSV habría que unificar «Atocha» por heurísticas. Las huérfanas entran como `cer:<stop_id>` |
| A6 | **`calendario_excepciones` puede quedarse vacía** | `03`, tabla + FK a `calendarios` | Cercanías **no publica `calendar_dates.txt`**: el importador no debe fallar. La tabla no tiene ninguna dependencia que obligue a tener filas |
| A7 | **Horas en `interval`, no `time`** | `03`, `horarios.llega/sale` y `viajes.salida/llegada` | GTFS publica `25:10` para trenes que pasan de medianoche; `time` no lo admite. Se guarda «tiempo desde el inicio del día de servicio» en hora de Madrid |
| A8 | **`viajes` sin `destino`** | `03`, no existe la columna | `trip_headsign` viene vacío en AV/LD/MD y con espacios en Cercanías. El destino real es `estaciones.nombre` de `destino_id` |

## 3. Decisiones de SQL que no están literalmente en el contrato

Estas son las que conviene mirar con lupa en la revisión: el contrato no las fija y las he decidido yo.

| # | Decisión | Dónde | Motivo |
|---|---|---|---|
| B1 | Extensiones en el esquema **`extensions`** y tipos **cualificados** (`extensions.vector(512)`, `extensions.gin_trgm_ops`) | `01`, `02`, `03` | Es donde Supabase las instala. Cualificar hace que el SQL no dependa del `search_path` del rol que lo ejecute |
| B2 | **Sin `pgcrypto`** y **sin `unaccent`** | `01` | `gen_random_uuid()` es nativo desde PG13. `unaccent` no está en el contrato y la API normaliza con `translate()` |
| B3 | **Estados como `text` + `CHECK`**, nunca `ENUM` | `02` (`rol`), `03` (`feed`, `tipo_servicio`, `tipo`, `sentido`) | Las migraciones de Supabase corren en una transacción y `ALTER TYPE ... ADD VALUE` no se puede usar ahí. Con `CHECK`, añadir un valor es un `ALTER TABLE` normal |
| B4 | **`lat`/`lon` acotados** (`-90..90`, `-180..180`) | `03`, `estaciones` | Es el único dato del catálogo que la UI pinta en un mapa: una coordenada absurda rompe el mapa entero. Riesgo: si Renfe publica una coordenada mala, **la importación falla** en vez de pintar mal (ver §6) |
| B5 | **Rangos validados**: `fin >= inicio` en `calendarios`, `fecha_fin >= fecha_inicio` en `viajes` | `03` | Un rango invertido hace que `SERVICIO_ACTIVO` (la consulta de la API) no devuelva nunca el viaje y el fallo sería invisible |
| B6 | **`llega is not null or sale is not null`** en `horarios` | `03` | Una parada sin ninguna hora es un error de parseo: es preferible que el `COPY` lo rechace |
| B7 | **Sin `CHECK` de `feed` en `horarios`** | `03` | La clave ajena a `viajes (feed, id)` ya lo garantiza y un `CHECK` por fila encarece el `COPY` de 2 M de filas |
| B8 | **Sin índice `(estacion_id)` en `estacion_feeds`** (el contrato lo pide) | `03`, comentario en la tabla | La PK `(estacion_id, feed)` ya empieza por esa columna: sería un índice duplicado. Se explica en el propio SQL |
| B9 | **`rutas.color` sin `CHECK`** de hexadecimal | `03`, comentario en la columna | Si Renfe publica un formato raro, no debe caerse la importación entera por un color. Se normaliza en el worker |
| B10 | **`on delete`**: `cascade` en `rutas`/`calendarios` → `viajes` → `horarios`; **`restrict`** en `viajes`/`horarios` → `estaciones` | `03` | Reemplazar un feed se lleva sus viajes y horarios, pero **nunca** una estación, que es compartida entre los dos feeds |
| B11 | **RLS: `revoke all` + `grant select`** en las 7 tablas | `03`, bloque final | Supabase concede `ALL` a `anon`/`authenticated` en las tablas nuevas de `public` (`auto_expose_new_tables`). Sin el `revoke`, la clave pública `anon` podría **escribir** el catálogo |
| B12 | **`perfiles`: `grant update (nombre)` por columna** | `02` | Es lo que impide que un usuario se haga `revisor`. La alternativa —comparar `rol` con su valor actual en el `with check`— obliga a leer `perfiles` desde una política de `perfiles` y Postgres lo rechaza por recursión |
| B13 | **Sin `force row level security`** | `02` y `03` | La API conecta con el rol `postgres` (`DATABASE_URL`), dueño de las tablas. Forzar RLS también para el dueño rompería la API y el worker. RLS protege el acceso directo con la clave `anon` |
| B14 | **`embeddings_faciales` sin ninguna política** | `02` | Ni `anon` ni `authenticated` leen el vector: solo `service_role` (API). La comparación nunca ocurre en el móvil |
| B15 | **`perfiles.nombre` entre 1 y 120 caracteres** | `02` | Evita perfiles con nombre vacío o de 10 000 caracteres. **El 120 es mío**: confirmadlo o lo cambio |
| B16 | **Un solo trigger `set_actualizado_en()`** con `set search_path = ''` | `01` | Una función para las cuatro tablas que llevan `actualizado_en`. El `search_path` vacío evita que alguien "secuestre" la función creando su propio `now()` |
| B17 | **Índices de FK explícitos** `(feed, ruta_id)` y `(feed, servicio_id)` | `03`, `viajes` | Postgres **no** crea índices para las claves ajenas, y los necesita el `on delete cascade` de la reimportación |
| B18 | **Índice `(fecha_fin)`** | `03`, `viajes` | Es la consulta de purga (`fecha_fin < hoy - 2`) que corre tras cada importación |
| B19 | **`num_paradas > 0`** y **`secuencia > 0`** | `03` | `stop_sequence` llega con ceros a la izquierda (`01`, `02`) y se castea a entero; una secuencia 0 o negativa indica parseo roto |

## 4. Lo que el SQL **no** hace

- **No crea** `posiciones_trenes` ni `incidencias`: son GTFS-RT y van en la segunda migración.
- **No crea** nada de reserva, pago, billete ni validación.
- **No añade** índice HNSW en `embeddings_faciales`: hoy la verificación es 1:1.
- **No instala** `unaccent`: el índice trigram de `estaciones.nombre` existe (§4.1 del contrato), pero
  **la API todavía no lo aprovecha** porque busca con `translate(lower(...)) like '%…%'`. Funcionará
  cuando la búsqueda use `unaccent` o se filtre por `%`. Con ~1 150 estaciones no hay problema de
  rendimiento hoy.
- **No crea** `seed.sql` con datos: el catálogo entra por la importación de [[plan-ingesta-gtfs]].
- **No se ha aplicado** en ningún entorno.

## 5. Cómo comprobarlo (en la VM)

```bash
pnpm db:start
pnpm db:reset          # aplica 01, 02, 03 en orden + seed.sql
pnpm db:status         # URLs y claves
```

Consultas de humo, sin datos:

```sql
-- las 9 tablas existen
select table_name from information_schema.tables
 where table_schema = 'public' order by 1;

-- RLS activo en las 9
select relname, relrowsecurity from pg_class
 where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1;

-- anon lee el catálogo pero no escribe
set role anon;
select count(*) from estaciones;                       -- 0, sin error
insert into estaciones (id, nombre, lat, lon) values ('x','X',0,0);  -- debe fallar
reset role;
```

## 6. Dudas para el revisor

1. **¿`horarios` y `viajes` legibles por `anon`?** El contrato (§7) dice lectura pública y así está.
   Pero son 2 M de filas paginables con la clave `anon` (límite `max_rows = 1000`). Si preferís que
   el catálogo grande solo salga por la API, se quita el `grant select` de esas dos tablas y no cambia
   nada para la app.
2. **`B4` (coordenadas) y `B5` (rangos) abortan la importación** si el feed trae un valor malo. Es
   deliberado: prefiero que falle la carga a pintar un tren en el sitio equivocado. Si os parece
   demasiado estricto para una demo, se relajan a `warning` en el importador.
3. **`B15` (nombre ≤ 120)** es un número que he puesto yo.
4. **`viajes.origen_id`/`destino_id` son `not null`.** Si un viaje del feed viniera sin ninguna parada
   con `recoge`, la importación falla. Comprobado: hoy no ocurre en ninguno de los dos feeds, pero el
   importador debe contarlo y reportarlo.
