# Ticket 001 — Enviar el Bearer token al pagar desde móvil

- **Prioridad:** P0
- **Área:** `frontend/mobile`, `frontend/shared`, `backend/api`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

Al pagar desde móvil, la solicitud llega sin el token Bearer y la API rechaza la operación.

## Criterios de aceptación

- Reproducir el flujo en móvil e identificar la llamada exacta que falla.
- Las solicitudes protegidas incluyen el access token de la sesión actual en `Authorization: Bearer …`.
- Sin sesión o con token caducado, la app informa del problema y no simula que el pago se completó.
- No se introduce un token fijo, seudotoken ni secreto en código o variables públicas.
- Añadir una prueba que compruebe el encabezado autenticado y el caso sin sesión.
- Respetar el contrato de autenticación del vault y el comportamiento simulado existente.

## Verificación

Ejecutar pruebas de `shared` y móvil; probar con una sesión válida y otra ausente/caducada.
