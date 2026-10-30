---
fecha: 2026-10-26
autor: Alex
area: frontend
para: todos
rama: feat/mobile-web-completa
pr: (ver PR de esta rama)
tags: [handoff, frontend, web]
estado: obsoleto
---

# Handoff — Web completa con datos simulados

## Qué se hizo
- Landing con un tren que pasa de largo al hacer scroll y deja ver el buscador.
- Buscador con desplegables de estaciones y pasajeros con efecto cristal.
- Resultados con filtros, orden y esqueletos de carga.
- Reserva por pasos: asientos por coche, viajeros, pago simulado sin datos de tarjeta, y confirmación con localizador.
- Mis billetes y billete con QR imprimible.
- Mi cuenta: registro, login con contraseña y login facial en el navegador con Human, enviando solo el embedding ([[ADR-002-web-primero-vercel-render]]).
- Mapa en tiempo real con Leaflet y OpenStreetMap: 26 trenes simulados que se mueven, filtro, seguir un tren y enlace directo `/mapa?tren=`.
- Todo pasa por `frontend/web/src/api/cliente.ts`: con `VITE_API_URL` vacía usa los simulados; con la URL de Render llama a la API.

## Qué queda
- Rubén: revisar los endpoints nuevos propuestos en [[endpoints]] (`GET /trenes/:id`, `GET /tiempo-real/trenes`) y las formas de `tipos.ts`.
- Kevin: calibrar el umbral facial (0.6) y la detección de vida con caras reales. Pasar el pago a Stripe Elements en modo test.
- Marina: `GET /tiempo-real/trenes` saldrá del worker GTFS-RT. El mapeo de campos está en la cabecera de `simulado-tiempo-real.ts`.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
- [[endpoints]]: dos endpoints propuestos y la referencia a los tipos de la web.

## Ficheros tocados
- `frontend/web/src/**`, `obsidian/02-contratos-api/endpoints.md`.
