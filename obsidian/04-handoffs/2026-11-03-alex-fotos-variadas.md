---
fecha: 2026-11-03
autor: Alex
area: frontend
para: todos
rama: feat/mobile-fotos-variadas-ciudades
pr: "#140"
tags: [handoff]
---

# Handoff — Fotos de ciudad que varían

## Qué se hizo

- `scripts/fotos-ciudades.mjs` genera `frontend/shared/contenido/imagenes-extra.ts`: hasta 4 fotos más por ciudad de Wikimedia Commons, sacadas de la categoría de la foto principal (o de la búsqueda si no hay). Solo JPG horizontales de 1600 px o más, con licencia libre, y comprobadas con `Special:FilePath`.
- Revisadas a ojo: quedan 318 fotos en 94 de 97 ciudades. Fuera cuadros antiguos, actos con políticos, aviones, carteles, comida y una rota (404). El filtro del script ya descarta esos casos.
- `fotoDe(slug)` elige la variante con una semilla por carga de página: cambia entre visitas y no parpadea al repintar. La usan `fotoDeRuta` (web y móvil) y la portada de la web.

## Qué queda

- Si se añaden ciudades a `fotos`, lanzar `node scripts/fotos-ciudades.mjs` y revisar el resultado a ojo antes de commitear.

## Bloqueos / preguntas para otros

Ninguno.

## Cambios en contratos

Ninguno.

## Ficheros tocados

`scripts/fotos-ciudades.mjs`, `frontend/shared/contenido/imagenes.ts`, `imagenes-extra.ts`, `imagenes.test.ts`, `frontend/web/src/paginas/Inicio.tsx`.
