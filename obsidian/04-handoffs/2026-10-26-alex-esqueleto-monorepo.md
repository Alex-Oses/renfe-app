---
fecha: 2026-10-26
autor: Alex
area: general
para: todos
tags: [handoff]
estado: cerrado
---

# Handoff — Esqueleto del monorepo

## Qué se hizo
- Creada la estructura `frontend/`, `backend/` (api, database, gtfs-worker, face-service) y `obsidian/`.
- `AGENTS.md`, `CLAUDE.md`, `opencode.json`, hook de Claude Code y comandos `/handoff` y `/estado`.
- Plantillas de GitHub, CI placeholder, Docker Compose placeholder, `.env.example`.
- Documentación en `docs/`.

## Qué queda
- Alex: subir a GitHub siguiendo `docs/git-github.md` y crear la app Expo.
- Rubén: `nest new` en `backend/api` y borrador de [[endpoints]].
- Marina: `supabase init` y borrador de [[modelo-datos]].
- Kevin: CI real, protección de ramas, rellenar `.github/CODEOWNERS` con los logins.

## Bloqueos
- Ninguno.

## Ficheros tocados
- Todo el repo (creación inicial).
