# Ticket 008 — Impedir la compra de trenes ya salidos

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`, `backend/api` si es necesario
- **Estado:** Pendiente de reproducción
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
