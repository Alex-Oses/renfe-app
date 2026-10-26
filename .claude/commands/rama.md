---
description: Empieza una tarea nueva creando la rama correcta desde develop
---

Vas a preparar una rama de trabajo siguiendo `docs/flujo-trabajo.md`.

1. Comprueba `git status`. Si hay cambios sin commitear, pregunta qué hacer con ellos antes de seguir.
2. A partir de la tarea ($ARGUMENTS), decide el tipo (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`), el área (`mobile`, `api`, `db`, `gtfs`, `face`, `infra`, `vault`, `docs`) y un tema corto en kebab-case. El área tiene que ser la de quien te usa (ver `obsidian/01-estado/estado-equipo.md`); si la tarea es de otra área, avisa.
3. Ejecuta `pnpm rama <tipo> <area> <tema>` (crea la rama desde `origin/develop` actualizado).
4. Lee los handoffs recientes relacionados con esa área en `obsidian/04-handoffs/` y resume en 3 líneas el punto de partida.
