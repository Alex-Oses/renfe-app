---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-019, tren, responsive, reduced-motion, orientacion]
estado: resuelto
---

# Handoff — Ticket 019: tren responsive

## Por qué falla

- En web, `.entrada__tren` medía `max(115vw, 820px)`. A 390 px de ancho, con `right: 3vw`, el
  elemento empezaba en `left: -441 px`: solo quedaban ~11 px visibles del morro. En pantallas
  pequeñas el tren parecía no existir.
- `@media (max-height: 660px)` (móvil tumbado) y `prefers-reduced-motion: reduce` hacían
  `display: none` sobre el tren, el lema y el aviso; no quedaba una escena estática.
- En la app móvil, `TrenSvg` y el contenedor usaban un ancho fijo de 760 px y `left: -330`. En
  teléfonos estrechos el morro se recortaba y no se adaptaba a la ventana.

## Qué se cambió

- Web: ancho `clamp(360px, 115vw, 1200px)`, de modo que el tren entra completo en el primer
  tramo y sigue saliendo al hacer scroll. En horizontal bajo y con movimiento reducido pasa a
  flujo normal, con ancho `min(100%, 620/640px)`, `transform: none` y sin estela; el cartel sigue
  siendo comprensible y el buscador queda visible.
- Se oculta `.entrada__estela` en los estados estáticos: era la única causa del desborde de 58 px
  al rotar a 844×390.
- Mobile: `useWindowDimensions` calcula `anchoTren` (500–760 px) y `izquierdaTren` para alinear el
  morro dentro de la portada; se pasa el mismo ancho a `TrenSvg`. La animación de entrada se
  mantiene.

## Cómo se comprobó

- `pnpm --filter @renfe/web lint` y `pnpm --filter @renfe/mobile lint` → ambos en verde.
- Chrome/CDP, sin overflow horizontal (`scrollWidth <= innerWidth`):

| Caso | Tren | Resultado |
| --- | --- | --- |
| 390×844 | 449 px, `left -70`, `right 378` | visible, overflow 0 |
| 768×1024 | 883 px, `left -153`, `right 730` | visible, overflow 0 |
| 1440×900 | 1200 px, `left 182`, `right 1382` | visible, overflow 0 |
| reducido 390×844 | 390 px, `transform: none` | tren + lema estáticos, panel visible |
| reducido 1440×900 | 640 px, centrado | escena estática, panel visible |
| rotación 390×844 → 844×390 | 620 px, `transform: none` | visible, overflow 0 |
| resize 390→1440→390 | 1200 → 449 px | vuelve a ser visible |

- Al final del tramo animado el tren sale de pantalla por diseño, pero el panel queda con
  `opacity: 1` y `pointer-events: auto`; no hay desbordes.
- Capturas: [[ticket-019-390.png]], [[ticket-019-768.png]], [[ticket-019-1440.png]],
  [[ticket-019-reducido.png]], [[ticket-019-horizontal.png]].

## Pendiente / límites

- No hay emulador ni dispositivo Android/iOS disponible: el cambio móvil está validado por
  TypeScript (`tsc --noEmit`) y revisión de la fórmula, **no** con captura real de la app.
- La verificación visual web cubre 390, 768 y 1440 px, reduced-motion y 844×390; no se añadió una
  suite visual automatizada porque el proyecto no la tiene.

## Ficheros tocados

- `frontend/web/src/paginas/inicio/inicio.css`
- `frontend/mobile/src/app/(tabs)/index.tsx`
- `tickets/ticket-019.md`
