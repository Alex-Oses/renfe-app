# Levantar todo en local con Docker

Stack completo en un PC: Supabase (Postgres + Auth) con la CLI, la API en un contenedor y la web con Vite.
Probado el 29/10/2026 en Windows 11 con Docker Desktop 29.

## Requisitos

- Docker Desktop arrancado.
- Node 22 y `corepack enable` (los scripts del monorepo llaman a `pnpm` por su nombre).
- `pnpm install` en la raíz.

## Atajo con un solo comando

`pnpm entorno arrancar` levanta Supabase y la API en Docker y espera a que `/health` responda;
`pnpm entorno parar` los para (los datos de Supabase se conservan) y `pnpm entorno estado` enseña
qué está corriendo. Los pasos de abajo siguen valiendo si prefieres hacerlo a mano.

## Pasos

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

## Probar la app en el móvil

La app corre fuera de Docker (Expo Go), pero habla con la API del contenedor. En el móvil, `localhost`
es el propio móvil: hay que usar la IP de tu PC en la misma Wi-Fi.

1. `pnpm entorno arrancar` imprime la IP y las dos variables que necesitas.
2. Añádelas al `.env` de la raíz (o al de `frontend/mobile`):
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.XX:3000
   EXPO_PUBLIC_POSICIONES_URL=http://192.168.1.XX:3000
   ```
3. `pnpm dev:mobile` y escanea el QR con Expo Go. Si Expo ya estaba abierto, reinícialo para que
   vuelva a leer las variables (`EXPO_PUBLIC_*` se fijan al arrancar).
4. Si el móvil no conecta, permite el puerto 3000 en el firewall de Windows y comprueba que está en la
   misma red que el PC.

En emuladores no hace falta la IP: Android usa `http://10.0.2.2:3000` y el simulador de iOS acepta
`http://localhost:3000`.

## Vercel contra el entorno local

La web de Vercel se ejecuta en el navegador del visitante: **no puede llamar a `localhost`**. Para que
use la API de tu Docker hay que darle una URL pública.

1. Arranca el entorno (`pnpm entorno arrancar`).
2. Expón la API con un túnel: `cloudflared tunnel --url http://localhost:3000` (sin cuenta) o
   `ngrok http 3000`. Te da una URL `https://…`.
3. Añade el origen de la web al CORS del `.env` y reinicia la API:
   ```bash
   CORS_ORIGINS=http://localhost:5173,http://localhost:8081,https://tu-web.vercel.app
   docker compose up -d api
   ```
4. En Vercel → Settings → Environment Variables (Production): `VITE_API_URL=https://la-url-del-tunel`
   y redespliega (las `VITE_*` se fijan en el build). El mapa también usará la API, porque
   `BASE_POSICIONES` cae en `VITE_API_URL`.
5. La URL del túnel gratuito cambia cada vez: hay que actualizar la variable y redesplegar. Para una
   URL fija, un túnel con nombre de Cloudflare o desplegar `db` + `api` (PR #87).

Si no quieres túnel, la vía estable es la API de Render: `DATABASE_URL` (Supabase Cloud) en Render y
`VITE_API_URL=https://renfe-api.onrender.com` en Vercel.

Mientras el túnel esté abierto, cualquiera con la URL llega a tu API: es solo para pruebas.

## Notas

- Supabase local firma los tokens con **ES256**; la API los verifica con el JWKS de `SUPABASE_URL`
  (y los del login facial, con `SUPABASE_JWT_SECRET` en HS256).
- Para dar rol de revisor a un usuario de prueba, en la BD local:
  `update perfiles set rol='revisor' where id = '<uuid>'` y lo mismo en `auth.users.raw_app_meta_data`.
- `pnpm entorno parar` (o `pnpm db:stop`) para pararlo todo; los datos se conservan en el volumen de Docker.
