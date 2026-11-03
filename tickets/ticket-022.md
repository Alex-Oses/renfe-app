# Ticket 022 — Actualizar la descripción obsoleta del proyecto para agentes

- **Prioridad:** P1
- **Área:** documentación e instrucciones de agentes
- **Estado:** Pendiente
- **Dependencias:** Ninguna

## Problema observado

El README raíz y `AGENTS.md` todavía describen el repositorio como un esqueleto sin funcionalidades, aunque ya existen pantallas, API, integración y pruebas. Esa información puede hacer que un agente proponga recrear trabajo ya existente.

## Criterios de aceptación

- Contrastar `README.md`, `AGENTS.md` y READMEs por área con el estado real de `develop`.
- Actualizar la descripción general, alcance y límites distinguiendo claramente datos GTFS reales de precios, reservas y pagos simulados.
- Mantener responsables, contratos, seguridad facial, flujo de ramas y reglas del vault; no reescribir decisiones históricas.
- No afirmar que una función está desplegada o verificada si solo existe código.
- Revisar coherencia entre documentación raíz y los READMEs de web, móvil y API.

## Verificación

Buscar afirmaciones obsoletas de “esqueleto”, “ninguna funcionalidad implementada” y descripciones de stack/flujo que contradigan los paquetes actuales.
