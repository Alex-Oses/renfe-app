---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-016, billetes, accesibilidad, web, mobile]
estado: resuelto
---

# Handoff — Ticket 016: tarjeta completa del billete

## Por qué falla

En web, `TarjetaViaje` era un `<article>` y solo los enlaces de cada viajero navegaban; la foto, los
datos y el talón no hacían nada. En móvil, `TarjetaBillete` tenía `Pressable` solo en las filas de
viajeros. No había un destino único para la tarjeta.

## Qué se cambió

- Web: `ticket__enlace` es un `Link` absoluto que cubre la tarjeta (`inset: 0`) con `aria-label`
  («Abrir billete de Madrid a Sevilla, AVE 2024»). Va por debajo de los enlaces de viajero
  (`z-index` 2), que conservan su destino. `enlaceBillete` centraliza el destino en el primer billete
  del viaje y codifica el id.
- Móvil: la tarjeta es un `Pressable` con etiqueta accesible y `onPress` al primer billete; las filas
  de viajero hacen `stopPropagation` antes de abrir su propio billete.
- CSS: cursor de tarjeta y anillo de foco visible en el enlace completo.

## Cómo se comprobó

- `pnpm --filter @renfe/web test` → **39 pruebas** (2 nuevas del destino).
- `pnpm --filter @renfe/web lint` y `pnpm --filter @renfe/mobile lint` → en verde.
- Chrome headless con una reserva simulada de dos viajeros:
  - clic en la ruta de la tarjeta → `/billetes/SIM-016-1` (el overlay recibe el clic);
  - atrás → `/billetes`;
  - foco en el enlace de tarjeta + Enter → `/billetes/SIM-016-1`;
  - clic en la fila del segundo viajero → `/billetes/SIM-016-2`, no la primera.
- No se ha ejecutado la app móvil en dispositivo; el typecheck valida el cambio.

## Pendiente / límites

- La reserva de prueba se sembró en `localStorage` porque el simulado no trae compras por defecto.
- El overlay cubre el texto de la tarjeta: seleccionar texto con el ratón es menos cómodo, a cambio de
  que cualquier zona active el detalle.
- En móvil, la tarjeta y las filas son `Pressable` anidados; se ha añadido `stopPropagation` en las
  filas, pero conviene una pasada con VoiceOver/TalkBack para confirmar el orden de foco.

## Ficheros tocados

- `frontend/web/src/paginas/MisBilletes.tsx`
- `frontend/web/src/paginas/billetes.css`
- `frontend/web/src/paginas/billetes/enlace.ts` y `enlace.test.ts`
- `frontend/mobile/src/components/TarjetaBillete.tsx`
- `tickets/ticket-016.md`
