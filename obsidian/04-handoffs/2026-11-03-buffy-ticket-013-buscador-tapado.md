---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-013, lineas, css, stacking, accesibilidad]
estado: resuelto
---

# Handoff — Ticket 013: el buscador de `/lineas` queda tapado

## Por qué falla

El formulario va **antes** que el estado vacío y las tarjetas en el DOM, pero `.lineas__form.cristal` y
`.lineas__vacio.cristal` crean cada uno un **contexto de apilado** por el `backdrop-filter` de `.cristal`.
El panel de sugerencias (`.panel-cristal`, `z-index: 20`) queda atrapado dentro del contexto del
formulario; el hermano posterior (vacío o lista) se pinta encima. No es un problema de orden ni de foco:
es de stacking.

Reproducido en Chrome headless a 1280×900 con el desplegable de origen abierto y «Madrid» escrito:

- Panel: `top 402`, `bottom 500`.
- Estado vacío: `top 462`.
- En el punto solapado (327, 470), `elementFromPoint` devolvía `lineas__vacio cristal`, no el panel.
- En móvil (390×844) no había solape porque el formulario es más alto; también se comprobó.

Antes (solo se ve una opción, el resto queda bajo el aviso):

![[ticket-013-antes-escritorio.png]]

Después (las dos opciones quedan por encima del aviso):

![[ticket-013-despues-escritorio.png]]

## Qué se cambió

En `lineas.css`, el formulario pasa a tener contexto propio por encima del contenido que filtra:

```css
.lineas__form {
  position: relative;
  z-index: 1;
  ...
}
```

- `1` queda por encima de las tarjetas/vacío (contextos en `auto`) y por debajo de la cabecera
  (`--z-cabecera: 40`) y la barra inferior (`--z-barra: 50`).
- No se cambia el DOM, el orden de tabulación ni el componente `Desplegable`; el foco y las flechas
  siguen igual.
- En el mismo punto solapado, tras el cambio `elementFromPoint` devuelve `opcion__nombre` («Madrid-
  Chamartín-Clara Campoamor»), así que el panel recibe el clic.

## Cómo se comprobó

- Chrome headless real contra Vite, 1280×900 y 390×844, teclado/foco en el combobox y consulta de
  `elementFromPoint` en el solape.
- Capturas: `obsidian/assets/ticket-013-{antes,despues}-{escritorio,movil}.png`.
- `pnpm --filter @renfe/web lint` en verde.

## Pendiente / límites

- Es una comprobación visual y de hit-testing, no una suite E2E permanente; el proyecto no tiene
  Playwright/Puppeteer instalado y no se ha añadido una dependencia por este ticket.
- En móvil el panel sigue pudiendo tapar el botón «Añadir línea» mientras está abierto (es un
  desplegable superpuesto normal); al elegir una opción se cierra y el botón vuelve a estar disponible.

## Ficheros tocados

- `frontend/web/src/paginas/lineas/lineas.css`
- `tickets/ticket-013.md`
- `obsidian/assets/ticket-013-*.png`
