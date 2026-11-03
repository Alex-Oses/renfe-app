# Ticket 011 — Persistir la tarifa seleccionada durante la compra

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

La selección de tarifa (Estándar, Elige, Confort o Premium) no parece reflejarse en la pestaña siguiente.

## Criterios de aceptación

- La tarifa elegida se conserva al avanzar y volver entre pasos de la reserva.
- El precio y las condiciones del resumen corresponden a la tarifa seleccionada.
- La API recibe el identificador de tarifa esperado por el contrato, no solo el texto de la etiqueta.
- Si una tarifa no está disponible, no puede seleccionarse y se explica el motivo.
- Añadir pruebas para cada tarifa disponible y navegación entre pasos.

## Verificación

Completar un flujo de compra en web y móvil y contrastar selección, petición y resumen.
