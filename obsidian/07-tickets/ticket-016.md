# Ticket 016 — Hacer clicable la tarjeta completa del billete

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Objetivo

Al pulsar cualquier zona de una tarjeta de billete, navegar al detalle correspondiente.

## Criterios de aceptación

- Toda la tarjeta tiene un único destino claro; se puede activar con teclado y lector de pantalla.
- Controles internos (menú, descargar, compartir u otros) conservan su acción y no disparan una navegación accidental.
- El destino incluye el identificador correcto y funciona con navegación atrás.
- Añadir prueba de navegación desde la tarjeta y de propagación de eventos en controles internos.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** en web solo los enlaces de viajero eran interactivos; el resto de la tarjeta era inerte. En
móvil solo lo eran las filas de viajero.

**Arreglo:** overlay `Link` que cubre la tarjeta web con etiqueta accesible y destino al primer billete
(`enlaceBillete`); los enlaces de viajero quedan por encima con su propio destino. En móvil la tarjeta
es `Pressable` y las filas paran la propagación.

**Comprobación:** 39 pruebas de web y ambos typechecks en verde. En Chrome, con una reserva simulada de
dos viajeros: tarjeta → `SIM-016-1`, atrás, teclado (Enter) → `SIM-016-1`, y fila del segundo viajero
→ `SIM-016-2`. Detalles en [[2026-11-03-buffy-ticket-016-tarjeta-billete]].
