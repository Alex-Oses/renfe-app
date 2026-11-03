---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-001, mobile, pagos, auth]
estado: abierto
---

# Handoff — Ticket 001: el pago desde móvil se queda sin sesión y sin endpoint

## Qué se hizo

**Diagnóstico en dos capas.** El ticket decía que la API rechazaba el pago por falta de
`Authorization`. Al reproducirlo aparecieron **dos fallos encadenados** en la misma compra:

1. **Sin sesión, la app salía a la red igualmente.** El cliente compartido solo añadía
   `Authorization: Bearer …` si había token, así que la llamada protegida llegaba sin cabecera y el
   `SupabaseJwtGuard` devolvía 401, que la app enseñaba como error genérico.
2. **Con sesión válida, la compra seguía fallando después.** `pasajero.tsx` hacía
   `crearReserva` → `crearIntentoPago` → `confirmarPagoSimulado`. La API **no tiene módulo de
   pagos**: `POST /pagos/intent` responde 404, y `confirmarPagoSimulado` rechaza a propósito cuando
   hay API configurada. Resultado: reserva creada (y cobrada en la BD) pero pantalla de error, sin
   billete. La web no tiene este problema porque usa `comprarReserva`.

**Arreglo.**

- `frontend/mobile/src/app/pasajero.tsx` usa ahora `comprarReserva`, el mismo camino que la web:
  con API devuelve la reserva de `POST /reservas`, que ya nace pagada; sin API conserva el pago
  simulado (intento + confirmación). Desaparecen de la pantalla `crearReserva`,
  `crearIntentoPago` y `confirmarPagoSimulado`.
- Se mantiene el corte previo a la red de `exigirSesionParaCompra()` (commit `ea28ff2`) en
  `crearReserva`, `crearIntentoPago` y `crearReservaTransbordo`: sin sesión no se envía nada y se
  avisa con «Inicia sesión para comprar un billete.». Un 401 con token sigue invalidando la sesión
  (`SESION_CADUCADA`) para que la app no finja que el pago se completó.
- **Pruebas nuevas** en `frontend/shared/api/cliente.test.ts` («compra completa desde móvil»): con
  sesión se envía `Authorization: Bearer …`, **no** se llama a `/pagos/intent` y la reserva vuelve
  `pagada`; sin sesión la compra se corta antes de la red y no devuelve reserva.
- El ticket queda actualizado en `tickets/ticket-001.md` con la causa y la resolución.

**Comprobado:** `pnpm --filter @renfe/shared test` → 27 ficheros, 148 pruebas en verde;
`pnpm --filter @renfe/mobile lint` (`tsc --noEmit`) sin errores.

## Qué queda

- **Probar la compra en un móvil real** (Android/iOS) con sesión válida y sin sesión. Este entorno
  no tiene SDK de Android, JDK ni dispositivo, así que no se ha ejecutado la pantalla.
- Si en el ensayo se quiere el flujo de Stripe, habría que crear el módulo `pagos` en la API; fuera
  del alcance del ticket (el pago es simulado).

## Bloqueos / preguntas para otros

- Ninguno técnico. La decisión de producto sigue siendo la del repo: la reserva nace pagada y el pago
  con Stripe está fuera de alcance.
- `ComprarLocalizador` (herramienta de Reservas) sigue con pago simulado explícito; no se toca aquí.

## Cambios en contratos

- Ninguno: no se añaden ni cambian endpoints. `POST /reservas` ya documentaba que la reserva se crea
  pagada en modo API.

## Ficheros tocados

- `frontend/mobile/src/app/pasajero.tsx`
- `frontend/shared/api/cliente.test.ts`
- `tickets/ticket-001.md`
- Vault: este handoff
