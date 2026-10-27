---
responsable: Kevin
tags: [area]
---

# 🐳 Área DevOps, Stripe y face service

**Código:** `docker-compose.yml`, `.github/`, `backend/face-service` · **Estado:** placeholders

## Hecho (sprint final, por Alex para descargar a Kevin)
- CI real: `.github/workflows/ci.yml` ejecuta `pnpm lint`, `pnpm test` y `pnpm build` (job `ok`).
- `render.yaml`: blueprint de la API en Render (Node 22, `/health`, `API_PORT=10000`, CORS a Vercel).
- Protección de ramas `main` y `develop` (Alex, 26/10).

## Render (27/10)
- Servicio `renfe-api` creado por Alex con el blueprint: https://renfe-api.onrender.com (plan Free, Frankfurt, despliega desde `main`).
- Plan Free: se duerme tras 15 min sin uso y tarda ~30–50 s en despertar. Abrir `/health` antes de la demo.
- Faltan `DATABASE_URL` (Supabase en la nube, Marina) y `SUPABASE_JWT_SECRET` en Render → Environment.

## Pendiente
- **Kevin:** revisar `ci.yml` y `render.yaml`; crear el servicio en Render (New → Blueprint) y rellenar `DATABASE_URL` y `SUPABASE_JWT_SECRET`.
- Fuera de la entrega: build Docker
- PoC InsightFace
- Cuenta Stripe en modo test

## Notas técnicas
