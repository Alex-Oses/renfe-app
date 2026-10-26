# 🤖 Agentes de IA, el vault de Obsidian y Git

Objetivo: que **cualquier IA del equipo**, en cualquier PC, lea el vault al empezar, siga el flujo de Git y escriba en el vault al terminar, sin que nadie tenga que configurar nada.

## Cómo funciona

| Pieza | Qué hace |
|---|---|
| `AGENTS.md` | Reglas comunes: protocolo del vault y flujo de Git. Lo leen OpenCode, Codex y otros automáticamente. |
| `CLAUDE.md` | Importa `AGENTS.md` (`@AGENTS.md`) para Claude Code. |
| `.claude/settings.json` | Hook `SessionStart` que pasa el resumen del vault; permisos que bloquean push a `main`/`develop`, `--force` y `--no-verify`. |
| `.claude/commands/` y `.opencode/command/` | `/rama`, `/pr`, `/handoff`, `/estado`. |
| `opencode.json` | Carga en cada sesión `AGENTS.md`, las reglas del vault, el estado del equipo y el sprint. |
| `.github/copilot-instructions.md` | Redirige a `AGENTS.md` para Copilot. |
| `scripts/agent-context.mjs` | Resume el vault (también: `pnpm contexto`). |
| `.husky/` | Hooks de Git: valen igual para personas e IAs. |

Todo está dentro del repo, así que al clonar (y hacer `pnpm install`) ya funciona.

## Ciclo de una tarea con IA

| Momento | Comando | Qué hace la IA |
|---|---|---|
| Abrir la sesión | (automático) | Lee estado, sprint y últimos handoffs |
| Empezar tarea | `/rama busqueda de trenes` | Crea `feat/mobile-busqueda-trenes` desde develop y resume el contexto |
| Trabajar | — | Commits convencionales; actualiza contratos si toca |
| Terminar | `/pr` | Handoff + commits + `pnpm sync` + push + PR contra develop |
| Solo dejar nota | `/handoff` | Handoff y fila de estado |
| Ver el estado | `/estado` | Resumen sin tocar nada |

La IA nunca aprueba ni mergea PRs: eso lo hace una persona en GitHub.

## Claude Code (Alex)

```bash
cd renfe-app
claude
```

- La primera vez pedirá confiar en el proyecto y aprobar el hook: acepta. Comprueba con `/hooks` que aparece `SessionStart`.
- Para que `/pr` abra el PR solo, ten `gh` instalado y autenticado.
- Ajustes personales (no se suben): `.claude/settings.local.json`.

## OpenCode (Rubén, Marina, Kevin)

```bash
cd renfe-app
opencode
```

- OpenCode lee `AGENTS.md` y `opencode.json` del directorio raíz solo.
- No ejecutes `/init` en este repo: sobrescribiría `AGENTS.md`.

## Otras IAs

- **Codex CLI, Gemini CLI, Cursor, Windsurf…**: leen `AGENTS.md` (si alguna no lo hace, dile "lee AGENTS.md y síguelo").
- **Copilot**: `.github/copilot-instructions.md`.

## Qué tiene que hacer la persona

1. `pnpm install` una vez tras clonar (instala los hooks).
2. Revisar el handoff y el PR que prepara la IA.
3. Revisar y mergear PRs de los demás en GitHub.

## Si algo no funciona

- `node scripts/agent-context.mjs` debe imprimir el estado; si falla, revisa Node 22.
- En Windows, Claude Code y husky ejecutan los hooks con Git Bash: instala Git for Windows.
