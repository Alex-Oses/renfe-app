---
fecha: 2026-11-03
autor: Buffy (agente)
area: docs / frontend / backend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-022, documentacion, estado-real, anden-0]
estado: resuelto
---

# Handoff — Ticket 022: documentar el estado real del proyecto

## Qué se hizo

Se contrastaron el README raíz, `AGENTS.md`, los READMEs de área y `docs/arquitectura.md` con el
código actual. La documentación ya no presenta el repositorio como un esqueleto ni describe piezas
que no existen en la entrega.

- **Raíz y agentes:** Andén 0 es una demo funcional con web React/Vite, app Expo, `@renfe/shared`,
  API, GTFS y pruebas; se aclara que tener código no implica despliegue.
- **Frontend:** README general con web/mobile/shared y cobertura actual; README web nuevo; móvil
  distingue Expo Go del facial nativo; shared deja de hablar de una «futura app».
- **Backend:** API en desarrollo activo, worker que solo importa GTFS estático de AVE/LD y base de
  datos sin Realtime en la entrega. Se distingue autenticación real de precios, asientos, reservas,
  abonos y pagos simulados.
- **Arquitectura:** diagrama y flujos corregidos para web/shared, pago simulado sin Stripe, caché de
  `/posiciones` en la API y login facial en el dispositivo. El plan por sprints queda como histórico.

No se cambiaron responsables, contratos, seguridad facial, ramas, reglas del vault, ADRs ni tiquets
históricos. Tampoco se afirma que una función esté desplegada o verificada en producción.

## Qué queda

- Nada de este tiquet. Los siguientes tiquets de la rama continúan por su orden.
- Si en el futuro se conecta Stripe o se recupera el worker con Realtime, habrá que actualizar estos
  READMEs y el ADR correspondiente.

## Bloqueos / preguntas para otros

- No hay Docker, Supabase local ni API real probada en este entorno.
- La app móvil no se ha abierto en emulador o dispositivo; sus cambios de documentación se validaron
  por revisión y `tsc`/lint, no visualmente.
- La web no se revisó en navegador para este tiquet: solo cambiaron textos de documentación y la
  búsqueda de afirmaciones obsoletas.

## Cambios en contratos

Ninguno.

## Comprobación

- Búsqueda final de `esqueleto|ninguna funcionalidad|Todo funciona en Expo Go|face-svc|face service|servicio facial aparte|Claude API|Supabase Realtime|dispara Realtime`:
  solo quedan negaciones explícitas y el ejemplo histórico de `docs/git-github.md`.
- `pnpm --filter @renfe/shared test` → **172**; `@renfe/web test` → **39**.
- `shared lint`, `web lint`, `web build`, `mobile lint` y `api lint` en verde.
- `git diff --check` sin errores.

## Ficheros tocados

- `README.md`
- `AGENTS.md`
- `frontend/README.md`
- `frontend/web/README.md` (nuevo)
- `frontend/mobile/README.md`
- `frontend/shared/README.md`
- `backend/README.md`
- `backend/api/README.md`
- `backend/database/README.md`
- `docs/arquitectura.md`
- `tickets/ticket-022.md`
- `obsidian/04-handoffs/2026-11-03-buffy-ticket-022-docs-estado-real.md`
