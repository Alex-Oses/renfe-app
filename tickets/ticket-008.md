# Ticket 008 — Impedir la compra de trenes ya salidos

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`, `backend/api` si es necesario
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

Se pueden seleccionar trenes cuya salida ya ha pasado.

## Criterios de aceptación

- Una salida pasada no se puede seleccionar ni reservar, aunque se abra desde enlace directo o se manipule el cliente.
- Comparar instantes con zona horaria coherente con el horario de servicio; cubrir cambio de día y viajes nocturnos.
- No ocultar un tren futuro por diferencias de zona horaria o por redondeos de minutos.
- La API valida la misma regla cuando se confirma una reserva, sin confiar solo en la UI.
- Añadir pruebas con tren pasado, salida inminente/futura y cambio de fecha.

## Verificación

Fijar el reloj en pruebas para evitar resultados dependientes del momento de ejecución.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** la API solo comparaba la fecha (`fecha < hoyMadrid()`); un tren de las 07:15 se podía
comprar a las 20:00 del mismo día. El cliente compartido no miraba la salida, así que el enlace
directo y el modo simulado tampoco la bloqueaban.

**Arreglo:**

- `haSalido(salida, ahora)` en `@renfe/shared/api/salidas` compara el instante ISO con offset
  (cambio de día y nocturnos incluidos; una hora inválida no oculta el tren).
- La API valida en `crearEn` con `intervaloAIso(fecha, sale) <= Date.now()`, antes de escribir, y
  cubre también los dos tramos del transbordo (`400` «Ese tren ya ha salido»).
- `comprarReserva`/`comprarDosTramos` rechazan el tren pasado antes de la red (también en simulado).
- Web (`Resultados`, `Reserva`) y app (`resultados`, `pasajero`, `transbordo`) marcan «Ya ha salido»
  y no dejan elegir ni llegar al pago; el enlace directo muestra el aviso.
- Pruebas: 6 de `haSalido`, compra compartida sin red, y reserva de API con reloj fijado (pasado
  rechazado, 23:00 del mismo día aceptado). Total: 155 shared, 11 reservas, 21 mobile; lint y build en
  verde.

**Pendiente:** no se ha probado en navegador/dispositivo ni contra la BD real (no disponible).
Detalles en [[2026-11-03-buffy-ticket-008-trenes-salidos]].
