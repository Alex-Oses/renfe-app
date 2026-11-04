---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-014, estado-tren, css, alineacion, web]
estado: resuelto
---

# Handoff — Ticket 014: buscador del estado del tren desalineado

## Por qué falla

`.herr__form` es un flex con `align-items: start` y el botón lleva `align-self: end`. En este widget el
campo incluye una línea de ayuda (`small`), así que la altura del campo es etiqueta + input + ayuda. El
botón se alinea con el **fondo del campo**, no con el input, y baja una línea de ayuda.

Medido en Chrome headless a 1280×900 antes del cambio:

| Elemento | Arriba | Abajo |
| --- | ---: | ---: |
| Etiqueta | 480 | 500 |
| Input | 504 | 551 |
| Ayuda | 555 | 572 |
| Botón | 522 | 572 |

El botón quedaba 21 px por debajo del input. En móvil (390×844) el formulario se apila y no había
desalineación; se comprobó que el cambio no mueve ese apilado.

Antes:

![[ticket-014-antes-escritorio.png]]

Después:

![[ticket-014-despues-escritorio.png]]

## Qué se cambió

- `Campo` añade `herr__campo--ayuda` solo cuando hay texto de ayuda (no cambia el DOM accesible ni el
  `aria-describedby`).
- En `herramientas.css`, a partir de 40 rem y solo para formularios con ese campo, el botón lleva
  `margin-bottom: 1.25rem` para compensar la línea de ayuda. Sigue con `align-self: end`, pero ahora su
  centro coincide con el input.
- En apilado (móvil) no se aplica: conserva el gap de 12 px y el tamaño táctil.

Después de la compensación: input 504–551, botón 502–552 (1 px de diferencia por la altura del botón).

## Cómo se comprobó

- Chrome headless real contra Vite, 1280×900 y 390×844, midiendo etiqueta/input/ayuda/botón.
- Capturas en `obsidian/assets/ticket-014-{antes,despues}-{escritorio,movil}.png`.
- `pnpm --filter @renfe/web lint` en verde y `pnpm --filter @renfe/web test` → **34 pruebas** en verde.

## Pendiente / límites

- El proyecto no tiene suite de regresión visual; las capturas son la comprobación de este ticket.
- La compensación asume una línea de ayuda. Si el texto de ayuda pasa a dos líneas (traducciones o
  anchos muy estrechos), habrá que revisar el margen con una captura.

## Ficheros tocados

- `frontend/web/src/componentes/herramientas/comun.tsx`
- `frontend/web/src/componentes/herramientas/herramientas.css`
- `tickets/ticket-014.md`
- `obsidian/assets/ticket-014-*.png`
