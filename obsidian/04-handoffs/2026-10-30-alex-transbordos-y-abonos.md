---
fecha: 2026-10-30
autor: Alex
area: frontend
para: todos
rama: feat/mobile-transbordos-y-tarjetas-abono
tags: [handoff, transbordos, abonos, buscador]
estado: abierto
---

# Handoff — Transbordos, buscador por pasos y tarjetas de abono (web)

## Qué se hizo
- `GET /trenes/transbordos` (ver [[endpoints]]): un transbordo en la misma estación, 15 min a 3 h de espera.
- Buscador: el destino se habilita al elegir el origen. Sin directos, Resultados ofrece transbordos y `/transbordo` compra los dos tramos; si falla el segundo, cancela el primero.
- Mis billetes une los dos tramos en una tarjeta y muestra los abonos como tarjetas por tipo.

## Qué queda
- La app móvil no tiene nada de esto.
- No se guarda un id de transbordo: se deduce de las reservas (compradas con menos de 15 min y enlazadas por estación).
- Cambios entre estaciones de una misma ciudad (Atocha y Chamartín) no se ofrecen.
- La compra con transbordo no aplica tarifa, descuento ni niños; usa el precio base.

## Ficheros tocados
`backend/api/src/modules/trenes`, `frontend/shared/api`, `frontend/web/src/componentes/{Buscador,Desplegable}.tsx`, `frontend/web/src/paginas/{Resultados,MisBilletes}.tsx`, `frontend/web/src/paginas/billetes`, `frontend/web/src/paginas/reserva/ReservaTransbordo.tsx`.
