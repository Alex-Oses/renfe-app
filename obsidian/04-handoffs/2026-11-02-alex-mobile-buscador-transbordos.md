---
fecha: 2026-11-02
autor: Alex
area: frontend
para: Alex
rama: feat/mobile-buscador-y-transbordos
pr:
tags: [handoff]
---

# Handoff — App: buscador por pasos y transbordos

## Qué se hizo
- `Buscador` de la app por pasos, como la web: sin estaciones por defecto, el destino está deshabilitado
  («Elige antes el origen») hasta elegir origen, y al elegir origen se abre sola la hoja de destino.
- `resultados`: ya tenía filtros por tipo y franja, orden, días con precio desde y tarifas por tren.
  Se añade la sección «No hay trenes directos: opciones con transbordo» con `buscarTransbordos`.
- Pantalla nueva `transbordo` (en `_layout`): datos de los viajeros y compra de los dos tramos con el
  mismo flujo que `/pasajero` (reserva + intento + pago simulado). Si falla el segundo, se cancela el primero.
- Regla compartida `comprarDosTramos` en `@renfe/shared/api/comprar-transbordo` con test (vitest).
- Ver [[2026-10-30-alex-transbordos-y-abonos]].

## Qué queda
- La web (`ReservaTransbordo.tsx`) repite la regla a mano; podría usar `comprarDosTramos`.
- En simulado `buscarTransbordos` devuelve `[]`: la sección y la compra solo se ven con la API.
  No se ha probado una compra de transbordo de punta a punta.
- La pantalla de transbordo compra en tarifa básica sin elegir asiento (como la web).

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
- Ninguno (usa GET /trenes/transbordos de [[endpoints]] tal cual).

## Ficheros tocados
- `frontend/mobile/src/components/Buscador.tsx`
- `frontend/mobile/src/app/resultados.tsx`, `transbordo.tsx`, `_layout.tsx`
- `frontend/shared/api/comprar-transbordo.ts` y `.test.ts`
