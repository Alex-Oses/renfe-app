---
fecha: 2026-10-30
autor: Alex
area: api
para: todos
rama: fix/api-billetes-localizador-correo-precio
tags: [handoff, billetes, correo, precios]
estado: abierto
---

# Handoff — Localizador, correos y precios de los billetes

## Qué se hizo
- Nuevo `POST /reservas/:localizador/cancelar` (ver [[endpoints]]). La web consulta y anula con la API; admite el localizador con o sin `R-`.
- `CorreoService`: Resend si hay `RESEND_API_KEY`; si no, Mailpit (`MAILPIT_URL`, http://localhost:54324); si no, solo log. Se envía al comprar y al cancelar.
- Precio simulado por producto y distancia, igual en búsqueda y compra. Se muestra en el billete.
- `gtfs:vias` ya no filtra por `service`; tramos recalculados y subidos a Cloud.

## Qué queda
- Para correo real: `RESEND_API_KEY` y remitente verificado.
- Cancelar no libera la butaca (`billetes.asiento_id` es único): hace falta migración para revenderla.
- «Cambia tu billete» sigue simulado. La tarifa no se guarda: la penalización sale de la clase.
- Consultar por localizador exige sesión: solo se ven reservas propias.

## Ficheros tocados
`backend/api/src/common/{correo,simulado}`, `backend/api/src/modules/{reservas,trenes}`, `frontend/shared/api`, `frontend/web/src/{componentes/herramientas,paginas}`, `frontend/mobile/src/app/billete`.
