---
fecha: 2026-10-29
autor: Alex
area: devops
para: Alex
rama: chore/infra-script-entorno
pr: 94
tags: [handoff, infra, docker, vercel, tunel, revision]
---

# Handoff — Entorno Docker, túnel y Vercel (para revisar)

> Nota de revisión: recoge lo que se hizo en la sesión del 29/10 con el entorno local, el túnel
> público y el despliegue temporal de Vercel. **No hay secretos, claves ni tokens en esta nota.**
> El `.env` de la máquina no se commitea. El handoff de la app Expo de la misma sesión está en el
> PR #95 (`2026-10-29-alex-app-expo-y-entorno`, todavía en su rama).

## Qué se hizo

- **`scripts/entorno-docker.mjs`** (PR #94): `pnpm entorno arrancar|parar|estado`.
  - Arranca Supabase local (CLI, contenedores Docker), construye y levanta la API en Compose y
    espera a `/health` con `baseDatos: ok`.
  - `parar` para API y Supabase y conserva el volumen; `estado` enseña compose, Supabase y la API.
  - Imprime la **IP de la LAN** para el móvil, saltando adaptadores virtuales (VirtualBox, WSL,
    Hyper-V, VPN) y prefiriendo la interfaz Wi-Fi.
  - Imprime un aviso de Vercel (túnel + `VITE_API_URL` + CORS).
  - Fallback a `corepack pnpm` cuando se lanza con `node` a pelo y `npm_execpath` no existe
    (necesario para el lanzador del escritorio).
- **`docs/levantar-en-local.md`**: secciones nuevas para probar la app en el móvil y para conectar
  Vercel con el entorno local (túnel, CORS, variables y redespliegue).
- **`.env` local** (no versionado): claves de Supabase local sacadas de `pnpm db:status -o env`,
  `JWT_SECRET` y `QR_SIGNING_SECRET` generados, `EXPO_PUBLIC_API_URL` con la IP de la LAN y
  `CORS_ORIGINS` con el origen del despliegue temporal.
- **Túnel público**: `cloudflared` (quick tunnel) contra `http://localhost:3000`. Verificado
  `/health` con `baseDatos: ok` y `/estaciones?q=atocha` con datos reales, y la cabecera
  `Access-Control-Allow-Origin` para el origen de la web desplegada.
- **Vercel**: sin cuenta/CLI autenticada, se hizo un despliegue **temporal prebuilt** (construido en
  local con `VITE_API_URL` apuntando al túnel y subido con `vercel deploy --prebuilt --temporary`).
  Servía la app y el bundle llevaba la URL del túnel. Caduca a la hora.
- **App móvil**: queda lista para Expo Go con `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_POSICIONES_URL`
  a la IP de la LAN. No se ha probado en un móvil ni emulador.

## Qué queda / qué revisar

- [ ] **Revisar el script** (#94): fallback de `corepack` en Windows (usa `cmd /d /s /c`), heurística
      de IP y mensajes. Comprobar en otro PC con Wi-Fi/Ethernet y con adaptadores virtuales.
- [ ] **Vercel real**: la CLI está deslogueada y el proyecto está protegido con SSO. Para conectar
      producción hace falta `npx vercel login`, poner `VITE_API_URL` (Production) y redesplegar.
      El proyecto despliega desde `main`, que va por detrás de `develop`.
- [ ] **Túnel estable**: el quick tunnel cambia de URL al reiniciar y el despliegue temporal caduca.
      Opciones: túnel con nombre de Cloudflare o API de Render con `DATABASE_URL` de Supabase Cloud.
- [ ] Decidir si conviene un `pnpm entorno tunel` (detectar `cloudflared`, arrancarlo y recordar CORS)
      o dejarlo documentado como está.
- [ ] El lanzador del escritorio usa la copia local del script mientras #94 no esté mergeado; cuando
      se mergee, usará `scripts/entorno-docker.mjs` del repo. Revisar que no queden dos versiones
      divergentes.
- [ ] Probar de verdad en el navegador y en Expo Go (aquí solo se verificó HTTP, bundle y CORS).

## Estado de los procesos

- `docker compose ps` → `api` arriba; Supabase local con `pnpm db:status`.
- Túnel: `cloudflared.exe` en segundo plano (su PID cambia). Pararlo con `taskkill /PID <pid> /F`.
- Parar el entorno: `pnpm entorno parar` o el lanzador `renfe-entorno.cmd parar`.
- **La API queda expuesta a internet mientras el túnel esté abierto.** No dejarlo encendido.

## Bloqueos / preguntas

- **Vercel**: sin login no se puede tocar el proyecto del equipo. El dominio del proyecto responde
  con redirección a SSO, así que para una demo pública hay que invitar al equipo o desactivar la
  protección de despliegues.
- **Seguridad**: cualquier persona con la URL del túnel llega a la API local. Es solo para pruebas.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `scripts/entorno-docker.mjs` (nuevo, 3 commits en el PR #94)
- `package.json` (`entorno`)
- `docs/levantar-en-local.md`
- `obsidian/04-handoffs/2026-10-29-alex-entorno-tunel-vercel.md` (este fichero)
- Fuera del repo: `.env` local (no versionado), `renfe-entorno.cmd` y `renfe-entorno.mjs` en el
  escritorio, y `cloudflared.exe` en `%LOCALAPPDATA%\renfe-tools`.

## Cómo reproducir (sin secretos)

```bash
# 1. Rellenar .env con las claves de `pnpm db:status -o env`
pnpm entorno arrancar
curl localhost:3000/health          # baseDatos: ok

# 2. Túnel público
cloudflared tunnel --url http://localhost:3000

# 3. CORS con el origen de la web y reiniciar la API
docker compose up -d api

# 4. Web: VITE_API_URL=<url-del-tunel> y redesplegar en Vercel
# 5. App: EXPO_PUBLIC_API_URL=http://<ip-lan>:3000 y pnpm dev:mobile
```
