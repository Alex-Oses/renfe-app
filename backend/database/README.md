# database — Supabase

**Responsable:** Marina (Scrum Master + Base de datos) · IA: OpenCode

Proyecto de Supabase local ya inicializado (`supabase init`). La CLI viene como
devDependency del monorepo: `pnpm install` la deja disponible, no hace falta instalarla aparte.

## Estructura

```
backend/database/
├── README.md
└── supabase/              ← la carpeta que lee la CLI
    ├── config.toml        ← config local (project_id = "renfe-app")
    ├── migrations/        ← migraciones SQL (supabase migration new <nombre>)
    └── seed.sql           ← datos de prueba (se carga en cada db reset)
```

Los comandos se lanzan desde la raíz del repo con `--workdir backend/database` (ya incluido en los scripts).

## Uso diario

```bash
# Docker tiene que estar corriendo (ver «Sin Docker en el portátil» abajo)
pnpm db:start     # levanta Supabase local (Postgres 54322, API 54321, Studio 54323)
pnpm db:status    # muestra las URLs y las claves
pnpm db:stop      # para los contenedores
pnpm db:reset     # recrea la BD: aplica migraciones + seed.sql
```

Para una migración nueva:

```bash
pnpm exec supabase migration new crear_tabla_estaciones --workdir backend/database
# edita el .sql generado en supabase/migrations/ y luego:
pnpm db:reset
```

`pnpm db:start` imprime la `API URL`, la `anon key` y la `service_role key`:
cópialas a tu `.env` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
`DATABASE_URL` ya apunta a `localhost:54322` en `.env.example`.

## Sin Docker en el portátil

Sin Docker no hay Supabase local. Si tu portátil lo tiene bloqueado (caso de Marina, con el
equipo corporativo), la vía que funciona es una VM Linux: clonar el repo, `corepack enable`,
`pnpm install`, `cp .env.example .env` y los mismos `pnpm db:*`. Validado el 26/10 en una VM
Linux de Azure: `db:start`, Studio/API/PostgreSQL, `seed.sql` y `db:stop`.

## Reglas

- **El modelo de datos se diseña primero en** `obsidian/02-contratos-api/modelo-datos.md` y luego se migra. El contrato manda.
- Toda tabla con datos de usuario lleva RLS.
- Embeddings faciales en `vector(512)` con pgvector (`create extension vector`). Nunca fotos.
- Posiciones de trenes en una tabla con Realtime activado (la escribe gtfs-worker).
- Nunca edites una migración ya mergeada en `develop`: crea otra nueva.
- No commitees `.temp/` ni `.branches/` (los ignora `supabase/.gitignore`).

## Migraciones

Orden y contenido en [`supabase/migrations/README.md`](supabase/migrations/README.md).

Las **4 migraciones están escritas y mergeadas** (extensiones, identidad, catálogo GTFS y
reconocimiento facial). Marina las validó en su VM con el feed `avld` cargado; en Supabase local
se aplican con `db:reset` y en la nube están pendientes.

```bash
# En la VM Linux (Docker bloqueado en el portátil corporativo)
pnpm db:start      # o: supabase start --workdir backend/database
pnpm db:reset      # aplica las migraciones + seed.sql
pnpm gtfs:importar # carga el catálogo avld (~70 000 horarios)
```

Decisiones del SQL y qué mirar en la revisión:
`obsidian/05-areas/migracion-catalogo-gtfs.md`.

## Pendiente

- Proyecto de Supabase en la nube y `DATABASE_URL` en Render.
- Segunda migración: tiempo real (`posiciones_trenes`, `incidencias`) y reserva/pago/billete.
- Kevin: cerrar `modelo-datos` §10.2 (campos del webhook de Stripe) antes de implementar el pago. No bloquea nada de lo anterior.
