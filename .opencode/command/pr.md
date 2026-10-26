---
description: Termina la tarea: commits convencionales, handoff, push y PR contra develop
---

Vas a cerrar la tarea actual siguiendo `docs/flujo-trabajo.md`. No hagas nunca push a `main` ni a `develop`, ni `--force` (solo `--force-with-lease` tras un `pnpm sync`).

1. Comprueba que estás en una rama de trabajo válida (`pnpm validar-rama`). Si estás en `main` o `develop`, para y crea una rama con `pnpm rama`.
2. Si no hay handoff de esta sesión en `obsidian/04-handoffs/`, haz primero los pasos de `/handoff`.
3. Agrupa los cambios en commits pequeños con Conventional Commits: `tipo(ámbito): descripción` (ámbitos: mobile, api, db, gtfs, face, infra, ci, vault, docs, deps). Las notas del vault van en su propio commit `docs(vault): ...`. El hook `commit-msg` rechaza mensajes incorrectos: si falla, corrige el mensaje, no uses `--no-verify`.
4. Ejecuta `pnpm sync` para ponerte al día con `develop`. Si hay conflictos en ficheros de otra área, para y pregunta.
5. `git push -u origin <rama>` (o `git push --force-with-lease` si la rama ya existía y has hecho rebase).
6. Si `gh` está disponible, abre el PR contra `develop`:
   `gh pr create --base develop --title "<tipo(ámbito): resumen>" --body-file -` rellenando `.github/pull_request_template.md` y enlazando la issue (`Closes #N`). Si `gh` no está, muestra el enlace de GitHub para crearlo a mano y el título/cuerpo propuestos.
7. Devuelve el enlace del PR y recuerda avisar en Slack si bloquea a alguien.

Notas: $ARGUMENTS
