---
fecha: 2026-10-29
autor: Alex
area: frontend
para: todos
rama: feat/mobile-app-expo
pr: 95
tags: [handoff, movil, expo, infra, docker]
---

# Handoff — App Expo terminada y entorno Docker de un solo comando

## Qué se hizo

- **App Expo en `frontend/mobile`** (SDK 58 + expo-router + TypeScript estricto), la pieza principal
  del sprint ([[ADR-005-app-movil-expo]]):
  - Pestañas **Comprar**, **En directo**, **Billetes**, **Líneas** y **Cuenta**, más `resultados`,
    `pasajero` y `billete/[id]`.
  - La lógica viene de `@renfe/shared`: cliente de la API, tipos, simulados, QR firmado, contenido y
    tokens de diseño. `src/polyfills.ts` cubre `localStorage` (expo-sqlite) y `crypto` (expo-crypto +
    @noble/hashes).
  - **Portada con scroll fijo** como el tramo sticky de la web: el tren sale hacia la izquierda, el
    buscador entra desde la derecha y una pastilla invita a deslizar. Con movimiento reducido no hay
    animación ni portada fija.
  - **Mapa en directo**: trenes de `/posiciones`, recorrido (`ruta`) y paradas reales del GTFS
    estático, retraso y próxima parada. El panel arranca plegado para que se vea el mapa.
  - Compra completa: asientos, viajeros, pago simulado y billete con QR. Abonos y datos de cuenta.
- **Merge de `develop`** (82 commits) en la rama: el cliente compartido cambió (`obtenerAsientos`
  recibe el tren y `crearReserva` firma tren + reserva) y `pasajero.tsx` se adaptó. El `pnpm-lock.yaml`
  se regeneró con `pnpm install --lockfile-only`.
- **Rutas reales en el mapa** comprobadas: la web ya las pinta con `/trenes/:feed/:tripId` (#86) y la
  app usa `ruta`/`paradas` de la API. `pnpm --filter @renfe/web test` en verde (32 tests).
- **Script de Docker** `scripts/entorno-docker.mjs` + `pnpm entorno arrancar|parar|estado`: arranca
  Supabase local, construye y levanta la API en Compose, espera a `/health` con `baseDatos: ok` y lo
  para conservando los datos. PR #94.
- **Probado de punta a punta** en Windows 11: `pnpm entorno arrancar` → imagen construida, `/health`
  ok y `/estaciones?q=atocha` con datos reales; `pnpm entorno parar` → Supabase parado y volumen
  conservado. La app: `tsc --noEmit` y `expo export --platform web` en verde.

## Qué queda

- **PR #95 (app)** y **PR #94 (script Docker)**: necesitan las 3 aprobaciones del equipo. Los agentes
  no mergean.
- **Probar en Expo Go** (`pnpm dev:mobile`) con el entorno local: no se ha arrancado en emulador ni en
  un móvil en esta sesión, solo tipos y bundle web.
- **APK de Android** con `eas build --profile preview --platform android`. iOS solo con Expo Go:
  TestFlight necesita cuenta de Apple Developer (pendiente de decidir).
- **Facial en la app**: no está. Cuando el modelo ArcFace 512 esté elegido, la app puede calcular el
  vector en el dispositivo y llamar a `/auth/cara/*` ([[ADR-007-reconocimiento-facial]]).
- El buscador de la app aún usa las estaciones simuladas; con la API real conviene pasar a
  `GET /estaciones` como en la web.

## Bloqueos / preguntas para otros

- **Kevin:** revisa el script de entorno (área infra). Si prefieres otro nombre o moverlo a `db:*`,
  se cambia. El `.env` de la raíz sigue haciendo falta; el script avisa y arranca Supabase antes de
  pedirlo para que se puedan sacar las claves con `pnpm db:status`.
- **Rubén:** para el facial en la app, el contrato de `/auth/cara/*` ya vale; falta el modelo 512.
- **Marina:** nada; el importador y Supabase Cloud funcionan contra el entorno local.

## Cambios en contratos

Ninguno: la app y la web se adaptan a [[endpoints]] y [[modelo-datos]].

## Ficheros tocados

- `frontend/mobile/**` (app completa: rutas, componentes, tema, polyfills, `app.json`, `eas.json`).
- `frontend/mobile/src/app/pasajero.tsx` (adaptación al cliente nuevo tras el merge).
- `scripts/entorno-docker.mjs` (nuevo), `package.json` (`entorno`), `docs/levantar-en-local.md`.
- `pnpm-lock.yaml` (regenerado tras el merge).
- `obsidian/01-estado/estado-equipo.md`, `obsidian/05-areas/frontend.md`, este handoff.
