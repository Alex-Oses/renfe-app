---
fecha: 2026-10-26
autor: Alex
area: devops
para: todos
rama: docs/docs-subida-github
pr: (ver PR de esta rama)
tags: [handoff, github]
---

# Handoff — Repo subido a GitHub

## Qué se hizo
- Generados los ficheros que faltaban: `.claude/commands/rama.md` y `pr.md` (copia de `.opencode/command/`), `.husky/pre-commit`, `commit-msg`, `pre-push`, `.github/workflows/pr.yml`, `labeler.yml`, `dependabot.yml`.
- Repo privado `Alex-Oses/renfe-app` creado; `main` y `develop` subidas (commit inicial `chore(infra): esqueleto inicial del monorepo`).
- `scripts/configurar-github.sh` ejecutado: `develop` por defecto, squash, protección de `main` y `develop`, labels y milestones Sprint 0-7.
- Invitados con permiso `push`: ruben-munoz-bl, maga369, keta372. **Tenéis que aceptar la invitación** (correo o https://github.com/Alex-Oses/renfe-app/invitations).
- Corregida `docs/git-github.md`: permiso `workflow` del token, `HUSKY=0` en el push inicial y rol de Kevin.

## Qué queda
- Todos: aceptar la invitación, `git clone`, `corepack enable`, `pnpm install`.
- Kevin: `ci.yml` no tiene job `ok`. La protección exige `CI / ok` y `PR / reglas`, así que ningún PR se podrá mergear hasta que exista ese check. Comprobad con el primer PR qué nombre de check ve GitHub.
- Alex: crear la app Expo en `frontend/mobile`.

## Bloqueos / preguntas para otros
- Kevin: en un repo de cuenta personal no existe el rol `maintain`. Si necesitas tocar la protección de ramas, Alex tiene que hacerlo o darte `admin`.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `.claude/commands/`, `.husky/`, `.github/`, `.gitattributes` (`*.bat` en CRLF), `docs/git-github.md`.
