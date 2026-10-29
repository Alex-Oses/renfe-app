# Levantar todo en local con Docker

Stack completo en un PC: Supabase (Postgres + Auth) con la CLI, la API en un contenedor y la web con Vite.
Probado el 29/10/2026 en Windows 11 con Docker Desktop 29.

## Requisitos

- Docker Desktop arrancado.
- Node 22 y `corepack enable` (los scripts del monorepo llaman a `pnpm` por su nombre).
- `pnpm install` en la raíz.

## Pasos

1. **Base de datos** (aplica todas las migraciones de `backend/database/supabase/migrations`):
   ```bash
   pnpm db:start
   ```
2. **`.env` en la raíz** (no se sube): copia `.env.example` y rellena con lo que da `pnpm db:status`:
   - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`
   - `SUPABASE_URL=http://127.0.0.1:54321`
   - `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: los de `pnpm db:status`
   - `JWT_SECRET`: cualquier secreto aleatorio de al menos 32 caracteres; es el JWT propio de la API
   - `QR_SIGNING_SECRET`: cualquier cadena aleatoria larga si se prueban billetes o abonos
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

- Supabase Auth valida internamente las credenciales, pero la API devuelve un JWT propio firmado con
  `JWT_SECRET` (HS256, 12 horas) y solo acepta ese token en sus rutas protegidas.
- Para dar rol de revisor a un usuario de prueba, en la BD local:
  `update perfiles set rol='revisor' where id = '<uuid>'` y lo mismo en `auth.users.raw_app_meta_data`.
- `pnpm db:stop` para pararlo todo; los datos se conservan en el volumen de Docker.
