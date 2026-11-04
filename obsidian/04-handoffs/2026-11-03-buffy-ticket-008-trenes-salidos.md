---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex, ruben
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-008, reservas, horarios, web, mobile]
estado: resuelto
---

# Handoff — Ticket 008: no comprar trenes ya salidos

## Por qué falla

`POST /reservas` solo comparaba la **fecha** (`dto.fecha < hoyMadrid()`), no la hora: un tren de las
07:15 seguía siendo comprable a las 20:00 del mismo día. El cliente compartido tampoco miraba la
salida, así que la web y la app permitían abrir un enlace directo `/reserva/:id`, elegir butaca y
llegar hasta el pago (la API lo aceptaba). En modo simulado (sin API) no había ninguna validación
posible en servidor.

## Qué se cambió

- `frontend/shared/api/salidas.ts` (nuevo): `haSalido(salida, ahora = Date.now())` compara el
  instante ISO **con offset** del contrato. Una hora inválida no oculta el tren.
- API (`reservas.service.ts`): tras cargar el viaje y **antes de escribir nada**, compara
  `intervaloAIso(fecha, sale)` con `Date.now()` y responde `400` «Ese tren ya ha salido». Al estar en
  `crearEn`, cubre igual la reserva simple y los dos tramos de un transbordo.
- Cliente compartido: `comprarReserva` y `comprarDosTramos` rechazan un tren pasado antes de llamar a
  la red; también protege el modo simulado.
- Web: `Resultados` marca «Ya ha salido» y no ofrece elegir tarifa; `Reserva` corta el enlace directo
  con un aviso antes de pedir asientos.
- App: `resultados` marca «Ya ha salido» y oculta «Elegir»; `pasajero` corta al cargar o al pagar y
  `transbordo` rechaza la combinación si el primer tren ya salió.
- Pruebas: `salidas.test.ts` (futuro, pasado, instante exacto, cambio de día, UTC vs +01, hora
  inválida), la reserva de un tren pasado en la API con reloj fijado y la compra compartida sin red.

## Cómo se comprobó

- `pnpm --filter @renfe/shared test` → **155 pruebas** (incluye las 6 de `haSalido` y la compra
  bloqueada sin llamada de red).
- `pnpm --filter @renfe/api test -- src/modules/reservas/reservas.service.spec.ts` → **11 pruebas**
  (con `vi.setSystemTime`: 07:15 de hoy rechazado, 23:00 de hoy permitido).
- `pnpm --filter @renfe/mobile test` → 21 pruebas.
- `pnpm --filter @renfe/api lint|build`, `pnpm --filter @renfe/web lint` y
  `pnpm --filter @renfe/mobile lint` → en verde.

## Pendiente / límites

- No se ha probado en navegador ni en dispositivo: solo typecheck, pruebas y revisión del flujo.
- La BD no está disponible (sin `.env`, Supabase 54322 caído), así que la reserva real no se ha
  ejecutado; la lógica de la API se prueba con el cliente de BD simulado.
- Queda fuera el cambio/compra de un billete para un tren perdido (reglas de la tarifa); aquí solo se
  impide comprarlo después de la salida.

## Cambios en contratos

- Ninguno: mismo `POST /reservas`, ahora puede responder `400` «Ese tren ya ha salido».

## Ficheros tocados

- `backend/api/src/modules/reservas/reservas.service.ts` y `.spec.ts`
- `frontend/shared/api/salidas.ts`, `salidas.test.ts`, `cliente.ts`, `cliente.test.ts`,
  `comprar-transbordo.ts`
- `frontend/web/src/paginas/Resultados.tsx`, `frontend/web/src/paginas/reserva/Reserva.tsx`
- `frontend/mobile/src/app/resultados.tsx`, `pasajero.tsx`, `transbordo.tsx`
- `tickets/ticket-008.md`
