# Ticket 011 — Persistir la tarifa seleccionada durante la compra

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`
- **Estado:** Arreglado
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

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** en el flujo directo la tarifa ya viajaba en la URL, pero en **transbordo** la app la recibía
y **no la enviaba** (se cobraba básico); ambos clientes la resolvían con `find` y aceptaban cualquier
texto como básico; y el estado de la app no se sincronizaba si cambiaba el `?tarifa=`.

**Arreglo:**

- `resolverTarifa` compartido valida solo los ids del contrato y cae al básico con etiquetas o valores
  inválidos; `nombreDeTarifa` para mostrarla.
- Web (`Reserva`, `ReservaTransbordo`) y app (`pasajero`, `transbordo`) lo usan; el transbordo envía la
  tarifa y la aplica al precio; el resumen de la app muestra la tarifa y el estado se sincroniza con la
  URL.
- 6 pruebas nuevas del resolutor (cada tarifa, etiqueta, id inventado, vacío y nombre). Total: 167
  shared; typecheck de shared, web y mobile en verde.

**Pendiente:** no se ha completado una compra en navegador/dispositivo. La disponibilidad por clase no
se modela: todas las tarifas se ofrecen siempre. Detalles en
[[2026-11-03-buffy-ticket-011-tarifa-persistente]].
