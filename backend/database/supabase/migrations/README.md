# migrations

Migraciones SQL generadas con `supabase migration new <nombre>`. Nunca edites una migración ya subida
a `develop`: crea otra nueva.

## Estado

**Las 4 primeras están aplicadas en Supabase Cloud** (`hqwwucagvlhnlqrspwvh`, 29/10) y validadas en la
VM (`genai-openllm-vm`) con el feed `avld` cargado. La 05 está escrita y probada en local con
**PGlite** (Postgres 17 en WASM) sobre un preludio que imita `auth` y las tablas de 01–04: crea sin
errores, y se han comprobado los `CHECK`, el `UNIQUE (asiento_id)`, el trigger de `actualizado_en` y
las políticas RLS (cada viajero ve lo suyo y `authenticated` no puede escribir). Eso **no sustituye** a
aplicarla en Supabase: faltan `pgvector`, `pg_trgm` y los roles reales.

## Orden

| # | Fichero | Qué crea |
|---|---|---|
| 01 | `20261028120000_extensiones_y_funciones.sql` | Esquema `extensions`; extensiones `vector` y `pg_trgm`; función `set_actualizado_en()` |
| 02 | `20261028120100_identidad.sql` | `perfiles` y `embeddings_faciales` + RLS |
| 03 | `20261028120200_catalogo_gtfs.sql` | `estaciones`, `estacion_feeds`, `rutas`, `calendarios`, `calendario_excepciones`, `viajes`, `horarios` + RLS |
| 04 | `20261028120300_reconocimiento_facial.sql` | `config_cara` y las funciones `registrar_cara` / `verificar_cara` / `resetear_cara` (ADR-007) |
| 05 | `20261029120000_billetes_y_abonos.sql` | `reservas`, `asientos`, `abonos`, `billetes`, `validaciones` + RLS |

El orden importa: 02 usa la función y el esquema que crea 01, 03 usa `pg_trgm` y la función, 04 usa
`perfiles` y `embeddings_faciales` de 02, y 05 apunta a `perfiles` (02) y a `viajes` y `estaciones`
(03), y cuenta con el rol `admin` que añade 04.

## Qué NO entra todavía

`posiciones_trenes` e `incidencias` (§6 del contrato, GTFS-RT) y `pagos` (§5.3: Stripe en modo test,
va con el webhook). El sprint no los necesita.

## Cómo aplicarlas

```bash
# En la VM Linux
pnpm db:start                       # levanta Supabase local
pnpm db:reset                       # aplica las migraciones en orden + seed.sql

# O contra un proyecto de Supabase en la nube
pnpm exec supabase db push --workdir backend/database
```

Si se aplican con `psql` puro (sin CLI de Supabase), 02–05 fallan: necesitan el esquema `auth`, la
función `auth.uid()` y los roles `anon`/`authenticated` que crea Supabase. Para un Postgres pelado,
`deploy/postgres/00-compat-supabase.sql` crea ese mínimo antes (ver [`deploy/README.md`](../../../deploy/README.md)).

## Contrato y decisiones

- Esquema: `obsidian/02-contratos-api/modelo-datos.md` (§3, §4, §5 y §7). **El contrato manda**: si el
  SQL y la nota discrepan, se corrige el SQL.
- Por qué cada cosa está como está: `obsidian/05-areas/migracion-catalogo-gtfs.md`.
- Carga de datos: `obsidian/05-areas/plan-ingesta-gtfs.md`.
