---
responsable: Kevin
tags: [area]
---

# 🐳 Área DevOps y Stripe

**Código:** `docker-compose.yml`, `.github/` · **Estado:** placeholders

## Hecho (sprint final, por Alex para descargar a Kevin)
- CI real: `.github/workflows/ci.yml` ejecuta `pnpm install`, `pnpm lint`, `pnpm test`, `pnpm test:ramas`, los e2e de la API (`pnpm --filter @renfe/api test:e2e`) y `pnpm build` (job `ok`).
- `render.yaml`: blueprint de la API en Render (Node 22, `/health`, `API_PORT=10000`, CORS a Vercel).
- Protección de ramas `main` y `develop`: GitHub las marca como protegidas (comprobado el 28/10).

## Revisión del 28/10 (Kevin)
- **CI en verde de verdad**, no solo escrita: última ejecución sobre `develop` (`bd17135`) con todos los pasos en `success`.
- **`PR / reglas` bloqueaba a Dependabot**: el patrón de `scripts/ramas.mjs` no admitía `dependabot/*` y las PRs #20-#24 se cerraron sin mergear. Arreglado en la rama `ci/infra-revision-ci-dependabot`, con pruebas nuevas (`pnpm test:ramas`, `scripts/ramas.test.mjs`).
- **Render está desplegado y vivo**: `GET https://renfe-api.onrender.com/health` → `200` con `"baseDatos":"no configurada"`. Lo único que falta son las variables de Supabase.
- **Ojo con el health check**: `/health` responde `200` aunque la base de datos falle, y `render.yaml` lo usa como `healthCheckPath`, así que Render puede dar por bueno un despliegue sin datos. Pendiente hablarlo con Rubén (`backend/api`).

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
- **Kevin:** mergear la PR de `ci/infra-revision-ci-dependabot` y rellenar `DATABASE_URL` y `SUPABASE_JWT_SECRET` en Render (bloqueado por Supabase en la nube).
- Fuera de la entrega: build Docker
- PoC InsightFace
- Cuenta Stripe en modo test

## Notas técnicas
