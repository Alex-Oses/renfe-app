---
fecha: 2026-11-02
autor: Alex
area: frontend
para: Alex
rama: fix/mobile-web-responsive
pr: por abrir
tags: [handoff]
---

# Handoff — objetivos táctiles y responsive de la web

## Qué se hizo

- Enlaces del **pie** y del **cajón del menú** a 44 px de alto en móvil (antes ~20 px: no se podían
  pulsar con el dedo).
- Atajos y enlaces de la portada (`.ventaja a`, `.atajo li a`, `.atajo__chip`) a 44 px.
- `.marca` (logo) y `.parada__campo` (campos de parada) con `min-height: 44px`.
- Botones de **zoom de Leaflet** a 44×44 en móvil.
- Subidos de 0,65 a 0,75 rem los textos más pequeños (pie de foto y botón de píldora).

## Qué queda

- **La auditoría de desbordes a 360/390/768/1024/1366 px quedó a medias**: el agente que la hacía se
  paró. Estos cambios son los que ya estaban medidos y aplicados; falta pasar página por página
  (resultados, reserva, billetes, mapa) buscando scroll horizontal y tablas anchas.
- No se ha mirado la app móvil.

## Comprobado

- `pnpm -r lint` (tsc de web y móvil) en verde.
- No hay tests de CSS; la web compila.

## No comprobado

- No se ha abierto la web en un móvil real ni en DevTools con emulación a 390 px después del cambio.

## Ficheros tocados

- `frontend/web/src/estilos/base.css`
- `frontend/web/src/paginas/inicio/inicio.css`
- `frontend/web/src/paginas/mapa/mapa.css`
- `frontend/web/src/componentes/foto.css`
