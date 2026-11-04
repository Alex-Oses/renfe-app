---
fecha: 2026-11-03
autor: Buffy (agente)
area: backend
para: alex, ruben
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-009, transbordos, gtfs, web, mobile]
estado: resuelto
---

# Handoff — Ticket 009: transbordos viables y destinos con conexión

## Por qué falla

- **La opción elegida no se encontraba.** `Resultados` (web y app) guarda en la URL la
  `claveTramo` (`tipo|número|salida`), pero `ReservaTransbordo` y `transbordo` buscaban por
  `tramos[].id` (que lleva `feed:tripId:fecha`). Aunque el transbordo fuera viable, al abrirlo salía
  «Esa combinación ya no está disponible». `buscarOpcion` ya existía para esto y no se usaba.
- **La regla de margen solo vivía en SQL.** La consulta exige 15 min en la misma estación, 30 al
  cambiar de estación en la misma ciudad y menos de 3 h, pero no había ninguna comprobación después
  ni prueba de conexión imposible: un cambio en el SQL o en los datos no lo detectaba nadie.
- **La espera se calculaba con `minutosDe`** (hora del día), en vez de con los ISO; al cruzar la
  medianoche el cálculo es frágil.

El margen **sí está definido en el contrato** (`endpoints.md`: 15 / 30 min y 3 h), así que no se ha
inventado ninguno.

## Qué se cambió

- `backend/api/src/modules/trenes/transbordos.ts` (nuevo): `esperaSuficiente(llegada, salida,
  cambioEstacion)` con los márgenes del contrato, comparando instantes ISO (cambio de día incluido).
- `trenes.service.ts`: calcula `esperaMin`/`duracionMin` con los ISO y **filtra** las opciones con
  `esperaSuficiente` antes de devolverlas (defensa en profundidad sobre el SQL).
- `frontend/shared/api/transbordos.ts` (nuevo): `transbordoViable` con los mismos márgenes;
  `buscarTransbordos` descarta opciones que no los cumplan.
- `ReservaTransbordo` (web) y `transbordo` (app) buscan la opción con `buscarOpcion`, no por `id`.
- Pruebas: 5 de `esperaSuficiente` (15/14, 30/29, 3 h, cambio de día, constantes), una de servicio
  que descarta 10 min y 181 min y conserva 15, y pruebas compartidas de `buscarOpcion` y
  `transbordoViable`.

## Cómo se comprobó

- `pnpm --filter @renfe/api test -- src/modules/trenes/transbordos.spec.ts
  src/modules/trenes/trenes.service.spec.ts` → **27 pruebas** en verde.
- `pnpm --filter @renfe/shared test` → **159 pruebas** en verde.
- `pnpm --filter @renfe/api lint|build`, `pnpm --filter @renfe/web lint` y
  `pnpm --filter @renfe/mobile lint` → en verde.

## Pendiente / límites

- Sin BD GTFS disponible (sin `.env`, Supabase 54322 caído) no se han lanzado las consultas reales;
  la regla se prueba con filas simuladas y la defensa posterior al SQL.
- El margen de 15/30 min es el del contrato. Si producto quiere otro, se cambia en los dos ficheros
  de constantes (`backend/.../transbordos.ts` y `frontend/shared/api/transbordos.ts`) y en
  `endpoints.md`.
- Queda fuera avisar del andén/tiempo de caminata entre estaciones: hoy solo se valida el margen.

## Cambios en contratos

- Ninguno: `GET /trenes/transbordos` mantiene la forma; puede devolver menos opciones (las inviables).

## Ficheros tocados

- `backend/api/src/modules/trenes/transbordos.ts`, `transbordos.spec.ts`, `trenes.service.ts`,
  `trenes.service.spec.ts`
- `frontend/shared/api/transbordos.ts`, `cliente.ts`, `comprar-transbordo.test.ts`
- `frontend/web/src/paginas/reserva/ReservaTransbordo.tsx`
- `frontend/mobile/src/app/transbordo.tsx`
- `tickets/ticket-009.md`
