# 🐙 Subir el repo a GitHub y configurarlo (Alex, una sola vez)

Usuario de GitHub: **Alex-Oses** · Repo: `Alex-Oses/renfe-app`

Requisitos: Git for Windows (incluye Git Bash), Node 22 con `corepack enable`, y [GitHub CLI](https://cli.github.com/) (`winget install GitHub.cli`, luego `gh auth login` y `gh auth refresh -h github.com -s workflow`: sin el permiso `workflow` GitHub rechaza el push de `.github/workflows/`).

## 1. Crear el repositorio vacío

```bash
gh repo create Alex-Oses/renfe-app --private --description "App tipo Renfe (Expo + NestJS + Supabase)"
```

(O desde https://github.com/new **sin** README, `.gitignore` ni licencia.)

## 2. Primer commit y ramas

En Git Bash, dentro de `C:\Users\aleeex_PC\renfe-app`:

```bash
git init -b main
pnpm install                       # crea pnpm-lock.yaml e instala los hooks de husky
git add .
git commit --no-verify -m "chore(infra): esqueleto inicial del monorepo"
#            ^ única vez que se usa --no-verify: el hook no deja commitear en main
git remote add origin https://github.com/Alex-Oses/renfe-app.git
HUSKY=0 git push -u origin main     # HUSKY=0 solo en este push inicial: el hook pre-push bloquea main/develop

git switch -c develop
HUSKY=0 git push -u origin develop
```

## 3. Configuración automática de GitHub

```bash
bash scripts/configurar-github.sh Alex-Oses/renfe-app
```

Hace todo esto:
- `develop` como rama por defecto.
- Merges: **squash** (PRs a develop) y **merge commit** (develop → main); rebase-merge desactivado; borrar ramas al mergear; auto-merge permitido.
- Protección de `main` y `develop`: PR obligatorio, 1 aprobación, revisión de CODEOWNERS, descartar aprobaciones al hacer push, checks `CI / ok` y `PR / reglas` obligatorios y actualizados, conversaciones resueltas, sin force push ni borrado.
- Labels por área y milestones `Sprint 0` … `Sprint 7`.

> Los checks obligatorios solo aparecen en GitHub después de que la CI se haya ejecutado una vez. Si el script falla en la protección por eso, abre un PR de prueba, deja que pase la CI y vuelve a lanzar el script.
> Como admin, Alex puede saltarse la protección en emergencias (`enforce_admins: false`). No lo uses por costumbre.

## 4. Invitar al equipo

```bash
gh api -X PUT repos/Alex-Oses/renfe-app/collaborators/ruben-munoz-bl -f permission=push
gh api -X PUT repos/Alex-Oses/renfe-app/collaborators/maga369 -f permission=push
gh api -X PUT repos/Alex-Oses/renfe-app/collaborators/keta372 -f permission=push
```

En un repo de cuenta personal no existe el rol `maintain` (solo en organizaciones): Kevin entra con `push`.

Comprueba que `.github/CODEOWNERS` tiene los usuarios correctos.

## 5. Tablero

1. **Projects → New project → Board**: *Backlog · Sprint · En curso · En revisión · Hecho*. Activa los workflows del proyecto "Item added → Backlog", "PR merged → Hecho".
2. Alex (PO) crea las historias con la plantilla *Historia de usuario* y las asigna al milestone del sprint.

## 6. Secretos de GitHub Actions (más adelante, Kevin)

Settings → Secrets and variables → Actions: `SUPABASE_*`, `STRIPE_SECRET_KEY` (test), `ANTHROPIC_API_KEY`. Nunca en el código ni en el vault.

## 7. Cada miembro del equipo

```bash
git clone https://github.com/Alex-Oses/renfe-app.git
cd renfe-app
corepack enable
pnpm install          # instala los hooks: sin esto no hay validación local
```

Y a partir de aquí, [flujo-trabajo.md](flujo-trabajo.md).
