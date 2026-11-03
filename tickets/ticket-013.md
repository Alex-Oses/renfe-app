# Ticket 013 — Evitar que el buscador de `/lineas` quede tapado

- **Prioridad:** P2
- **Área:** `frontend/web`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

En `/lineas`, el buscador aparece por debajo del mensaje “Aún no tienes líneas” o de las tarjetas.

## Criterios de aceptación

- El buscador queda visible, accesible y utilizable por encima del contenido que filtra.
- Corregir la causa de layout/stacking (flujo, `z-index`, posicionamiento o contenedor) sin ocultar mensajes ni tarjetas.
- Verificar móvil estrecho, tablet y escritorio; no debe tapar controles ni interceptar clics.
- Mantener foco y navegación por teclado.

## Verificación

Adjuntar capturas antes/después en al menos un viewport móvil y uno de escritorio.
