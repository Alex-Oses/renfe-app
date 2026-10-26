# CLAUDE.md

Las instrucciones del proyecto están en AGENTS.md (compartido con OpenCode y el resto de agentes). Claude Code las importa aquí:

@AGENTS.md

## Específico de Claude Code

- Al arrancar la sesión, el hook `SessionStart` de `.claude/settings.json` ejecuta `scripts/agent-context.mjs` y te pasa un resumen del vault (estado del equipo, sprint y últimos handoffs). Léelo antes de empezar.
- Para empezar una tarea usa `/rama`; para terminarla, `/pr` (incluye el handoff). `/handoff` solo deja la nota; `/estado` resume el proyecto sin tocar nada.
- `.claude/settings.json` bloquea push a `main`/`develop`, `--force` y `--no-verify`. No intentes saltártelo.
