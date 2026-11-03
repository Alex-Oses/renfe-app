# Ticket 022 — Actualizar la descripción obsoleta del proyecto para agentes

- **Prioridad:** P1
- **Área:** documentación e instrucciones de agentes
- **Estado:** Arreglado
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

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Contraste:** el código confirma una web React/Vite propia, una app Expo, el paquete `@renfe/shared`,
la API NestJS, un worker que solo importa GTFS estático de AVE/LD y `GET /posiciones` con caché de
GTFS-RT en memoria. Stripe no está conectado; el pago de la demo es simulado.

**Cambios:**

- `README.md` y `AGENTS.md`: Andén 0 como demo funcional, no esqueleto; web, app Expo y shared;
  TypeScript en todas las piezas.
- `frontend/README.md`, `frontend/web/README.md`, `frontend/mobile/README.md` y
  `frontend/shared/README.md`: estado, comandos, cobertura y límites actuales; Expo Go solo para lo
  que no requiere el facial nativo.
- `backend/README.md`, `backend/api/README.md` y `backend/database/README.md`: API y worker en
  desarrollo activo, autenticación real, datos GTFS/GTFS-RT reales y precios/reservas/pagos simulados;
  sin servicio facial ni Realtime en la entrega.
- `docs/arquitectura.md`: diagrama y flujos alineados con web/shared, pago simulado, caché de
  `/posiciones` y login facial en el dispositivo. El plan por sprints queda marcado como histórico.

Se conservaron responsables, contratos, seguridad facial, ramas, reglas del vault, ADRs y tiquets
históricos. No se afirma que nada esté desplegado; la disponibilidad depende del entorno.

**Comprobación:** búsqueda final sin afirmaciones obsoletas (solo quedan negaciones explícitas como
«no es un esqueleto» y el ejemplo histórico de `docs/git-github.md`); 172 pruebas shared, 39 web,
lints shared/móvil/API y build web en verde. Detalles en
[[2026-11-03-buffy-ticket-022-docs-estado-real]].
