---
fecha: 2026-10-29
autor: Rubén
area: general
para: todos
rama: docs/docs-estado-real-octubre + fix/infra-env-raiz-local
pr: pendiente
tags: [handoff, docs, vault, infra]
---

# Handoff — documentación al estado real y arranque en local

## Qué se hizo

**Documentación al día (esta rama).** La documentación describía un esqueleto de octubre que ya no
existe. Se ha reescrito contra el código real de `develop` (`82f7006`):

- `docs/arquitectura.md` reescrito: sin `backend/face-service`, sin Stripe, sin Supabase Realtime y
  sin tablas `gtfs_*` / `rt_*`. La API sondea los 4 JSON de GTFS-RT en memoria, el chatbot usa Gemini
  y el facial lo decide Postgres. Diagramas en mermaid para que no se vuelvan a desalinear.
- README raíz, `frontend/`, `backend/`, `backend/api/`, `frontend/shared/` y `backend/database/`
  (incluido `supabase/migrations/README.md`): estado real, 6 migraciones aplicadas en Cloud,
  `/pagos` marcado como inexistente, Kevin sin Stripe.
- **La app móvil existe**: 44 ficheros en la rama `feat/mobile-app-expo` (9 commits sobre `develop`,
  Expo SDK 58 + expo-router + EAS). Corregido en `frontend/mobile/README.md`, `frontend/README.md`,
  [[frontend]], [[sprint-actual]] y el bloque global de [[estado-equipo]]. Borrados los 5 READMEs de
  relleno de `frontend/mobile/src/**` que describían una estructura que no está en `develop`.
- Vault: [[backend]] (tabla de módulos real: 9 implementados, 3 propuestos), [[devops]] (Docker
  escrito y validado, sin construir; faltan `JWT_SECRET` y `QR_SIGNING_SECRET` en Render además de
  `DATABASE_URL`), [[base-datos]] (6 migraciones, no 4), [[eventos-realtime]] marcado `obsoleto`,
  [[modelo-datos]] sin «no hay migraciones todavía», nota de superado en [[ADR-001-stack-tecnologico]].
- `docs/levantar-en-local.md`: añadida la app y corregido el puerto real de Docker (`3010`).

**Arranque en local (rama `fix/infra-env-raiz-local`, independiente).** La API no arrancaba y la web
arrancaba en simulados sin avisar, por el mismo motivo: el `.env` de la raíz no se leía.

- `backend/api/src/app.module.ts`: `envFilePath: ['../../.env', '.env']`. `nest start` corre con cwd
  `backend/api/`, así que moría con «JWT_SECRET es obligatorio y debe tener al menos 32 caracteres».
- `frontend/web/vite.config.ts`: `envDir: "../../"`. Vite lee por defecto `frontend/web/.env`, que no
  existe, así que `VITE_API_URL` de la raíz se ignoraba.

Verificado en local: `/health` → `baseDatos: ok` (Supabase Cloud), `/estaciones?q=atocha` → 200,
`/posiciones` → 200 con trenes en vivo, web en 5173 recibiendo `VITE_API_URL`.

## Qué queda

- **Mergear `feat/mobile-app-expo`**: es el trabajo pendiente más grande para la entrega del 6/11.
  Ojo: los 5 READMEs borrados aquí no dan conflicto, pero `frontend/mobile/package.json` sí (allí es
  real, en `develop` es de relleno).
- Render: rellenar `DATABASE_URL`, `JWT_SECRET` y `QR_SIGNING_SECRET` para que `/estaciones` y
  `/trenes` dejen de dar 503.
- Facial 1024 (Human, web) vs 512 (ArcFace, contrato y BD).

## Bloqueos / preguntas para otros

- **Alex:** `frontend/web/api/posiciones.ts` (función de Vercel) duplica `GET /posiciones` de la API y
  devuelve menos campos (sin `retrasoSeg`, sin `nombre`/`origen`/`destino`). Propuesto borrarla y
  dejar `VITE_POSICIONES_URL` apuntando a la API; no se ha tocado por ser zona suya.
- **Alex:** `@renfe/shared/contenido` son 50 439 líneas de textos y `contenido/index.ts` las mete
  enteras en el bundle de la web. La app no lo sufre porque importa por subruta.
- **Kevin:** el push de este PC falló con la cuenta `TontonR` (sin permiso en el repo). Se ha dejado
  `remote.origin.pushurl` apuntando a `ruben-munoz-bl@github.com` solo en la config local.

## Cambios en contratos

Ninguno. No se ha tocado [[endpoints]], [[modelo-datos]] ni el código de la API salvo la carga del
`.env`.

## Ficheros tocados

- Docs: `README.md`, `docs/arquitectura.md`, `docs/levantar-en-local.md`, `docs/primeros-pasos.md`,
  `docs/README.md`, `frontend/README.md`, `frontend/mobile/README.md`, `frontend/shared/README.md`,
  `backend/README.md`, `backend/api/README.md`, `backend/database/README.md`,
  `backend/database/supabase/migrations/README.md`
- Vault: `00-inicio/inicio.md`, `00-inicio/contexto-gemini-dailys.md`, `01-estado/estado-equipo.md`,
  `01-estado/sprint-actual.md`, `02-contratos-api/eventos-realtime.md`,
  `02-contratos-api/modelo-datos.md`, `03-decisiones/ADR-001-stack-tecnologico.md`,
  `05-areas/backend.md`, `05-areas/base-datos.md`, `05-areas/devops.md`, `05-areas/frontend.md`,
  `05-areas/migracion-catalogo-gtfs.md`, este handoff
- Código (otra rama): `backend/api/src/app.module.ts`, `frontend/web/vite.config.ts`
