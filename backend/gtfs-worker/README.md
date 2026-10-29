# @renfe/gtfs-worker — Datos abiertos de Renfe

**Responsable:** Marina · IA: OpenCode

Importa el catálogo **GTFS estático de AVE / Larga Distancia / Media Distancia** de
Renfe en la base de datos de Supabase (la del contrato de
`obsidian/02-contratos-api/modelo-datos.md`).

> El **GTFS-RT** (posiciones en tiempo real) lo lee la API en memoria
> (`backend/api/src/common/gtfs`): este worker no lo toca.

## Qué hace

1. Descarga el zip del feed (`google_transit.zip`) y el CSV de estaciones.
2. Lo transforma al modelo del contrato: `estaciones`, `estacion_feeds`, `rutas`,
   `calendarios`, `calendario_excepciones`, `viajes`, `horarios`.
3. Lo carga en **una sola transacción**, en lotes de 1 000 filas.
4. Comprueba el resultado con `pnpm gtfs:verificar`.

No usa dependencias de ZIP ni de CSV: el lector de zip (`node:zlib`) y el parser
CSV están en `src/zip.ts` y `src/csv.ts`. La única dependencia de runtime es `pg`.

## Comandos

Desde la **raíz del repo**:

```bash
pnpm install                                   # una vez

# 1. Simulación: descarga y analiza, pero NO toca la base de datos
pnpm gtfs:importar --simular

# 2. Importación real (usa DATABASE_URL)
pnpm gtfs:importar

# 3. Recarga completa del feed (vacía `avld` antes de cargarlo)
pnpm gtfs:importar --reemplazar

# 4. Verificación posterior
pnpm gtfs:verificar
```

Opciones del importador:

| Opción | Para qué |
|---|---|
| `--simular` | Descarga y analiza, sin escribir en la BD |
| `--reemplazar` | Vacía el feed `avld` antes de cargarlo |
| `--zip <ruta>` | Usa un zip ya descargado (no descarga nada) |
| `--estaciones <ruta>` | Usa un `estaciones.csv` ya descargado |
| `--feed <nombre>` | Feed destino (hoy solo `avld`) |
| `--ayuda` | Ayuda |

Los ficheros descargados se guardan en `backend/gtfs-worker/data/` (ignorado por
Git), con la fecha en el nombre.

## Variables de entorno

Se leen del entorno o del `.env` de la raíz del repo (ver `.env.example`):

| Variable | Obligatoria | Valor |
|---|---|---|
| `DATABASE_URL` | Sí (salvo `--simular`) | Postgres de destino. En local: `postgresql://postgres:postgres@localhost:54322/postgres` (`pnpm db:status` lo confirma) |
| `GTFS_AVLD_URL` | No | `https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip` |
| `GTFS_ESTACIONES_URL` | No | `https://ssl.renfe.com/ftransit/Fichero_estaciones/estaciones.csv` |

Para apuntar a otro destino sin tocar el `.env`, pásala por delante:

```bash
DATABASE_URL=postgresql://… pnpm gtfs:importar
```

## Qué esperar (feed medido el 28/10/2026)

| Tabla | Filas |
|---|---|
| `estaciones` | 1 035 (todo el CSV, no solo las del feed) |
| `estacion_feeds` | 1 008 |
| `rutas` | 663 |
| `calendarios` | 8 729 |
| `calendario_excepciones` | 31 702 |
| `viajes` | 8 729 |
| `horarios` | 69 670 |

Renfe republica el feed a diario: `pnpm gtfs:verificar` avisa si algo se desvía
más de un 10 % de estos números, y falla si hay huérfanos, rutas en `otro` o
viajes con origen = destino.

## Reglas de transformación

- **`estaciones.csv` manda**: `estaciones.id` es el `CODIGO` del CSV. El
  `stop_id` del feed coincide con él en las 1 008 paradas; si alguna no
  apareciera, entra como `avld:<stop_id>` y el informe lo dice.
- **`rutas.nombre` nunca es `null`**: `route_long_name || route_short_name`. En
  este feed el nombre largo viene vacío, así que queda el producto (`AVE`,
  `ALVIA`, `MD`…), que es justo lo que la API espera.
- **`tipo_servicio`** se deduce del `route_short_name` **completo** (mapa en
  `src/gtfs/tipo-servicio.ts`): `MD` aparece dentro de `PROXIMDAD` y una búsqueda
  por subcadena lo clasificaría mal. Un producto nuevo cae en `otro` y el
  informe lo señala.
- **Horas como `interval`**: GTFS publica `8:30:00` y también `25:10:00`; se
  normalizan a `HH:MM:SS` y Postgres las guarda como intervalo.
- **`recoge` / `deja`**: `true` si `pickup_type` / `drop_off_type` faltan o valen
  `0` (Cercanías no publica esas columnas).
- **`viajes.salida` / `llegada`**: la hora del primer punto donde se puede subir
  y del último donde se puede bajar; si a un viaje le falta alguna, se descarta y
  se cuenta en el informe.

## Estructura

```
src/
  csv.ts               lector CSV RFC 4180 con recorte de espacios
  zip.ts               lector ZIP (deflate y sin comprimir) con node:zlib
  entorno.ts           lectura del .env sin dotenv
  sql.ts               sentencias de carga y orden de tablas
  bd.ts                pool de pg, transacción y carga por lotes
  importar.ts          CLI de importación
  verificar.ts         conteos, integridad y consulta de la API
  gtfs/
    avld.ts            lectura del feed y transformación al contrato
    estaciones.ts      estaciones.csv (latin-1, `;`)
    tiempo.ts          fechas, horas y booleanos de GTFS
    tipo-servicio.ts   route_short_name → rutas.tipo_servicio
  pruebas.test.ts      tests de todo lo anterior
```

## Pendiente

- **Cercanías**: queda fuera del sprint. El feed tiene 497 paradas cuyo
  `stop_id` no es un `CODIGO` del CSV; hay que decidir el mapeo (ver
  `obsidian/05-areas/plan-ingesta-gtfs.md`).
- **Programarlo a diario** (cron o Supabase Cron) cuando el feed esté estable en
  la nube.
