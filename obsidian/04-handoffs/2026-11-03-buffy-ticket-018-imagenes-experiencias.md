---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-018, experiencias, imagenes, commons, fallback]
estado: resuelto
---

# Handoff — Ticket 018: imágenes en Experiencias

## Por qué falla

Las páginas y tarjetas de `contenido/inspirate/experiencias.ts` y los índices no llevan `imagen` ni
`autor`. `PaginaContenido` cae entonces en `fotoDeRuta`, que solo reconocía ciudades, rutas,
estaciones y núcleos. Los slugs de Experiencias (`fallas`, `carreras-y-maratones`,
`48-horas-en-alicante`…) no coincidían con ninguna clave del catálogo, así que `Foto` recibía
`undefined` y pintaba siempre el relleno ilustrado.

## Qué se cambió

- `shared/contenido/imagenes.ts`: mapa `fotosExperiencias` con claves **existentes** de `fotos`
  (Wikimedia Commons, con autor/licencia). No se añaden archivos ni URLs nuevas.
- `fotoDeExperiencia`: primero busca una ciudad dentro del slug (feria-malaga, planes-…-gijon,
  48-horas-en-alicante), después una foto de categoría (carreras → València, festivales → Barcelona,
  etc.) y, si no hay nada, usa Madrid como imagen aprobada de respaldo. La portada `/inspirate/experiencias`
  también recibe foto.
- Se mantiene el componente `Foto`: `srcset` 480/800/1280, `alt` «Imagen de …», crédito de Commons y
  `onError` → relleno de la marca.

## Cómo se comprobó

- `pnpm --filter @renfe/shared test` → **168 pruebas** (nuevas de Experiencias: portada, categoría,
  evento con ciudad, evento sin ciudad y ruta desconocida).
- `pnpm --filter @renfe/shared lint` y `pnpm --filter @renfe/web lint` en verde.
- Chrome headless en `/inspirate/experiencias`: **31 tarjetas, 31 con `<img>`**, sin rellenos; la
  primera usa `Special:FilePath/Madrid_(38624991251).jpg` con `srcset` y alt «Imagen de Ofertas y
  Promociones»; la cabecera también tiene foto.
- Se disparó `error` en la primera imagen: quedan 30 imágenes y aparece
  `foto foto--relleno foto--inspirate tarjeta__foto`, sin icono roto.

## Pendiente / límites

- Las rutas sin ciudad usan una foto representativa de su categoría, no una imagen específica del
  evento. Es una decisión conservadora para no inventar recursos ni licencias; si producto quiere
  fotos propias por evento, hay que añadirlas al catálogo con su crédito.
- La comprobación visual es de DOM/atributos y fallback, no de que Commons responda siempre; si la
  red falla, el componente muestra el relleno previsto.

## Ficheros tocados

- `frontend/shared/contenido/imagenes.ts`
- `frontend/shared/contenido/imagenes.test.ts`
- `tickets/ticket-018.md`
