---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-011, tarifas, reservas, web, mobile]
estado: resuelto
---

# Handoff — Ticket 011: tarifa seleccionada durante la compra

## Por qué falla

- En el flujo **directo** la tarifa viaja en la URL desde `Resultados` (`?tarifa=elige`) y `Reserva` la
  lee; ahí no se reprodujo la pérdida.
- En **transbordo** la app recibía `tarifa` por la URL pero **no la usaba**: `NuevaReserva` se construía
  sin tarifa y la API cobraba básico. La web tampoco la leía de forma fiable.
- Ambos clientes resolvían la tarifa con `TARIFAS.find(...)`: cualquier texto (la etiqueta «Elige», un
  id inventado o una URL antigua) se convertía en silencio en Básico, sin validar el contrato.
- En la app, `useState(tarifaInicial)` no se sincronizaba si se volvía a entrar con otro `?tarifa=`.

## Qué se cambió

- `frontend/shared/api/tarifas.ts` (nuevo): `resolverTarifa` acepta **solo** ids de `TARIFAS` y cae al
  básico con etiquetas/valores inválidos; `nombreDeTarifa` para el resumen.
- Web `Reserva` y `ReservaTransbordo` usan el resolutor; la app `pasajero` y `transbordo` también.
- `transbordo` (app) envía `tarifa` en `NuevaReserva` y la aplica a `precioOpcion`; la web ya la
  envía desde el ticket 010.
- `pasajero` sincroniza el estado con el `?tarifa=` de la URL y el resumen muestra el nombre de la
  tarifa; antes no aparecía.
- Pruebas: 6 de `resolverTarifa` (cada id, etiqueta, id inventado, vacío y nombre visible). El test
  existente de `cuerpoReserva` sigue comprobando que la API recibe el **id** (`elige`), no el texto.

## Cómo se comprobó

- `pnpm --filter @renfe/shared test` → **167 pruebas** en verde.
- `pnpm --filter @renfe/shared lint`, `pnpm --filter @renfe/web lint` y
  `pnpm --filter @renfe/mobile lint` → en verde.

## Pendiente / límites

- No se ha completado una compra en navegador ni dispositivo; se ha verificado con typecheck y pruebas.
- La disponibilidad por tarifa (que no haya butacas de esa clase) **no** se modela: todas las tarifas
  del contrato se ofrecen siempre. Si producto quiere bloquear alguna, hace falta exponer las clases
  libres en la búsqueda y deshabilitar la tarjeta con su motivo.

## Cambios en contratos

- Ninguno: `tarifa` sigue siendo `basico | elige | elige-confort | premium`.

## Ficheros tocados

- `frontend/shared/api/tarifas.ts` y `.test.ts`
- `frontend/web/src/paginas/reserva/Reserva.tsx`, `ReservaTransbordo.tsx`
- `frontend/mobile/src/app/pasajero.tsx`, `transbordo.tsx`
- `tickets/ticket-011.md`
