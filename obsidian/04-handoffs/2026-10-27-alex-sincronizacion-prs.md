---
fecha: 2026-10-27
autor: Alex
area: vault
para: todos
rama: feat/mobile-web-completa
pr: https://github.com/Alex-Oses/renfe-app/pull/17
tags: [handoff]
---

# Handoff — Sincronización de PRs y vault

## Qué se hizo
- Merge de `develop` (sin rebase) en las ramas con conflicto: #15 `chore/db-supabase-init`, #16 `docs/db-borrador-modelo-datos` y #17 `feat/mobile-web-completa`. `pnpm-lock.yaml` regenerado con `pnpm install`; `pnpm lint` y `pnpm test` en verde.
- [[estado-equipo]]: en cada conflicto se conservó la fila de su dueño (Marina de su rama, Rubén de `develop`).
- [[endpoints]]: gana el contrato de Rubén. Las rutas que proponía la web (`/trenes/:id`, `/tiempo-real/trenes`) se sustituyen por `/trenes/:feed/:tripId` y `/posiciones`.
- El ADR "web primero" de Alex (#13) pasa a **ADR-004**: ADR-002 es de Rubén (base API) y ADR-003 de Marina (Supabase local).

## Lo que trae cada uno (resumen para Alex)
- **Rubén:** API NestJS con `/health`, guards JWT/roles y `BdService` (mergeado). Contrato detallado de 6 rutas de datos. #25: respuestas al modelo de datos.
- **Marina:** Supabase local validado en VM Linux (ADR-003) y modelo de datos cerrado salvo la duda de Kevin sobre Stripe (#15, #16).
- **Kevin:** sin cambios todavía.

## Qué queda
- **Alex:** adaptar `frontend/web/src/api/tipos.ts` al contrato (`feed`+`tripId`, sobres `{datos,total}`).
- **Dependabot (#20–#24):** saltos de versión mayor (TypeScript 7, Vite 8, Vitest 5, React Router 7, React). No se tocan sin probar; propuesta: cerrarlos o agruparlos en una tarea de Kevin.
- Revisar y mergear: los agentes no aprueban PRs.

## Bloqueos / preguntas para otros
- Orden de merge recomendado: #13 → #15 → #16 → #25 → #17.

## Cambios en contratos
- [[endpoints]]: sección final sobre las formas que usa la web, alineada al contrato.

## Ficheros tocados
- `obsidian/01-estado/estado-equipo.md` (fila de Alex), `obsidian/02-contratos-api/endpoints.md`, este handoff.
