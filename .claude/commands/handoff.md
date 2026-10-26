---
description: Cierra la sesión dejando el handoff y el estado actualizados en el vault de Obsidian
---

Vas a cerrar esta sesión de trabajo siguiendo el protocolo de AGENTS.md (sección 2, "Al TERMINAR").

1. Revisa `git status` y `git diff` para saber qué se ha cambiado en esta sesión.
2. Crea `obsidian/04-handoffs/AAAA-MM-DD-<persona>-<tema>.md` (fecha de hoy, persona = quien te usa, tema corto en kebab-case) copiando `obsidian/plantillas/handoff.md` y rellenando todas las secciones.
3. Actualiza SOLO la fila de esa persona en `obsidian/01-estado/estado-equipo.md`.
4. Si se cambió un endpoint, tabla o evento, comprueba que `obsidian/02-contratos-api/` refleja el cambio.
5. Si cambió el área, actualiza la nota correspondiente de `obsidian/05-areas/`.
6. Muestra un resumen de lo que has escrito y propone el mensaje de commit `docs(vault): handoff <tema>`. No hagas push.

Notas extra del usuario: $ARGUMENTS
