# migrations

Migraciones SQL generadas con `supabase migration new <nombre>`. Nunca edites una migración ya subida
a `develop`: crea otra nueva.

## Estado

**Aplicadas y validadas en la VM** (`genai-openllm-vm`) con el feed `avld` cargado. En Supabase
local se aplican con `pnpm db:reset`; en la nube, con `supabase db push` (pendiente).

## Orden

| # | Fichero | Qué crea |
|---|---|---|
| 01 | `20261028120000_extensiones_y_funciones.sql` | Esquema `extensions`; extensiones `vector` y `pg_trgm`; función `set_actualizado_en()` |
| 02 | `20261028120100_identidad.sql` | `perfiles` y `embeddings_faciales` + RLS |
| 03 | `20261028120200_catalogo_gtfs.sql` | `estaciones`, `estacion_feeds`, `rutas`, `calendarios`, `calendario_excepciones`, `viajes`, `horarios` + RLS |
| 04 | `20261028120300_reconocimiento_facial.sql` | `config_cara` y las funciones `registrar_cara` / `verificar_cara` / `resetear_cara` (ADR-007) |

El orden importa: 02 usa la función y el esquema que crea 01, 03 usa `pg_trgm` y la función, y 04
usa `perfiles` y `embeddings_faciales` de 02.

## Qué NO entra (segunda migración)

`posiciones_trenes`, `incidencias`, `reservas`, `asientos`, `pagos`, `billetes` y `validaciones`.
Son tiempo real (§6 del contrato) y reserva/pago/billete (§5); el sprint no los necesita todavía.

## Cómo aplicarlas

```bash
# En la VM Linux
pnpm db:start                       # levanta Supabase local
pnpm db:reset                       # aplica las migraciones en orden + seed.sql

# O contra un proyecto de Supabase en la nube
pnpm exec supabase db push --workdir backend/database
```

Si se aplican con `psql` puro (sin CLI de Supabase), 02 y 03 fallan: necesitan el esquema `auth` y
la función `auth.uid()` que crea Supabase. Están escritas para Supabase.

## Contrato y decisiones

- Esquema: `obsidian/02-contratos-api/modelo-datos.md` (§3 y §4). **El contrato manda**: si el SQL y
  la nota discrepan, se corrige el SQL.
- Por qué cada cosa está como está: `obsidian/05-areas/migracion-catalogo-gtfs.md`.
- Carga de datos: `obsidian/05-areas/plan-ingesta-gtfs.md`.
