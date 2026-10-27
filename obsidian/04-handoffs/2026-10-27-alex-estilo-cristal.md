---
fecha: 2026-10-27
autor: Alex (con Claude Code)
area: mobile
para: todos
rama: feat/mobile-estilo-cristal
pr: (ver PR de esta rama)
tags: [handoff]
---

# Handoff — Estilo cristal líquido en la web

## Qué se hizo
- Nueva capa `frontend/web/src/estilos/cristal-liquido.css` importada después de `base.css`:
  - fondo con manchas de color fijas;
  - tarjetas, buscador, cabecera, paneles y desplegables translúcidos con desenfoque;
  - botones en píldora con brillo y chips y campos de cristal.
- Accesibilidad: con "reducir transparencia", "más contraste" o un navegador sin `backdrop-filter`, las superficies pasan a opacas.
- Revisado con capturas en móvil y escritorio: inicio, resultados, reserva, acceso, billetes y mapa. Sin desbordamiento horizontal.

## Qué queda
- Probar en un iPhone real (Safari) y en Android: el desenfoque es lo que más cuesta a móviles antiguos.

## Bloqueos / preguntas para otros
- Ninguno. No toca la lógica ni la API.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `frontend/web/src/estilos/cristal-liquido.css`, `frontend/web/src/main.tsx`
- `obsidian/05-areas/frontend.md`, este handoff.
