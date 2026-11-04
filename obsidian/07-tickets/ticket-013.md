# Ticket 013 — Evitar que el buscador de `/lineas` quede tapado

- **Prioridad:** P2
- **Área:** `frontend/web`
- **Estado:** Arreglado
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

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el formulario y el estado vacío/tarjetas crean contextos de apilado propios por el
`backdrop-filter` de `.cristal`. El panel de sugerencias (`z-index: 20`) quedaba atrapado en el contexto
del formulario y el hermano posterior se pintaba encima, aunque el formulario fuera antes en el DOM.

Reproducido en Chrome headless (1280×900): con «Madrid» escrito, el panel llegaba hasta `y=500` y el
vacío empezaba en `y=462`; `elementFromPoint` en el solape devolvía `lineas__vacio`, no una opción.

**Arreglo:** `.lineas__form` pasa a `position: relative; z-index: 1`, por encima del contenido que
filtra y por debajo de cabecera (40) y barra inferior (50), sin cambiar DOM, foco ni teclado.

**Comprobación:** capturas antes/después en escritorio y móvil en `obsidian/assets/`; tras el cambio el
mismo punto devuelve `opcion__nombre` y el panel recibe el clic. `pnpm --filter @renfe/web lint` en
verde. Detalles en [[2026-11-03-buffy-ticket-013-buscador-tapado]].
