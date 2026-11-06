---
actualizado: 2026-11-06
autor: Rubén (con OpenCode)
estado: actualizado
tags: [arquitectura, tecnico, docs]
---

# 🛠️ Cómo está montado

Documento técnico de **Andén 0**: piezas, datos, flujo de una petición y despliegue. Para la visión
conceptual (por qué se decidió cada cosa) está [`arquitectura.md`](arquitectura.md) y los ADR de
`obsidian/03-decisiones/`. Qué puede hacer el usuario: [`funcionalidades.md`](funcionalidades.md).

## 1. Stack

| Capa | Tecnología | Versión / paquete |
|---|---|---|
| Monorepo | pnpm workspaces · Node 22 · TypeScript estricto | `pnpm@9.12.0`, `engines.node >= 22` |
| Web | React + Vite + React Router | React 18.3, Vite 5.4, Router 6.28 (`@renfe/web`) |
| App | Expo + React Native + expo-router | Expo SDK 58, RN 0.88, React 19.3 (`@renfe/mobile`) |
| Lógica común | TS puro (cliente, tipos, simulados, contenido, tema) | `@renfe/shared` |
| API | NestJS + `pg` (SQL a mano, sin ORM) + `jose` + Swagger | `@renfe/api` |
| Datos Renfe | Node + `tsx` + `pg` | `@renfe/gtfs-worker` |
| Base de datos | Supabase Postgres + `pgvector` (migraciones SQL); el compose usa `pgvector/pgvector:pg17` | `backend/database/` |
| Mapa | Leaflet + react-leaflet sobre OpenStreetMap | `@renfe/web` |
| Facial | ONNX en el cliente: `@vladmandic/human` + `onnxruntime-web` (web), `onnxruntime-react-native` (app) | modelos SCRFD + ArcFace |
| Tests | Vitest (shared, web, API, worker) · `node:test` (app, scripts) | — |
| CI | GitHub Actions | `.github/workflows/ci.yml`, `pr.yml` |

## 2. Mapa del repositorio

```
renfe-app/
├── frontend/
│   ├── web/            # React + Vite. api/posiciones.ts = función serverless de Vercel
│   ├── mobile/         # Expo. src/app/ = rutas (expo-router)
│   └── shared/         # @renfe/shared: api/, billetes/, contenido/, tema/, formato/, estado/
├── backend/
│   ├── api/            # NestJS: src/modules/<dominio>/controller+service
│   ├── database/       # Supabase: supabase/migrations/*.sql
│   └── gtfs-worker/    # Importador GTFS (comandos importar / verificar / vias)
├── obsidian/           # Vault: contratos, ADR, handoffs (memoria del equipo)
├── docs/               # Guías humanas (esta carpeta)
├── deploy/             # Runbook del despliegue Docker + SQL de compatibilidad
├── scripts/            # ramas, sync, contexto de agentes, levantar en local
├── .github/            # CI, plantillas, CODEOWNERS
├── docker-compose.yml  # db + api (+ gtfs-worker como job)
└── render.yaml         # Blueprint de la API en Render
```

## 3. Arquitectura y responsabilidades

```
        Renfe · datos abiertos (CC BY 4.0)
        GTFS estático (zip)              GTFS-RT (JSON)
              │                                │ sondeo cada 30 s, caché en memoria
              ▼                                │
     gtfs-worker (import manual)               │
              │ COPY / upsert                  │
              ▼                                ▼
     ┌────────────────────────────────────────────────┐
     │ Supabase Postgres + pgvector                   │
     └───────────────────▲────────────────────────────┘
                         │ SQL y funciones SQL
     ┌───────────────────┴────────────────────────────┐
     │ API NestJS :3000 · Swagger /docs               │
     │ auth · estaciones · trenes · posiciones        │
     │ precios · reservas · billetes · abonos         │
     │ chatbot · health                               │
     └───────────────────▲────────────────────────────┘
                         │ HTTPS + Bearer JWT
          ┌──────────────┴──────────────┐
          │                             │
     Web (Vite)                    App Expo
     + @renfe/shared               + @renfe/shared
```

| Pieza | Hace | NO hace |
|---|---|---|
| `frontend/web` | Web de viajero, revisor y admin; mapa y contenido | No llama a Renfe ni a Postgres |
| `frontend/mobile` | App iOS/Android; facial nativo y notificaciones locales | No llama a Renfe ni a Postgres |
| `frontend/shared` | Cliente de la API, adaptadores, tipos, simulados, contenido y tokens de diseño | No tiene UI |
| `backend/api` | REST, auth, precios, reservas, QR, mapa cacheado y chatbot | No importa GTFS estático ni cobra |
| `backend/gtfs-worker` | Importa el catálogo y los horarios GTFS | No atiende usuarios ni toca negocio |
| Supabase | Datos, perfiles, embeddings y funciones faciales | No se expone directamente al cliente |
| Gemini | Chatbot con *tool use* de solo lectura | No tiene acceso a la BD |

**Regla de oro:** los clientes solo conocen la URL de la API. Nunca ven `DATABASE_URL`, la clave del
QR ni las credenciales de Renfe.

## 4. De dónde salen los datos

### 4.1 GTFS estático (catálogo, horarios y calendarios)

| Feed | URL | Uso |
|---|---|---|
| AVE / Larga y Media Distancia | `https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip` | **Cargado** en Supabase |
| Cercanías | `https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip` | Soportado por el worker; **no cargado** en la nube |

El worker (`pnpm gtfs:importar`) descarga, parsea y hace `COPY`/upsert en **30-60 s**:

- **Idempotente**: reimportar el mismo día no duplica nada (clave natural + `feed`).
- **Atómico**: tablas temporales e intercambio, para no servir horarios a medias.
- **Degradable**: si Renfe falla, se conserva la última importación válida.

Volumen cargado el 29/10 (lo que hay hoy en la nube): **1 035 estaciones · 668 rutas · 8 908 viajes ·
71 781 horarios**. `pnpm gtfs:verificar` comprueba coherencia después de importar y `pnpm gtfs:vias`
calcula los trazados de AVE/LD por las vías de OpenStreetMap (`tramos_via`), porque ese feed no trae
`shapes`.

Trampas de los datos que el código ya contempla:

- Horas GTFS que pasan de 24:00 → se guardan como **segundos enteros**, no `time`.
- El `trip_id` de AVE/LD lleva la fecha pegada (`0327212026-10-26`) y se conserva tal cual.
- Cercanías y AVE/LD son feeds separados: columna `feed` en todo y una estación física puede tener
  dos `stop_id` (`estacion_feeds`).

### 4.2 GTFS-RT (posiciones, retrasos y avisos)

| Dato | URL |
|---|---|
| Posiciones Cercanías | `https://gtfsrt.renfe.com/vehicle_positions.json` (~348 trenes) |
| Posiciones AVE/LD | `https://gtfsrt.renfe.com/vehicle_positions_LD.json` (~192 trenes) |
| Retrasos Cercanías | `https://gtfsrt.renfe.com/trip_updates.json` |
| Retrasos AVE/LD | `https://gtfsrt.renfe.com/trip_updates_LD.json` |
| Avisos | `https://gtfsrt.renfe.com/alerts.json` (en el contrato; aún sin endpoint) |

Cómo se consume:

- **La API sondea Renfe cada `GTFS_RT_POLL_SECONDS` (30 s) y cachea en memoria**, sin worker ni
  tabla. Cuatro descargas ≈ 440 KB por refresco, compartidas entre todas las peticiones.
- Si Renfe falla, se sigue sirviendo el último snapshot bueno y `actualizado` deja de avanzar. Solo
  hay `503` si nunca se pudo leer.
- Cada refresco se **enriquece con el catálogo**: nombre, línea, origen, destino, próxima parada y
  horas (`modules/posiciones/enriquecer.ts`, una consulta por feed).
- Renfe no manda CORS ni compresión: el navegador no puede leerlo directamente. Por eso, sin API
  desplegada, la web usa la **función serverless** `frontend/web/api/posiciones.ts` (misma lógica,
  mismo contrato).
- La web refresca el mapa cada **5 s**; la app, cada **7 s**. La caché de 30 s absorbe la diferencia.

### 4.3 Base de datos (negocio)

| Grupo | Tablas |
|---|---|
| Identidad | `perfiles`, `embeddings_faciales`, `config_cara` |
| Catálogo GTFS | `estaciones`, `estacion_feeds`, `rutas`, `viajes`, `horarios`, `calendarios`, `calendario_excepciones`, `formas`, `tramos_via` |
| Negocio | `reservas`, `asientos`, `billetes`, `abonos`, `validaciones` |
| Funciones | `registrar_cara()`, `verificar_cara()`, `resetear_cara()` |

- **Decisiones de negocio en SQL**: quién paga, qué asientos quedan libres (transacción con
  `for update skip locked`), qué es un transbordo y si una cara coincide. La API orquesta, no duplica
  reglas.
- **Facial**: el vector de 512 dimensiones se normaliza (L2 = 1) y se compara con `pgvector`; el
  umbral vive en `config_cara`. `embeddings_faciales` no tiene políticas RLS: ni `anon` ni
  `authenticated` pueden leerla.
- **`validaciones` es append-only**: guarda también los rechazos; `billetes.estado` es el estado
  actual.
- Migraciones en `backend/database/supabase/migrations/` (9 ficheros), aplicadas con `supabase db push`
  o `pnpm db:reset` en local.

### 4.4 Datos simulados (plan B del cliente)

`@renfe/shared` decide al arrancar: **`usaDatosSimulados = !VITE_API_URL`** (web) o
`!EXPO_PUBLIC_API_URL` (app). Sin API:

- Los módulos `simulado-*.ts` responden con las mismas formas que el contrato.
- Los precios y asientos son **deterministas**: la misma búsqueda da el mismo resultado.
- El QR se firma con HMAC en el navegador (detecta manipulaciones, no es seguridad real); con API se
  firma con Ed25519 en el servidor.
- `/admin/resumen` solo existe en modo simulado (la API aún no lo implementa).

Así la demo se puede enseñar aunque la API o la BD estén caídas, y es lo que usa el «plan B» del
despliegue.

## 5. Flujo de una petición

### 5.1 Buscar trenes

```
Web/app                         API NestJS                              Postgres
  │ GET /trenes?origen=60000&destino=71801&fecha=2026-11-05
  ├────────────────────────────▶│ 1. DTO: fecha válida, origen ≠ destino
  │                             │ 2. Amplía a las estaciones de la misma ciudad
  │                             │ 3. SQL: calendarios + excepciones
  │                             │    ⨝ viajes ⨝ horarios(origen) ⨝ horarios(destino)
  │                             │    WHERE seq_origen < seq_destino AND recoge/deja
  │                             ├──────────────────────────────────────▶│
  │                             │◀──────────────────────────────────────│  15-40 ms
  │                             │ 4. Deduplica entre feeds (gana avld)
  │◀────────────────────────────│ 5. { datos, total } con precio simulado
```

- Si hay resultados, se pintan; si no, el cliente pide `GET /trenes/transbordos` (un cambio de 15 min
  a 3 h, misma estación o otra de la misma ciudad).
- `/trenes` **no consulta GTFS-RT**: `retrasoSeg` llega siempre `null`. El retraso real está en
  `/posiciones` y `/trenes/:feed/:tripId/posicion`, y el cliente los cruza.

### 5.2 Comprar y emitir el QR

```
1  POST /precios/calcular   → importe exacto de la selección (mismo cálculo que la compra)
2  POST /auth/cara/verificar→ la huella se calcula en el dispositivo; Postgres decide
3  POST /reservas           → CaraRecienteGuard exige cara_en < 10 min
                             → una transacción: reserva + asientos + billetes + total
4  API firma un QR Ed25519 por pasajero (RNF1.<datos>.<firma>)
5  GET /billetes            → la web/app pinta los QR
6  POST /billetes/validar   → el revisor escanea; se verifica firma + estado + fechas
```

- `POST /reservas/transbordo` hace los dos tramos en **una sola transacción**.
- Cancelar (`POST /reservas/:localizador/cancelar`) libera butacas y anula billetes con penalización
  por clase.
- Los abonos usan el mismo esquema con prefijo `RNA1` y el revisor descuenta viaje en `bono-10`.

### 5.3 Mapa en directo

```
Web/app ──GET /posiciones──▶ API ──snapshot en memoria (30 s)──▶ GTFS-RT de Renfe
                                │
                                └─ enriquece con viajes/rutas/horarios/estaciones
```

- Si la API no está configurada, la web llama a `/api/posiciones` (Vercel) o pinta trenes simulados.
- Al abrir un tren, el cliente pide una vez su recorrido y sus paradas al GTFS estático.

### 5.4 Chatbot

```
POST /chatbot/mensaje | /chatbot/mensaje/flujo (SSE)
        ▼
   Gemini (function calling, gemini-3.5-flash-lite)
        ▼
   herramientas internas de solo lectura: buscar estaciones, buscar trenes,
   detalle de viaje y posiciones
        ▼
   respuesta + chatId + hasta 8 tarjetas de tren
```

- Memoria de conversación: los 4 últimos intercambios, 30 min, en el proceso (se pierde al
  reiniciar).
- El cliente no puede enviar SQL, URLs ni nombres de herramientas.
- Sin `GEMINI_API_KEY`, la API arranca igual y `/chatbot` responde `503`.

### 5.5 Login facial

```
Dispositivo: cámara → detector (SCRFD) → recorte → ArcFace 512 → vector L2 = 1
    │ POST /auth/cara/verificar { email, embedding }
    ▼
API → verificar_cara() en Postgres → similitud coseno ≥ umbral de config_cara
    ▼
JWT HS256 de la API (12 h)
```

La foto nunca sale del dispositivo y no se guarda. La tabla solo tiene el vector. Para registrar se
necesita token de contraseña; para resetear, un `admin`.

### 5.6 Respaldo de API y caducidad de sesión

- `configurarApi({ api, respaldo, posiciones, tiempoReal })` fija las URLs al arrancar.
- `vigilarApi()` comprueba cada 30 s la API principal (`/health` con `baseDatos: ok`); si cae, pasa a
  la de respaldo, avisa con un banner y cierra la sesión (los tokens no valen entre APIs). Vuelve sola
  cuando se recupera.
- Un `401` (salvo en el login) invalida la sesión y el cliente cierra sesión en vez de mostrar «token
  inválido».

## 6. La API

### 6.1 Módulos y rutas

| Módulo | Rutas |
|---|---|
| `estaciones` | `GET /estaciones?q=&feed=`, `GET /estaciones/:id` |
| `trenes` | `GET /trenes`, `GET /trenes/transbordos`, `GET /trenes/:feed/:tripId`, `.../asientos`, `.../posicion` |
| `posiciones` | `GET /posiciones?bbox=&feed=` |
| `precios` | `POST /precios/calcular` |
| `reservas` | `GET /reservas?localizador=`, `POST /reservas`, `POST /reservas/transbordo`, `POST /reservas/:localizador/cancelar` |
| `billetes` | `GET /billetes`, `GET /billetes/:id/qr`, `POST /billetes/validar` |
| `abonos` | `GET /abonos`, `POST /abonos`, `GET /abonos/:id` |
| `auth` | `POST /auth/registro`, `POST /auth/login` |
| `auth/cara` | `POST /auth/cara/registrar`, `/verificar`, `/reset` |
| `chatbot` | `POST /chatbot/mensaje`, `POST /chatbot/mensaje/flujo` |
| `health` | `GET /health` (`estado`, `baseDatos`, `version`, `uptimeSeg`, `fecha`) |

Contrato completo, con formas de request y response: `obsidian/02-contratos-api/endpoints.md`.
**El contrato manda**: se actualiza antes que el código.

### 6.2 Convenciones

- Colecciones `{ datos: [...], total: n }`; los detalles son objetos planos.
- Fechas ISO 8601 con offset de `Europe/Madrid`; `feed` explícito en viajes y posiciones.
- Errores con el formato de Nest: `{ statusCode, error, message }`.
- `ValidationPipe({ whitelist: true, transform: true })` global: lo que no está en el DTO se descarta.
- CORS cerrado a `CORS_ORIGINS`; Swagger en `/docs`.
- Sin ORM: SQL parametrizado con `pg`; consultas y transacciones en `common/gtfs/sql.ts` y los
  servicios.

### 6.3 Autenticación y roles

- Un **único** formato de token: HS256 firmado con `JWT_SECRET`, 12 h. Da igual si se entró con
  contraseña o con la cara.
- Claims: `sub`, `email`, `app_metadata.rol` (`viajero` | `revisor` | `admin`), `iat`, `exp`.
- Guards: `SupabaseJwtGuard` (firma y expiración), `RolesGuard` (roles) y `CaraRecienteGuard` (claim
  `cara_en` < 10 min para comprar).
- Supabase Auth valida las credenciales de contraseña, pero al cliente solo se le entrega el JWT de la
  API.
- Los endpoints de consulta (`/estaciones`, `/trenes*`, `/posiciones`) son públicos.

## 7. Frontend web

- Rutas en `src/main.tsx`: `/`, `/trenes`, `/reserva/:trenId`, `/transbordo`, `/billetes`,
  `/billetes/:id`, `/acceder`, `/cuenta`, `/registrar-cara`, `/abonos`, `/mapa`, `/app`, `/lineas`,
  `/revisor`, `/admin` y `*` (contenido/404).
- Carga diferida por ruta (`lazy`): mapa, cámara y QR solo se descargan al entrar.
- Contextos: `ProveedorSesion` (token y usuario) y `ProveedorAvisos` (favoritos y vigilante cada 20 s).
- Adaptadores (`shared/api/adaptador-*.ts`): traducen el contrato (`tipo` en mayúsculas, `numero`
  nullable…) a los tipos que pinta la UI.
- Contenido: `shared/contenido/*.ts` es una base tipada de fichas; `PaginaContenido` resuelve
  cualquier ruta y da 404 si no existe.

## 8. App móvil (Expo)

- `src/app/` con expo-router: pestañas **Comprar, En directo, Billetes, Líneas, Cuenta** y las
  pantallas `resultados`, `pasajero`, `transbordo`, `billete/[id]`, `abonos`, `comprar-abono`,
  `abono/[id]`, `revisor`, `cara`, `chatbot`, `informacion`, `contenido/[...ruta]` y `admin`.
- Misma lógica que la web desde `@renfe/shared`; solo cambia la capa visual.
- **Facial nativo** con `expo-camera` + `onnxruntime-react-native` y los modelos en `assets/modelos/`
  (`det-500m.onnx`, `arcface-w600k-mbf.onnx`). Requiere app compilada: no funciona en Expo Go.
- `src/polyfills.ts` da `localStorage` (expo-sqlite) y `crypto` (expo-crypto + @noble/hashes) para
  reutilizar el código de `shared`.
- Notificaciones **locales** (`expo-notifications`) cada 20 s con sesión; no hay push remoto.

## 9. Base de datos: reglas que importan

- Toda escritura de negocio pasa por **transacción**: no quedan reservas a medias.
- Las butacas se asignan con `for update skip locked`; `asientos` guarda la ocupación por viaje y
  fecha.
- El **QR** se firma con Ed25519 (`QR_SIGNING_PRIVATE_KEY`); la clave pública se deriva. Sin clave,
  emitir o validar devuelve `503`.
- Los estados del billete (`valido`, `usado`, `anulado`, `caducado`) y su orden de veredicto viven en
  el servidor.
- Comprobar si un viaje circula un día = `calendarios` + `calendario_excepciones`, nunca un `if` en
  el cliente.

## 10. Despliegue

| Destino | Qué se despliega | Notas |
|---|---|---|
| **Vercel** | `frontend/web` (producción: `main`) | `vercel.json` ignora ramas que no sean `main` y reescribe todo a `index.html` (SPA). `api/posiciones.ts` es la función serverless del mapa |
| **Render** | `backend/api` (`render.yaml`) | `renfe-api.onrender.com`, Frankfurt, `healthCheckPath: /health`, build con pnpm 9.12 |
| **Supabase Cloud** | Postgres + funciones | Proyecto `hqwwucagvlhnlqrspwvh` (eu-west-1), migraciones con `db push` |
| **Docker** | `db` + `api` (+ `gtfs-worker` como job) | `docker compose up -d --build db api`; la BD no se publica, la API escucha en `127.0.0.1:3010`. Runbook: `deploy/README.md` |

- El despliegue definitivo debe ser el **Docker del servidor** (ADR-009). Supabase Cloud y Render son
  transitorios hasta que se abran los puertos y se valide el servidor.
- `docker compose run --rm gtfs-worker` importa el catálogo dentro de la red de Docker.
- El worker y la API comparten las variables del `.env` raíz; ningún secreto se sube al repo.

## 11. Variables de entorno

Copia `.env.example` a `.env`. Nunca se sube. Las públicas llevan prefijo `VITE_` o `EXPO_PUBLIC_`.

| Grupo | Variables |
|---|---|
| Base de datos | `DATABASE_URL` (vacía = API sin BD, `/health` lo dice), `SUPABASE_*` |
| API | `API_PORT`, `CORS_ORIGINS` (obligatoria en producción), `JWT_SECRET` (32+ caracteres) |
| QR | `QR_SIGNING_PRIVATE_KEY` (Ed25519 PKCS8/DER base64 en una línea) |
| Chatbot y correo | `GEMINI_API_KEY`, `GEMINI_MODEL`, `RESEND_API_KEY`, `CORREO_REMITENTE`, `MAILPIT_URL` |
| GTFS-RT | `GTFS_RT_URL_*` (posiciones y retrasos de cada feed), `GTFS_RT_POLL_SECONDS` |
| GTFS worker | `GTFS_AVLD_URL`, `GTFS_CERCANIAS_URL`, `GTFS_ESTACIONES_URL` |
| Web | `VITE_API_URL` (vacía = simulados), `VITE_API_RESPALDO_URL`, `VITE_POSICIONES_URL`, `VITE_TIEMPO_REAL` |
| App | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_RESPALDO_URL`, `EXPO_PUBLIC_POSICIONES_URL` |
| Docker | `POSTGRES_PASSWORD`, `DATABASE_URL_DOCKER`, `API_PUBLICO` |

En el móvil `localhost` es el propio teléfono: hay que poner la IP del PC (`http://192.168.x.x:3000`)
o usar el túnel de Expo.

## 12. Calidad y flujo de trabajo

- `pnpm lint` = `tsc --noEmit` en web, app, shared y worker + `oxlint` en la API.
- `pnpm test` = Vitest en shared, web, API y worker; `node:test` en la app y en los scripts.
- `pnpm --filter @renfe/api test:e2e` cubre los endpoints contra la app Nest.
- `pnpm build` compila lo que tiene build (web, API y worker); `pnpm test:ramas` valida el nombre de la rama.
- CI: `lint → test → test:ramas → API e2e → build` (`CI / ok` y `PR / reglas` son los checks que
  exige el ruleset).
- Ramas `tipo/area-tema` desde `origin/develop`, Conventional Commits (commitlint + husky), PR a
  `develop` y release a `main`. Detalle en [`flujo-trabajo.md`](flujo-trabajo.md).
- El contrato de API y las decisiones se escriben **antes** del código, en el vault.

## 13. Enlaces

- Visión y decisiones: [`arquitectura.md`](arquitectura.md) · `obsidian/03-decisiones/`
- Contrato: `obsidian/02-contratos-api/endpoints.md` · `modelo-datos.md`
- Funciones de usuario: [`funcionalidades.md`](funcionalidades.md)
- Puesta en marcha local: [`primeros-pasos.md`](primeros-pasos.md) · [`levantar-en-local.md`](levantar-en-local.md)
- Despliegue Docker: `deploy/README.md`
- Áreas: `frontend/README.md`, `frontend/web/README.md`, `frontend/mobile/README.md`, `backend/README.md`
