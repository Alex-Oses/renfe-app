---
fecha: 2026-10-28
autor: Kevin
area: devops
para: Alex, Rubén, Marina
rama: ci/infra-revision-ci-dependabot
pr: (pendiente de abrir; ver "Qué queda")
tags: [handoff, ci, render, dependabot]
---

# Handoff — Revisión de la CI, excepción de Dependabot y estado real de Render

## Qué se hizo

Revisión completa (solo lectura) de la infraestructura y tres cambios pequeños:

- **`scripts/ramas.mjs`:** las ramas `dependabot/*` se aceptan en la validación. Antes no encajaban en el patrón `<tipo>/<area>-<tema>` y por eso **ninguna PR de Dependabot podía pasar el check `PR / reglas`** (las #20-#24 se cerraron por eso). Ahora sí pueden pasar; el resto del patrón sigue igual de estricto.
- **`scripts/ramas.test.mjs` + `pnpm test:ramas`:** 4 pruebas de las reglas de ramas (acepta las del equipo, las de Dependabot y `release/sprint-N`; rechaza nombres mal formados). Se añade a la CI, así que un cambio en el patrón ya no puede romper el flujo sin que se vea en rojo.
- **`docs/flujo-trabajo.md`:** corregida la tabla de automatizaciones. Decía que la CI hacía "lint/test/build **solo de las áreas que cambian**" y en realidad ejecuta todo el monorepo en cada push y PR (que es lo correcto para este tamaño).

Verificado en local, sobre `develop` al día (`bd17135`): `pnpm lint` ✅, `pnpm test` ✅ (43 web + 49 api), `pnpm --filter @renfe/api test:e2e` ✅ (4), `pnpm build` ✅, `pnpm test:ramas` ✅ (4).

**Estado comprobado de la CI y de Render** (no es una suposición, lo he consultado):

- `CI` en GitHub: última ejecución sobre `develop`, **success**, con los pasos `install`, `lint`, `test`, `test:e2e` y `build` en verde.
- `GET https://renfe-api.onrender.com/health` → **200** con `"baseDatos":"no configurada"`. La API está desplegada y viva; lo que falta es conectar Supabase.
- `main` y `develop` aparecen como **protegidas** en GitHub.

## Qué queda

- **Kevin (yo), ahora:** abrir la PR de esta rama contra `develop` (necesita aprobación de otra persona: `/.github/` es mío en CODEOWNERS y nadie aprueba su propia PR) y mergearla.
- **Kevin, bloqueado por Marina:** rellenar `DATABASE_URL` y `SUPABASE_JWT_SECRET` en Render → Environment. Comprobación de éxito: `/health` debe pasar de `"no configurada"` a `"ok"`.
- **Kevin, 5/11:** abrir `/health` un minuto antes del ensayo (el plan Free de Render se duerme a los 15 min y tarda 30-50 s en despertar).
- **Kevin, opcional y fuera de la entrega:** Docker Compose real, Stripe test, limpiar `backend/face-service` (ADR-004 dice que se elimina: el facial va en el navegador).

## Bloqueos / preguntas para otros

- **Marina:** sigo sin `DATABASE_URL` porque las migraciones `gtfs_*` no están en el repo (`backend/database/supabase/migrations/` solo tiene un README). Cuando tengas Supabase en la nube, pásame la cadena del *pooler*.
- **Para Marina/Kevin (duda técnica, no verificada):** `backend/api/src/common/bd/bd.service.ts` crea el pool de `pg` sin opción `ssl`. Supabase en la nube suele exigir TLS. **Hipótesis:** funcionará si la cadena incluye `?sslmode=require`. Hay que probarlo el día que exista la base de datos; si falla, el arreglo es de la API (Rubén).
- **Rubén:** `GET /health` devuelve **200 aunque la base de datos esté caída** (`baseDatos: "error"`), y `render.yaml` usa `/health` como health check. Efecto: Render puede dar el despliegue por bueno sin datos. Sugerencia: devolver 503 cuando `baseDatos === 'error'` (no lo he tocado: es `backend/api`).
- **Alex:** `render.yaml` fija `CORS_ORIGINS=https://renfe-app-beta.vercel.app` y **no cubre las previews por PR** de Vercel, aunque ADR-004 dice que deben funcionar. No lo cambio porque necesito saber qué dominio final usa la web. Además, ADR-004 sigue con `estado: propuesto` aunque su PR #13 ya se mergeó.
- **Alex:** los PRs de Dependabot podrán pasar `PR / reglas`, pero el CI ahora sí prueba de verdad un salto de versión mayor. Decided vosotros si queréis reactivarlos.

## Cambios en contratos

Ninguno. No he tocado `backend/api`, `backend/database` ni `obsidian/02-contratos-api/`.

## Ficheros tocados

- `scripts/ramas.mjs`, `scripts/ramas.test.mjs`, `package.json` (`test:ramas`), `.github/workflows/ci.yml` (un paso nuevo)
- `docs/flujo-trabajo.md`
- `obsidian/01-estado/estado-equipo.md` (mi fila), `obsidian/05-areas/devops.md`, este handoff
