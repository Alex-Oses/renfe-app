---
fecha: 2026-10-28
autor: Alex
area: devops
para: todos
rama: ci/infra-dependabot-y-titulos-pr
pr: 81
tags: [handoff]
---

# Handoff — Dependabot, títulos de PR y revisión obligatoria del equipo

## Qué se hizo

- **Dependabot:** `open-pull-requests-limit: 0` en los ecosistemas `npm` y `github-actions` de `.github/dependabot.yml`. Ya no abre PRs de actualización de dependencias. Las actualizaciones de seguridad ya estaban desactivadas en Settings, así que no abrirá ninguna PR.
- **Títulos de PR:** nuevo `commitlint.pr.config.mjs`, usado solo por `.github/workflows/pr.yml`. Acepta el tipo sin distinguir mayúsculas (`Feat(db): ...`), cualquier ámbito (o ninguno), títulos de hasta 120 caracteres y punto final. Los commits siguen con las reglas estrictas de `commitlint.config.mjs`.
- **Revisión obligatoria:** protección de `develop` y `main` cambiada a **3 aprobaciones** (todo el equipo; el autor no cuenta), con `dismiss_stale_reviews`, `require_last_push_approval`, revisión de CODEOWNERS y `enforce_admins`. Force pushes bloqueados. Aplicado ya el 28/10; documentado en [[ADR-008-revision-obligatoria-equipo]] y [[devops]].
- **Limpieza:** cerrados los PRs de Dependabot #76–#80.
- Actualizados `docs/flujo-trabajo.md`, `AGENTS.md` y `scripts/configurar-github.sh`.

## Qué queda

- Mergear el PR #81 (ahora necesita 3 aprobaciones: Rubén, Marina y Kevin; los agentes no mergean).
- Si se quiere volver a tener PRs de dependencias, cambiar el límite a 5 en `dependabot.yml` o activar las actualizaciones de seguridad en Settings.

## Bloqueos / preguntas para otros

- **Kevin:** la protección de `develop`/`main` ya está aplicada con 3 aprobaciones y admins incluidos. Revisa la política, el script y dime si ves algún problema para la entrega.
- Cualquier PR nuevo (incluido #75) ya exige 3 aprobaciones; si alguien no está disponible, el merge espera.
- El check `PR / reglas` de este PR usa la versión nueva del workflow (misma rama), así que valida el título flexible desde el primer momento.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `.github/dependabot.yml`
- `.github/workflows/pr.yml`
- `commitlint.pr.config.mjs` (nuevo)
- `scripts/configurar-github.sh`
- `docs/flujo-trabajo.md`
- `AGENTS.md`
- `obsidian/03-decisiones/ADR-008-revision-obligatoria-equipo.md` (nuevo)
- `obsidian/05-areas/devops.md`
- `obsidian/01-estado/estado-equipo.md` (fila de Alex)
- `obsidian/04-handoffs/2026-10-28-alex-dependabot-y-titulos-pr.md` (este fichero)
