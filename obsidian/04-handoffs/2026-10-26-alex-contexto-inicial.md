---
fecha: 2026-10-26
autor: Alex (con Claude, desde claude.ai)
area: general
para: todos
rama: (sin repo todavía)
pr: —
tags: [handoff, contexto]
---

# Handoff — Contexto inicial del proyecto (léelo primero)

Resumen de todo lo decidido en la conversación de planificación en claude.ai, para que cualquier IA local continúe sin preguntar.

## Plan
- Plan completo: https://claude.ai/artifact/2w2FZuQJhMrEuGHxAWdKfw
- App tipo Renfe: búsqueda por fecha, reserva + pago (Stripe test), billetes QR firmados (Ed25519) validados contra BD, login facial, mapa en tiempo real, chatbot con Claude API.
- Renfe solo publica GTFS y GTFS-RT: precios, asientos, reservas y pagos son simulados.
- Stack (ver [[ADR-001-stack-tecnologico]]): Expo, NestJS, Supabase (pgvector, Realtime), worker GTFS en Node, face-service FastAPI + InsightFace, Docker Compose, monorepo pnpm.

## Equipo
| Persona | Rol | GitHub | IA |
|---|---|---|---|
| Alex | PO + Frontend | Alex-Oses | Claude Code |
| Rubén | Backend + chatbot | ruben-munoz-bl | OpenCode |
| Marina | Scrum Master + BD/GTFS | maga369 | OpenCode |
| Kevin | DevOps + Stripe + face | keta372 | OpenCode |

Sprints de 2 semanas: Sprint 0 del 26/10/2026 al 08/11; fin supuesto Sprint 7 el 07/03/2027 (por confirmar).

## Repo
- Tres zonas: `frontend/`, `backend/` (api, database, gtfs-worker, face-service), `obsidian/` (este vault).
- Protocolo del vault y reglas de Git en `AGENTS.md`. Comandos: `/rama`, `/pr`, `/handoff`, `/estado`.
- Flujo Git: `main` ← `develop` ← `<tipo>/<area>-<tema>`; squash a develop, merge commit a main. Detalle en `docs/flujo-trabajo.md`.
- Repo destino: `Alex-Oses/renfe-app` (aún no subido).

## Qué queda (Alex)
1. Copiar a mano los ficheros de `.claude/`, `.github/` y `.husky/` que Claude no pudo escribir (settings.json, commands/rama.md y pr.md; workflows ci.yml y pr.yml, labeler.yml, dependabot.yml, pull_request_template.md; hooks commit-msg, pre-commit, pre-push). Comprobar que existen antes de subir.
2. Subir a GitHub siguiendo `docs/git-github.md` y ejecutar `bash scripts/configurar-github.sh`.
3. Crear la app Expo en `frontend/mobile`.

## Bloqueos
- Ninguno.
