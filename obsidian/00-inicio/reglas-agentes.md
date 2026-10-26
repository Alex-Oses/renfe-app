---
tags: [agentes, reglas]
---

# 🤖 Reglas para agentes de IA (resumen)

Versión corta del protocolo de `AGENTS.md`. OpenCode la carga siempre (vía `opencode.json`) y Claude Code la recibe por `CLAUDE.md`.

1. **Empieza leyendo:** [[estado-equipo]], [[sprint-actual]] y los 3 últimos handoffs de `04-handoffs/`.
2. **Contrato primero:** si tocas API, tablas o eventos, actualiza `02-contratos-api/` antes que el código.
3. **Decisiones:** si decides algo de arquitectura, crea un ADR en `03-decisiones/`.
4. **Termina escribiendo:** un handoff en `04-handoffs/AAAA-MM-DD-persona-tema.md` con [[plantillas/handoff|la plantilla]] y actualiza **solo tu fila** de [[estado-equipo]]. Usa `/handoff`.
5. **Nunca:** borrar handoffs/ADRs, escribir secretos, reescribir filas de otras personas, tocar `.obsidian/`.
6. **Idioma:** español.

## Quién es quién

| Persona | Área | Carpetas |
|---|---|---|
| Alex | Frontend + PO | `frontend/` |
| Rubén | Backend + chatbot | `backend/api/` |
| Marina | Base de datos + SM | `backend/database/`, `backend/gtfs-worker/` |
| Kevin | DevOps + Stripe + face | `backend/face-service/`, Docker, CI |

Si tu tarea necesita algo de otra área, **no lo hagas tú**: déjalo en el handoff dirigido a esa persona (campo `para:`).
