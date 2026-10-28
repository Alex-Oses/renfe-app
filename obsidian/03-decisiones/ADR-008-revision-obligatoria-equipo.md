---
fecha: 2026-10-28
estado: aceptado
autor: Alex
tags: [adr]
---

# ADR-008 — Revisión obligatoria de todo el equipo antes de mergear

## Contexto

`develop` y `main` estaban protegidas con **1 aprobación** + checks `ok` y `reglas`. Con un equipo de 4 personas, eso permitía mergear un PR sin que los otros tres lo hubieran revisado. Se quiere que **todos** revisen el código y den el visto bueno antes de integrar nada.

## Decisión

En `develop` y `main`:

- **3 aprobaciones obligatorias.** El autor no puede aprobar su propio PR, así que con 4 personas son exactamente los otros 3 miembros del equipo.
- `dismiss_stale_reviews`: si se sube un commit nuevo, las aprobaciones anteriores se descartan.
- `require_last_push_approval`: la última persona que empujó no puede ser la única que aprueba.
- `require_code_owner_reviews`: se mantiene la revisión del dueño del área (`CODEOWNERS`).
- `enforce_admins`: la regla se aplica también a Alex como administrador; no hay bypass.
- `allow_force_pushes: false` y `allow_deletions: false` en ambas ramas.
- Siguen siendo obligatorios los checks `CI / ok` y `PR / reglas` y la resolución de conversaciones.

La configuración queda reproducible en `scripts/configurar-github.sh` (`proteger develop 3` y `proteger main 3`).

## Alternativas descartadas

- **1 aprobación (anterior):** no garantiza que todos revisen.
- **2 aprobaciones:** deja a un miembro fuera de la revisión.
- **4 aprobaciones:** imposible, porque el autor no puede aprobar su propio PR.
- **Solo CODEOWNERS:** cuando una regla tiene varios owners basta con la aprobación de uno, no de todos.

## Consecuencias

- Ningún PR se mergea sin los 3 compañeros; si alguien no está disponible, el merge espera.
- También se aplica a los PRs de release `develop → main`: hay que planificarlos con margen antes de la entrega del 6/11.
- Para cambiar la política hay que modificar la protección de ramas (Alex/admin) y `scripts/configurar-github.sh`; no se puede saltar desde la UI.
