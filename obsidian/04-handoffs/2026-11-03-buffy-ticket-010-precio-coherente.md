---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-010, precios, transbordos, web, mobile]
estado: resuelto
---

# Handoff — Ticket 010: precio coherente entre vista previa y asiento

## Por qué falla

Había dos precios distintos según la pantalla:

- La vista previa de tarifas aplica `precioViajero` (tarifa y descuento), pero el **mapa de asientos**
  de la web enseñaba `asiento.precio`, el precio **base** del asiento. Con Elige, la tarjeta decía
  50 € y el mapa 40 €.
- El transbordo enseñaba `opcion.precio * n` (suma base de los dos tramos) sin tarifa ni descuento.
  Peor: la compra **no enviaba** la tarifa/descuento elegidos. La app recibía `descuento` por la URL y
  lo ignoraba; la web no lo leía; el servidor cobraba básico/sin descuento. La vista previa y el cargo
  podían diferir.
- En las tarjetas de resultados el descuento tampoco se aplicaba a la vista previa.

La fuente de verdad sigue siendo el servidor: `/precios/calcular` y `POST /reservas` usan
`precioViajero`/`calcularDesglose`. No se ha creado ninguna fórmula nueva; se reutiliza la compartida.

## Qué se cambió

- `frontend/shared/api/comprar-transbordo.ts`: `precioOpcion(opcion, { tipos, tarifa, descuento })` suma
  un billete por tramo y viajero con `precioViajero`, igual que la API.
- `PasoAsientos` (web): recibe `tarifa` y `descuento` y muestra el precio por adulto ya ajustado
  («desde … por asiento»), no el base.
- `ReservaTransbordo` (web) y `transbordo` (app): leen `tarifa`/`descuento`/`ninos` de la URL,
  enseñan `precioOpcion(...)` y envían `tarifa`/`descuento` en `NuevaReserva`; antes el descuento se
  perdía al comprar.
- Vistas previas de tarifas (resultados web y app): aplican el descuento elegido.
- Pruebas: `precioOpcion` con tarifa y con descuento + niño (el caso de transbordo con descuento que
  pide el ticket) y las existentes de `precioViajero`/`calcularTotal`.

## Cómo se comprobó

- `pnpm --filter @renfe/shared test` → **161 pruebas** en verde.
- `pnpm --filter @renfe/shared lint`, `pnpm --filter @renfe/web lint` y
  `pnpm --filter @renfe/mobile lint` → en verde.

## Pendiente / límites

- No se ha comparado en navegador ni dispositivo: solo typecheck y pruebas de las fórmulas.
- La API no ha cambiado; su cálculo ya era la referencia y está cubierto por sus pruebas.
- Si el precio cambiara por datos (p. ej., una nueva consulta al servidor devuelve otro importe), hoy
  se recalcula el desglose; no hay un aviso explícito de «el precio ha cambiado, confirma». El precio
  es determinista por trayecto, así que no ocurre en el flujo actual.

## Cambios en contratos

- Ninguno.

## Ficheros tocados

- `frontend/shared/api/comprar-transbordo.ts` y `.test.ts`
- `frontend/web/src/paginas/reserva/PasoAsientos.tsx`, `Reserva.tsx`, `ReservaTransbordo.tsx`,
  `frontend/web/src/paginas/Resultados.tsx`
- `frontend/mobile/src/app/resultados.tsx`, `transbordo.tsx`
- `tickets/ticket-010.md`
