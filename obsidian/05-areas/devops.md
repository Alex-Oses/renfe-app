---
responsable: Kevin
tags: [area]
---

# 🐳 Área DevOps y despliegue

**Código:** `docker-compose.yml`, `.github/`, `render.yaml` · **Estado:** CI y Render en marcha; Docker pendiente

> **Cambio del 28/10:** el facial ya no es de esta área. [[ADR-007-reconocimiento-facial]] lo resuelve **sin servidor Python** (el vector lo calcula el dispositivo y decide Postgres), así que `backend/face-service` ha desaparecido. Mi lista queda: CI, despliegue (Render + Vercel) y **D10 (qué se dockeriza)**, que es lo único que me queda abierto además de las variables de Render.

## Hecho (sprint final, por Alex para descargar a Kevin)
- CI real: `.github/workflows/ci.yml` ejecuta `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm test:ramas`, los e2e de la API (`pnpm --filter @renfe/api test:e2e`) y `pnpm build` (job `ok`).
- `render.yaml`: blueprint de la API en Render (Node 22, `/health`, `API_PORT=10000`, CORS a Vercel).
- Protección de ramas `main` y `develop` (Alex, 26/10; revisada el 28/10): **3 aprobaciones = todo el equipo**, revisión de CODEOWNERS, aprobaciones descartadas al subir cambios, `require_last_push_approval`, admins incluidos y force push bloqueado. Ver [[ADR-008-revision-obligatoria-equipo]].

## Revisión del 28/10 (Kevin)
- **CI en verde de verdad**, no solo escrita: última ejecución sobre `develop` (`bd17135`) con todos los pasos en `success`. Y el 28/10, tras rebasar la rama sobre `develop` (`c99627d`, con el paquete `@renfe/shared` ya dentro), todo sigue en verde en local: lint, 53+16+49 tests, 4 e2e y build.
- **`PR / reglas` bloqueaba a Dependabot**: el patrón de `scripts/ramas.mjs` no admitía `dependabot/*` y las PRs #20-#24 se cerraron sin mergear. Arreglado en la rama `ci/infra-revision-ci-dependabot`, con pruebas nuevas (`pnpm test:ramas`, `scripts/ramas.test.mjs`).
- **Render está desplegado y vivo**: `GET https://renfe-api.onrender.com/health` → `200` con `"baseDatos":"no configurada"`. Lo único que falta son las variables de Supabase.
- **Ojo con el health check**: `/health` responde `200` aunque la base de datos falle, y `render.yaml` lo usa como `healthCheckPath`, así que Render puede dar por bueno un despliegue sin datos. Pendiente hablarlo con Rubén (`backend/api`).

## Revisión obligatoria del equipo (28/10)
- Cualquier PR a `develop` o `main` necesita **3 aprobaciones**: el autor no puede aprobar su propio PR, así que con 4 personas son los otros 3.
- Se aplica también a Alex como admin (`enforce_admins`), no hay bypass.
- Si se sube un commit nuevo, las aprobaciones anteriores se descartan y hay que volver a pedirlas.
- Config reproducible en `scripts/configurar-github.sh` (`proteger develop 3` y `proteger main 3`).
- Motivo y alternativas: [[ADR-008-revision-obligatoria-equipo]].

## Render (27/10)
- Servicio `renfe-api` creado por Alex con el blueprint: https://renfe-api.onrender.com (plan Free, Frankfurt, despliega desde `main`).
- Plan Free: se duerme tras 15 min sin uso y tarda ~30–50 s en despertar. Abrir `/health` antes de la demo.
- Faltan `DATABASE_URL` (Supabase en la nube, Marina) y `SUPABASE_JWT_SECRET` en Render → Environment.

### Lista de comprobación cuando llegue `DATABASE_URL`
1. Render → `renfe-api` → Environment: pegar la cadena del *pooler* de Supabase (no se escribe nunca en el repo) y el `SUPABASE_JWT_SECRET` del proyecto.
2. Comprobar que la cadena lleva `?sslmode=require`: `BdService` no configura SSL y Supabase en la nube lo exige (hipótesis a validar el día que haya base de datos).
3. Abrir `/health` y esperar `"baseDatos":"ok"` (hoy dice `"no configurada"`).
4. Probar `GET /estaciones?q=Madrid`: debe dejar de dar 503.
5. Avisar a Alex para que apunte `VITE_API_URL` a la API.

## Pendiente
- **Kevin:** la PR #75 ya está mergeada (excepción de ramas Dependabot + `pnpm test:ramas`); falta rellenar `DATABASE_URL` y `SUPABASE_JWT_SECRET` en Render (bloqueado por Supabase en la nube).
- **Kevin:** **D10 de [[ADR-005-app-movil-expo]]**: decidir qué se dockeriza y dejarlo funcionando con un comando. Los `Dockerfile` de `backend/api` y `backend/gtfs-worker` siguen siendo placeholders y **no** se pueden usar tal cual (asumen un proyecto autocontenido, sin monorepo pnpm).
- Fuera de la entrega: cuenta Stripe en modo test.
- El facial **no** es de esta área: [[ADR-007-reconocimiento-facial]] lo mete en la API (`backend/api/src/modules/auth/cara*`), sin `backend/face-service` ni PoC de InsightFace.

## Notas técnicas
