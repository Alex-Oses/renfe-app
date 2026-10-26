# 🔁 Flujo de trabajo con Git y GitHub

Modelo: **GitHub Flow con rama de integración** (`develop`) y entregas a `main` al final de cada sprint. Todo está automatizado: si te equivocas, un hook o la CI te lo dice.

```
main     ●───────────────●──────────────●        ← entregas (fin de sprint), merge commit, tag v0.N
          \             / \            /
develop    ●──●──●──●──●───●──●──●──●─●          ← integración (rama por defecto)
              \  /  \ /       \  /
feat/…         ●●    ●         ●●                ← tu trabajo, squash merge a develop
```

## Las reglas en 6 líneas

1. Nadie toca `main` ni `develop` directamente: todo entra por PR.
2. Cada tarea en su rama `<tipo>/<area>-<tema>`, creada con `pnpm rama`.
3. Commits con Conventional Commits (`feat(api): ...`).
4. Antes del PR: `pnpm sync` (rebase sobre develop) y tests en verde.
5. PR contra `develop`, 1 aprobación (CODEOWNERS) + CI verde → **squash merge**.
6. Fin de sprint: PR `develop → main` (merge commit) y tag `v0.<sprint>`.

## Qué está automatizado y dónde

| Automatización | Fichero | Qué hace |
|---|---|---|
| Hook `pre-commit` | `.husky/pre-commit` | Impide commitear en `main`/`develop` y en ramas con mal nombre |
| Hook `commit-msg` | `.husky/commit-msg` + `commitlint.config.mjs` | Rechaza mensajes que no sean Conventional Commits |
| Hook `pre-push` | `.husky/pre-push` | Impide pushear a `main`/`develop` |
| `pnpm rama` | `scripts/nueva-rama.mjs` | Crea la rama con el nombre correcto desde `origin/develop` actualizado |
| `pnpm sync` | `scripts/sync-rama.mjs` | Rebase de tu rama sobre `origin/develop` |
| Reglas de ramas | `scripts/ramas.mjs` | Única definición de tipos/áreas, la usan hooks, scripts y CI |
| Workflow `PR` | `.github/workflows/pr.yml` | Valida nombre de rama, destino (a `main` solo desde develop/hotfix) y título del PR; etiqueta por carpeta |
| Workflow `CI` | `.github/workflows/ci.yml` | Lint/test/build solo de las áreas que cambian; check único `CI / ok` |
| Revisores | `.github/CODEOWNERS` | Pide revisión al responsable de cada carpeta |
| Dependencias | `.github/dependabot.yml` | PRs semanales de actualización contra `develop` |
| Config de GitHub | `scripts/configurar-github.sh` | Protección de ramas, tipos de merge, labels y milestones (una vez) |
| Agentes de IA | `AGENTS.md`, `/rama`, `/pr` | Las IAs siguen el mismo flujo |

Los hooks se instalan solos al hacer `pnpm install` (script `prepare` → husky).

## Nombres de rama

`<tipo>/<area>-<tema-en-kebab-case>`

| Tipo | Uso | | Área | Carpeta |
|---|---|---|---|---|
| `feat` | Funcionalidad nueva | | `mobile` | `frontend/mobile` |
| `fix` | Corrección | | `api` | `backend/api` |
| `docs` | Documentación | | `db` | `backend/database` |
| `chore` | Mantenimiento | | `gtfs` | `backend/gtfs-worker` |
| `refactor` | Reestructurar sin cambiar comportamiento | | `face` | `backend/face-service` |
| `test` | Tests | | `infra` | Docker, CI |
| `ci` | Pipelines | | `vault` | `obsidian/` |
| `hotfix` | Arreglo urgente sobre `main` | | `docs` | `docs/` |

Ejemplos: `feat/mobile-busqueda-trenes`, `fix/api-qr-caducado`, `docs/vault-contrato-reservas`.

## Commits

```
tipo(ámbito): descripción corta en presente

Cuerpo opcional: por qué, no qué.
Closes #12
```

Ámbitos: `mobile`, `api`, `db`, `gtfs`, `face`, `infra`, `ci`, `vault`, `docs`, `deps`. Cambios que rompen compatibilidad: `feat(api)!: ...`.

## Un día normal

```bash
pnpm rama feat mobile busqueda trenes     # 1. rama desde develop actualizado
claude   # o opencode                     # 2. la IA lee el vault sola
# ... trabajas, commits pequeños ...
git commit -m "feat(mobile): formulario de búsqueda"
pnpm sync                                 # 3. al día con develop
git push -u origin feat/mobile-busqueda-trenes
# 4. abre el PR contra develop (o /pr en tu IA, que hace 3-4 y el handoff)
```

Si después de `pnpm sync` la rama ya estaba subida: `git push --force-with-lease` (nunca `--force`).

## Pull requests

- Contra `develop`, plantilla rellena, `Closes #N`.
- Título = commit final (squash): `feat(mobile): pantalla de búsqueda de trenes`.
- 1 aprobación de CODEOWNERS + `CI / ok` + `PR / reglas` + conversaciones resueltas.
- Quien abre el PR lo mergea tras la aprobación ("Squash and merge"). La rama se borra sola.
- PRs pequeños: mejor 3 PRs de 150 líneas que uno de 450.
- Si cambias un contrato en `obsidian/02-contratos-api/`, CODEOWNERS pide revisión a Rubén, Marina y Alex.

## Fin de sprint (Alex, como PO)

```bash
gh pr create --base main --head develop --title "chore(release): sprint 1" --body "Entrega del Sprint 1"
# tras aprobación: "Create a merge commit" (no squash, para conservar la historia)
git fetch origin && git tag v0.1 origin/main && git push origin v0.1
```

## Hotfix (algo roto en main)

```bash
git fetch origin && git switch -c hotfix/api-qr-caducado origin/main
# arreglo + PR contra main; después PR main → develop para no perder el arreglo
```

## Scrum

| Ceremonia | Cuándo | Dónde queda |
|---|---|---|
| Sprint planning | Lunes de inicio de sprint | `obsidian/01-estado/sprint-actual.md` + milestone en GitHub |
| Daily | Cada día / asíncrona en Slack `#daily` | `obsidian/06-reuniones/` |
| Review + retro | Último día del sprint (tras merge a main) | `obsidian/06-reuniones/` |

- **Product Owner (Alex):** prioriza el backlog (issues) y acepta historias; abre el PR de entrega a `main`.
- **Scrum Master (Marina):** facilita ceremonias, mantiene `sprint-actual.md` y desbloquea.

## Conflictos en el vault

`estado-equipo.md`: quédate con **las dos filas** (cada uno solo edita la suya). Los handoffs nunca chocan porque cada uno es un fichero nuevo.

## Problemas típicos

| Mensaje | Solución |
|---|---|
| `✖ No se trabaja directamente en 'develop'` | `git stash && pnpm rama ... && git stash pop` |
| `✖ Nombre de rama no válido` | `git branch -m <nombre-correcto>` |
| `subject may not be empty` / `type must be one of` | Reescribe el mensaje: `git commit --amend -m "feat(api): ..."` |
| El PR falla en `PR / reglas` por el título | Edita el título del PR en GitHub |
| Conflictos en `pnpm sync` | Resuelve, `git add`, `git rebase --continue` |
