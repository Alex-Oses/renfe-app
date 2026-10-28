---
fecha: 2026-10-28
autor: Alex
area: devops
para: todos
rama: ci/infra-dependabot-y-titulos-pr
pr: 81
tags: [handoff]
---

# Handoff — Dependabot sin PRs y títulos de PR flexibles

## Qué se hizo

- **Dependabot:** `open-pull-requests-limit: 0` en los ecosistemas `npm` y `github-actions` de `.github/dependabot.yml`. Ya no abre PRs de actualización de dependencias. Las actualizaciones de seguridad ya estaban desactivadas en Settings, así que no abrirá ninguna PR.
- **Títulos de PR:** nuevo `commitlint.pr.config.mjs`, usado solo por `.github/workflows/pr.yml`. Acepta el tipo sin distinguir mayúsculas (`Feat(db): ...`), cualquier ámbito (o ninguno), títulos de hasta 120 caracteres y punto final. Los commits siguen con las reglas estrictas de `commitlint.config.mjs`.
- **Limpieza:** cerrados los PRs de Dependabot #76–#80.
- Actualizada la tabla de `docs/flujo-trabajo.md`.

## Qué queda

- Mergear el PR #81 (necesita 1 aprobación; los agentes no mergean).
- Si se quiere volver a tener PRs de dependencias, cambiar el límite a 5 en `dependabot.yml` o activar las actualizaciones de seguridad en Settings.

## Bloqueos / preguntas para otros

- **Kevin:** este cambio toca configuración de CI. Lo pidió Alex; revísalo cuando puedas. No cambia ramas ni protección de `main`/`develop`.
- El check `PR / reglas` de este PR usa la versión nueva del workflow (misma rama), así que valida el título flexible desde el primer momento.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `.github/dependabot.yml`
- `.github/workflows/pr.yml`
- `commitlint.pr.config.mjs` (nuevo)
- `docs/flujo-trabajo.md`
- `obsidian/01-estado/estado-equipo.md` (fila de Alex)
- `obsidian/04-handoffs/2026-10-28-alex-dependabot-y-titulos-pr.md` (este fichero)
