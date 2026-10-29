# Levantar todo en local con Docker

Stack completo en un PC: Supabase (Postgres + Auth) con la CLI, la API en un contenedor y la web con Vite.
Probado el 29/10/2026 en Windows 11 con Docker Desktop 29.

## Requisitos

- Docker Desktop arrancado.
- Node 22 y `corepack enable` (los scripts del monorepo llaman a `pnpm` por su nombre).
- `pnpm install` en la raíz.

## Con un comando

```bash
pnpm local                 # Supabase + .env + catálogo AV/LD/MD y Cercanías + API en Docker
pnpm local --sin-cercanias # sin los ~2 M horarios de Cercanías
pnpm local --sin-importar  # si la BD ya tiene los horarios (arranques siguientes)
```

Al terminar imprime las URLs. Después, la web con `VITE_API_URL=http://localhost:3000 pnpm dev:web` y la app
con `EXPO_PUBLIC_API_URL=http://<IP-del-PC>:3000 pnpm dev:mobile` (en el móvil, `localhost` es el móvil).

## Pasos a mano (lo mismo que hace `pnpm local`)

1. **Base de datos** (aplica todas las migraciones de `backend/database/supabase/migrations`):
   ```bash
   pnpm db:start
   ```
2. **`.env` en la raíz** (no se sube): copia `.env.example` y rellena con lo que da `pnpm db:status`:
   - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`
   - `SUPABASE_URL=http://127.0.0.1:54321`
   - `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`: los de `pnpm db:status`
   - `QR_SIGNING_SECRET`: cualquier cadena aleatoria larga
3. **Catálogo real de Renfe** (AV/LD, ~1 min):
   ```bash
   pnpm gtfs:importar && pnpm gtfs:verificar
   ```
4. **API en Docker** (`docker-compose.yml` ya apunta la API al Supabase del host):
   ```bash
   docker compose up -d --build api
   curl localhost:3000/health   # "baseDatos":"ok"
   ```
5. **Web**:
   ```bash
   VITE_API_URL=http://localhost:3000 pnpm dev:web
   ```

## Notas

- Supabase local firma los tokens con **ES256**; la API los verifica con el JWKS de `SUPABASE_URL`
  (y los del login facial, con `SUPABASE_JWT_SECRET` en HS256).
- Para dar rol de revisor a un usuario de prueba, en la BD local:
  `update perfiles set rol='revisor' where id = '<uuid>'` y lo mismo en `auth.users.raw_app_meta_data`.
- `pnpm db:stop` para pararlo todo; los datos se conservan en el volumen de Docker.
