# Ticket 017 — Dar acciones distintas a los cuatro iconos del footer

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

Los cuatro botones con icono del footer parecen hacer lo mismo.

## Criterios de aceptación

- Inventariar el destino/acción actual de cada botón y reproducir si sus acciones son iguales.
- Cada botón lleva a una sección distinta y útil, o se elimina/reemplaza con aprobación de producto si no hay cuatro destinos válidos.
- Añadir nombre accesible/tooltip y estado activo cuando corresponda.
- Verificar navegación, historial atrás y presentación en móvil/desktop; no dejar botones decorativos sin acción.

## Pregunta de producto

Si el propósito de los cuatro iconos no se deduce de la navegación existente, confirmar con el responsable antes de asignar destinos nuevos.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Inventario:** los cuatro iconos de web y móvil (Vídeos, Fotos, Mensajes, Noticias) enlazaban todos
a `/ayuda/contacto` y se anunciaban como «canal simulado».

**Decisión:** no hay cuentas sociales reales, así que se reutilizan cuatro secciones existentes sin
inventar rutas: Viajar `/viajar`, Inspírate `/inspirate`, Gestiona `/gestiona` y Ayuda `/ayuda`.
Cada enlace tiene nombre accesible (y `title` en web); el bloque pasa a llamarse «Secciones
destacadas».

**Comprobación:** en Chrome los cuatro `href` son distintos y cada uno navega y vuelve con
`history.back()`; 39 pruebas de web y ambos typechecks en verde. Detalles en
[[2026-11-03-buffy-ticket-017-atajos-pie]].
