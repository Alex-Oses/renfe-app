# Ticket 007 — Fundamentar las respuestas de rutas del chatbot

- **Prioridad:** P1
- **Área:** `backend/api` chatbot y datos GTFS
- **Estado:** Pendiente de reproducción
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
