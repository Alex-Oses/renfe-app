#!/usr/bin/env bash
# Configura el repo de GitHub de una sola vez (lo ejecuta Alex tras el primer push).
# Requiere GitHub CLI autenticado:  gh auth login
# Uso (Git Bash en Windows):  bash scripts/configurar-github.sh Alex-Oses/renfe-app
set -euo pipefail
REPO="${1:-Alex-Oses/renfe-app}"
echo "Configurando $REPO ..."

# 1. Ajustes generales: develop por defecto, squash a develop, borrar ramas al mergear
gh api -X PATCH "repos/$REPO" \
  -f default_branch=develop \
  -F allow_squash_merge=true \
  -F allow_merge_commit=true \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY >/dev/null
echo "✔ Ajustes generales"

# 2. Protección de ramas (main y develop). Los checks se llaman por el id del job: ci.yml → ok, pr.yml → reglas
proteger() {
  local rama="$1" aprobaciones="$2"
  gh api -X PUT "repos/$REPO/branches/$rama/protection" --input - >/dev/null <<JSON
{
  "required_status_checks": { "strict": true, "contexts": ["ok", "reglas"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": $aprobaciones,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  echo "✔ Protección de $rama"
}
proteger develop 1
proteger main 1

# 3. Labels
crear_label() { gh label create "$1" --color "$2" --description "$3" --repo "$REPO" --force >/dev/null; }
crear_label historia  1d76db "Historia de usuario"
crear_label bug       d73a4a "Algo no funciona"
crear_label frontend  8a1b61 "frontend/"
crear_label api       0e8a16 "backend/api"
crear_label database  5319e7 "backend/database"
crear_label gtfs      fbca04 "backend/gtfs-worker"
crear_label devops    000000 "Docker, CI, infra"
crear_label vault     7057ff "obsidian/"
crear_label release   b60205 "PR de develop a main"
echo "✔ Labels"

# 4. Milestones de sprint
for n in 0 1 2 3 4 5 6 7; do
  gh api "repos/$REPO/milestones" -f title="Sprint $n" >/dev/null 2>&1 || true
done
echo "✔ Milestones Sprint 0-7"
echo "Listo. Revisa Settings → Branches en GitHub."
