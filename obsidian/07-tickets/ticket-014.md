# Ticket 014 — Alinear el buscador del estado del tren

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

En `gestiona/tus-reservas/estado-de-tu-tren`, el campo de búsqueda aparece algo más abajo y rompe la alineación visual.

## Criterios de aceptación

- Reproducir la ruta en los tamaños de pantalla soportados y localizar qué regla causa el desplazamiento.
- Alinear buscador, etiqueta y controles con el sistema de espaciado/tokens existente.
- No cambiar el comportamiento, tamaño táctil ni foco del campo.
- Añadir o actualizar una prueba visual si el proyecto ya dispone de ella; en otro caso, incluir capturas de verificación.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el formulario usa `align-items: start` y el botón `align-self: end`. Como el campo incluye la
línea de ayuda, el botón se alineaba con el fondo de esa línea y quedaba 21 px por debajo del input
(medido: input 504–551, botón 522–572 a 1280×900). En móvil el formulario se apila y no había solape.

**Arreglo:** `Campo` marca `herr__campo--ayuda` cuando hay ayuda y, desde 40 rem, el botón compensa esa
línea con `margin-bottom: 1.25rem`; queda en 502–552 frente al input 504–551. En apilado no se aplica y
se mantienen gap, tamaño táctil y foco.

**Comprobación:** capturas antes/después de escritorio y móvil en `obsidian/assets/`; `pnpm --filter
@renfe/web lint` y las 34 pruebas de web en verde. Detalles en
[[2026-11-03-buffy-ticket-014-buscador-estado-tren]].
