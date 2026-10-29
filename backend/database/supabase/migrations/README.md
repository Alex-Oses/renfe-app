# migrations

Migraciones SQL generadas con `supabase migration new <nombre>`. Nunca edites una migración ya subida
a `develop`: crea otra nueva.

## Estado

**Escritas y sin aplicar.** No se han ejecutado ni en Supabase local ni en la nube, y no se ha
importado ningún dato. Se aplican en la **VM Linux de Azure `genai-openllm-vm`** (Docker Desktop está
bloqueado en el portátil corporativo).

La 04 sí se ha probado en local con **PGlite** (Postgres 17 en WASM) sobre un preludio que imita
`auth` (`auth.users`, `auth.uid()`) y las tablas de 01–03: crea sin errores, y se han comprobado los
`CHECK`, el `UNIQUE (asiento_id)`, el trigger de `actualizado_en` y las políticas RLS (cada viajero ve
lo suyo y `authenticated` no puede escribir). Eso **no sustituye** a aplicarla en Supabase: faltan
`pgvector`, `pg_trgm` y los roles reales de Supabase.

## Orden

| # | Fichero | Qué crea |
|---|---|---|
| 01 | `20261028120000_extensiones_y_funciones.sql` | Esquema `extensions`; extensiones `vector` y `pg_trgm`; función `set_actualizado_en()` |
| 02 | `20261028120100_identidad.sql` | `perfiles` y `embeddings_faciales` + RLS |
| 03 | `20261028120200_catalogo_gtfs.sql` | `estaciones`, `estacion_feeds`, `rutas`, `calendarios`, `calendario_excepciones`, `viajes`, `horarios` + RLS |
| 04 | `20261029120000_billetes_y_abonos.sql` | `reservas`, `asientos`, `abonos`, `billetes`, `validaciones` + RLS |
| 05 | `20261028120300_reconocimiento_facial.sql` | `config_cara` (umbral, modelo) y el rol `admin` |
| 06 | `20261029130000_modelo_cara_w600k_mbf.sql` | Modelo de cara `w600k_mbf` en `config_cara` |

Las seis están **aplicadas en Supabase Cloud** (`hqwwucagvlhnlqrspwvh`, eu-west-1) el 29/10.

El orden importa: 02 usa la función y el esquema que crea 01, 03 usa `pg_trgm` y la función, y 04
apunta a `perfiles` (02), `viajes` y `estaciones` (03). 05 va después de 02 y 06 después de 05.

## Qué NO entra

`posiciones_trenes` e `incidencias` (§6 del contrato, GTFS-RT) y `pagos`: **no se van a crear**. El
GTFS-RT vive en memoria de la API y no hay Stripe ni pasarela de pago.

## Cómo aplicarlas

```bash
# En la VM Linux o en local
pnpm db:start                       # levanta Supabase local
pnpm db:reset                       # aplica las migraciones en orden + seed.sql

# O contra un proyecto de Supabase en la nube (así se hizo el 29/10)
pnpm exec supabase db push --workdir backend/database
```

Si se aplican con `psql` puro (sin CLI de Supabase), 02, 03 y 04 fallan: necesitan el esquema `auth`,
la función `auth.uid()` y los roles `anon`/`authenticated` que crea Supabase. Están escritas para
Supabase.

## Contrato y decisiones

- Esquema: `obsidian/02-contratos-api/modelo-datos.md` (§3, §4, §5 y §7). **El contrato manda**: si el
  SQL y la nota discrepan, se corrige el SQL.
- Por qué cada cosa está como está: `obsidian/05-areas/migracion-catalogo-gtfs.md`.
- Carga de datos: `obsidian/05-areas/plan-ingesta-gtfs.md`.
