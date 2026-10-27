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

## Pendiente
- **Kevin:** revisar `ci.yml` y `render.yaml`; crear el servicio en Render (New → Blueprint) y rellenar `DATABASE_URL` y `SUPABASE_JWT_SECRET`.
- Fuera de la entrega: build Docker
- PoC InsightFace
- Cuenta Stripe en modo test

## Notas técnicas
