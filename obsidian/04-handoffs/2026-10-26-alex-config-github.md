---
fecha: 2026-10-26
autor: Alex
area: devops
para: todos
rama: docs/vault-gemini-dailys
pr: (ver PR de esta rama)
tags: [handoff, github]
---

# Handoff — Configuración de GitHub cerrada

## Qué se hizo
- Mergeados en `develop` (Alex como admin): #1 guía de subida, #3 checks obligatorios `ok` y `reglas`, #8 docs y vault sin dueño en CODEOWNERS, #9 `graph.json` fuera de Git.
- Los checks obligatorios ya existen: los PRs se pueden mergear con 1 aprobación + CI verde.
- PRs que solo tocan `docs/` u `obsidian/` los puede aprobar cualquiera; los contratos siguen pidiendo a Rubén, Marina y Alex.
- Nuevo [[contexto-gemini-dailys]]: contexto para que Gemini transcriba las dailies con [[plantillas/daily]].
- Aviso del repo enviado en Slack (#general-renfe) con el prompt de OpenCode.

## Qué queda
- Kevin: revisar los PRs de Dependabot #4-#7 (versiones mayores de las Actions).
- Alex: revisar #2 (no sigue Conventional Commits) y crear la app Expo en `frontend/mobile`.
- Rubén y Marina: sus tareas del Sprint 0.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `obsidian/00-inicio/contexto-gemini-dailys.md`, `obsidian/01-estado/estado-equipo.md`.
