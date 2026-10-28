# AGENTS.md — Instrucciones para agentes de IA

Este fichero lo leen automáticamente OpenCode, Codex, Claude Code (vía `CLAUDE.md`), Copilot y otros agentes. **Síguelo siempre.** Idioma del proyecto: **español** (código y nombres de variables pueden ir en inglés; documentación, commits y notas del vault en español).

## 1. Qué es este repo

Monorepo pnpm de una app tipo Renfe hecha por un equipo de 4 personas con Scrum. Está dividido en tres zonas:

- `frontend/` → app Expo / React Native (responsable: Alex).
- `backend/` → API NestJS (Rubén, con el login facial dentro), Supabase (Marina), worker GTFS (Marina).
- `obsidian/` → **vault de Obsidian, memoria compartida entre humanos e IAs.**

Antes de tocar una zona, lee su `README.md`. No modifiques zonas de otra persona sin que la tarea lo pida; si es necesario, déjalo anotado en el handoff.

## 2. Protocolo del vault (OBLIGATORIO)

El vault `obsidian/` es cómo se coordinan las IAs de cada miembro del equipo. Cada IA trabaja en un PC distinto y **no ve tu conversación**: solo ve lo que quede escrito en el vault y en Git.

### Al EMPEZAR una sesión de trabajo

1. Lee `obsidian/01-estado/estado-equipo.md` (estado global y quién hace qué).
2. Lee `obsidian/01-estado/sprint-actual.md` (objetivos del sprint).
3. Lee los **3 handoffs más recientes** de `obsidian/04-handoffs/` y cualquiera dirigido a ti o a tu área.
4. Si vas a tocar la API o los datos, lee `obsidian/02-contratos-api/` (endpoints, modelo de datos, eventos). **El contrato manda**: si el código y el contrato discrepan, avisa antes de cambiar nada.
5. Revisa `obsidian/03-decisiones/` si la tarea afecta a arquitectura.

(Claude Code y OpenCode ya reciben un resumen automático al arrancar gracias a `scripts/agent-context.mjs`; aun así abre los ficheros completos si la tarea lo necesita.)

### DURANTE el trabajo

- Si cambias un endpoint, un tipo compartido, una tabla o un evento → **actualiza primero el contrato** en `obsidian/02-contratos-api/` y luego el código.
- Si tomas una decisión de arquitectura → crea un ADR en `obsidian/03-decisiones/` con la plantilla `obsidian/plantillas/adr.md`.

### Al TERMINAR una sesión de trabajo

1. Crea un handoff en `obsidian/04-handoffs/` con nombre `AAAA-MM-DD-persona-tema.md` usando `obsidian/plantillas/handoff.md`. Incluye: qué se hizo, qué queda, bloqueos, ficheros tocados, rama y PR, y a quién va dirigido.
2. Actualiza tu fila en `obsidian/01-estado/estado-equipo.md` (estado, en qué estás, bloqueos). **Solo tu fila**, no reescribas la de otros.
3. Si tu área cambió, actualiza su nota en `obsidian/05-areas/`.
4. Commitea las notas del vault en su propio commit (`docs(vault): ...`) en la misma rama.

En Claude Code y OpenCode existe el comando `/handoff` que hace estos pasos.

### Reglas del vault

- Notas en Markdown estándar, con frontmatter YAML (`fecha`, `autor`, `area`, `tags`).
- Enlaces internos con `[[nombre-de-nota]]`.
- Nunca borres handoffs ni ADRs; si algo queda obsoleto, márcalo `estado: obsoleto`.
- Nunca escribas secretos, claves ni tokens en el vault.
- No toques `obsidian/.obsidian/` salvo `app.json`.

## 3. Git y GitHub (OBLIGATORIO)

Detalle completo en `docs/flujo-trabajo.md`. Resumen para agentes:

### Ramas
- `main` = lo entregado/estable. `develop` = integración y rama por defecto. **Nunca commitees ni hagas push directamente a ninguna de las dos** (los hooks lo bloquean y GitHub lo rechaza).
- Rama de trabajo: `<tipo>/<area>-<tema-kebab>` creada SIEMPRE con `pnpm rama <tipo> <area> <tema>` (parte de `origin/develop` actualizado).
  - tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `hotfix`
  - áreas: `mobile`, `api`, `db`, `gtfs`, `face`, `infra`, `vault`, `docs`
  - ejemplo: `feat/mobile-busqueda-trenes`
- Una rama = una tarea/issue pequeña (idealmente < 400 líneas cambiadas, vida < 3 días).

### Commits
- Conventional Commits: `tipo(ámbito): descripción en español` (ámbitos: `mobile`, `api`, `db`, `gtfs`, `face`, `infra`, `ci`, `vault`, `docs`, `deps`). El hook `commit-msg` (commitlint) los valida.
- Commits pequeños y que compilen. Las notas del vault, en commit aparte `docs(vault): ...`.
- **Prohibido** `--no-verify`, `git push --force` (usa `--force-with-lease` solo en tu rama tras rebase), reescribir historia de `main`/`develop`.

### Antes de abrir PR
1. `pnpm sync` (rebase sobre `origin/develop`). Si hay conflictos en ficheros de otra área, para y pregunta.
2. `pnpm lint` y `pnpm test` en verde.
3. Handoff escrito.

### Pull requests
- Siempre contra `develop`, con `.github/pull_request_template.md`. Título en formato Conventional Commits (será el commit final: se mergea con **squash**).
- Enlaza la issue (`Closes #N`). Revisor automático por `CODEOWNERS`; necesita 1 aprobación y CI verde (`CI / ok`, `PR / reglas`).
- A `main` solo llegan PRs desde `develop` (fin de sprint, merge commit, lo abre Alex) o `hotfix/*`.
- Los agentes **no aprueban ni mergean PRs**; eso lo hacen las personas.

Comandos: `/rama` (empezar tarea), `/pr` (commits + handoff + push + PR), `/handoff`, `/estado`.

## 4. Convenciones de código

- Gestor de paquetes: **pnpm** (nunca npm ni yarn). Node 22.
- TypeScript estricto en frontend, API y worker. No hay servicio facial aparte ni código Python: el
  vector lo calcula el dispositivo y decide Postgres (ADR-007).
- Variables de entorno: añade la clave a `.env.example` (sin valor real). Nunca subas `.env`.

## 5. Límites

- Asientos, precios, reservas y pagos son **simulados** (Renfe solo publica GTFS/GTFS-RT). Stripe siempre en **modo test**.
- Reconocimiento facial: solo se guardan embeddings, nunca fotos.
- No cambies la config de CI, hooks ni protección de ramas sin que lo pida Kevin.
- Esto es un esqueleto: no inventes funcionalidades que no estén en el sprint actual.

## 6. Mapa rápido

| Necesitas… | Mira |
|---|---|
| Arquitectura general | `docs/arquitectura.md`, `obsidian/03-decisiones/` |
| Endpoints | `obsidian/02-contratos-api/endpoints.md` |
| Tablas | `obsidian/02-contratos-api/modelo-datos.md` |
| Quién hace qué | `obsidian/01-estado/estado-equipo.md` |
| Ramas, commits, PRs | `docs/flujo-trabajo.md` |
