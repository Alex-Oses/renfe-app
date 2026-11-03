# Ticket 007 — Fundamentar las respuestas de rutas del chatbot

- **Prioridad:** P1
- **Área:** `backend/api` chatbot y datos GTFS
- **Estado:** Arreglado; falta verificarlo con la BD GTFS (no disponible en esta máquina)
- **Dependencias:** Ninguna

## Problema reportado

Para Tarragona–Madrid, el chatbot afirma que hay trenes, pero las tarjetas mostradas corresponden a Barcelona–Madrid. Galicia–Madrid funcionó correctamente en una prueba distinta.

## Criterios de aceptación

- Reproducir consultas para Tarragona–Madrid, Galicia–Madrid y un par sin servicio en los datos disponibles.
- La afirmación y las tarjetas de tren se generan con los mismos resultados verificados de estaciones/rutas GTFS; no se sustituyen silenciosamente origen o destino.
- Distinguir ruta directa, ruta con transbordos y ausencia de ruta. Indicar estaciones y horarios reales del feed disponible.
- Si los datos no permiten resolver la ruta, decirlo claramente en vez de inventar servicios.
- Mantener el formato de tarjetas y enlaces que usa la app y añadir pruebas de los casos anteriores.

## Verificación

Ejecutar pruebas de chatbot y revisar que origen/destino de cada tarjeta coinciden con la consulta.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** la expansión por ciudad rellenaba las estaciones sin `ciudad` con la de la estación más
cercana **sin límite de distancia**. Los AV/LD se importan con `ciudad: null`, así que una estación de
Tarragona podía heredar Barcelona y la búsqueda devolvía trenes Barcelona–Madrid. A eso se sumaba que
las tarjetas se acumulaban entre reintentos y que no había transbordos ni marca de «sin servicio».

**Arreglo:**

- La ciudad inferida solo vale a menos de ~5,5 km (0.05° lat / 0.06° lon).
- `buscar_trenes` devuelve `ruta` (`directa`/`con_transbordo`/`sin_servicio`) y `consulta` con el
  origen/destino/fecha pedidos; si no hay directos busca transbordos con esa misma consulta.
- Solo se conservan las tarjetas de la última búsqueda.
- El prompt prohíbe cambiar origen/destino o presentar otra ciudad, y pide decir que no hay ruta cuando
  corresponde.
- 4 pruebas nuevas (directa, transbordo, sin servicio, tarjetas no mezcladas): 36 en verde con las de
  trenes; `lint` y `build` en verde.

**Pendiente:** sin BD disponible (sin `.env`, Supabase en 54322 caído y Docker sin daemon) no se han
podido ejecutar las consultas reales Tarragona–Madrid, Galicia–Madrid ni el par sin servicio. Comandos
y qué mirar en [[2026-11-03-buffy-ticket-007-rutas-chatbot]].
