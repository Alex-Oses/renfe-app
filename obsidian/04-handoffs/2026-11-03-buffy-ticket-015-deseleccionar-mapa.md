---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-015, mapa, leaflet, seleccion, web]
estado: resuelto
---

# Handoff — Ticket 015: deseleccionar un tren al pulsar el mapa vacío

## Por qué falla

No había ningún manejador del clic en el fondo del mapa: la única forma de cerrar el detalle era el
botón «Cerrar». Además, el clic de un marcador podía propagarse al mapa y comportarse como un clic de
fondo.

## Qué se cambió

- `Mapa.tsx`: `ClicFondo` usa `useMapEvents({ click })` y solo se monta cuando hay un tren seleccionado.
  Al pulsar el fondo se llama a `elegir(null)`, que limpia `?tren=` y cierra el detalle. El botón
  «Cerrar» reutiliza la misma acción.
- `CapaTrenes.tsx`: el marcador se crea con `bubblingMouseEvents: false` y su `click` hace
  `L.DomEvent.stopPropagation(e.originalEvent)` antes de seleccionar. Así un clic en un tren no se
  interpreta también como fondo.
- `mapa/seleccion.ts`: regla pura `seleccionTrasClic` (`tren` → id, `fondo` → `null`), con pruebas de
  seleccionar, cerrar y cambiar de tren.

## Cómo se comprobó

- `pnpm --filter @renfe/web test` → **37 pruebas** en verde (3 nuevas de selección).
- `pnpm --filter @renfe/web lint` → en verde.
- Chrome headless contra Vite, 1280×900, con 30 marcadores simulados:
  - clic en el primer marcador → `/mapa?tren=rt-0-235720`, detalle «AVE 2024», 1 marcador activo;
  - clic en otro → `/mapa?tren=rt-1-300610`, detalle «AVE 5456», sigue habiendo 1 activo;
  - clic en el control de zoom → la selección se conserva;
  - clic en una zona vacía (`x=72, y=741`, contenedor del mapa) → `/mapa`, detalle cerrado y 0 activos.

## Pendiente / límites

- La prueba de navegador es manual/headless, no una suite E2E: el proyecto no tiene Playwright ni
  Testing Library de mapa. Las pruebas automáticas cubren la regla de selección, no el DOM de Leaflet.
- No se ha probado con un dedo real; el toque de Leaflet termina en el mismo evento `click` y el
  manejador no depende del tipo de puntero. Queda pendiente una pasada en dispositivo si se quiere
  cerrar también esa comprobación.
- Pulsar una parada o una estación del recorrido no está tratado explícitamente; si producto quiere
  que esos clics conserven la selección, habrá que parar su propagación igual que en los trenes.

## Ficheros tocados

- `frontend/web/src/paginas/Mapa.tsx`
- `frontend/web/src/paginas/mapa/CapaTrenes.tsx`
- `frontend/web/src/paginas/mapa/seleccion.ts` y `seleccion.test.ts`
- `tickets/ticket-015.md`
