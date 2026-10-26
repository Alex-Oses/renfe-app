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
# Docker Desktop tiene que estar abierto
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

## Reglas

- **El modelo de datos se diseña primero en** `obsidian/02-contratos-api/modelo-datos.md` y luego se migra. El contrato manda.
- Toda tabla con datos de usuario lleva RLS.
- Embeddings faciales en `vector(512)` con pgvector (`create extension vector`). Nunca fotos.
- Posiciones de trenes en una tabla con Realtime activado (la escribe gtfs-worker).
- Nunca edites una migración ya mergeada en `develop`: crea otra nueva.
- No commitees `.temp/` ni `.branches/` (los ignora `supabase/.gitignore`).

## Pendiente (Sprint 0)

- Borrador completo de `../obsidian/02-contratos-api/modelo-datos.md`.
- Primera migración: extensión `vector` + tablas del contrato.
