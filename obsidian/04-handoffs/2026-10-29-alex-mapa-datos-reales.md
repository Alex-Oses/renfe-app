---
fecha: 2026-10-29
autor: Alex (agente de frontend)
area: frontend
para: Rubén, Marina
rama: feat/mobile-datos-reales-mapa
pr:
tags: [handoff, frontend, api, mapa]
---

# Handoff — La web usa los datos reales de la API

## Qué se hizo

Toda la capa de red de la web pasa por `frontend/shared/api/cliente.ts`, y ahora **entiende el contrato
tal cual** (`obsidian/02-contratos-api/endpoints.md`). Sin `VITE_API_URL` nada cambia: se sigue usando lo
simulado.

- **Buscador**: las estaciones salen de `GET /estaciones?q=` (antes solo de la lista simulada). Al enviar
  se resuelve la estación por nombre exacto, código o resultado único; si hay varias, se pide elegir de la
  lista. Botón en estado «Buscando…» mientras se resuelve.
- **Resultados**: `GET /trenes` se adapta al tipo de la UI (`tipo` en mayúsculas → AVE/Alvia/…) y, si el
  contrato manda `numero: null`, el número sale del final de la línea (`"AVE 02070"` → `02070`).
- **Mapa**: al elegir un tren se pide `GET /trenes/:feed/:tripId?fecha=` para tener recorrido y paradas
  (el snapshot de `/posiciones` solo trae lat/lon y retraso). Las coordenadas de cada parada se resuelven
  con `/estaciones` y se cachean. Las horas del estático se desplazan con el retraso de GTFS-RT, como dice
  el contrato. Un enlace directo `/mapa?tren=…` que ya no esté en el snapshot se resuelve con
  `GET /trenes/:feed/:tripId/posicion`.
- **Retraso honesto**: `retrasoSeg` puede ser negativo (adelantado) o `null` (sin dato). Se pinta
  «A tiempo» / «Retraso N min» / «Adelantado N min» / «Sin datos», nunca un «puntual» inventado.
- **Login facial**: `registrarCara`/`verificarCara` mandan el cuerpo del contrato
  (`modelo: "arcface/buffalo_l"`, `embedding` de 512) y se niegan a salir a la red con un vector que no
  sea de 512.

## Qué queda

- **Login facial real**: Human calcula 1024 valores (ADR-007 pide ArcFace, 512). Hace falta el modelo
  ONNX o cambiar la decisión en el ADR; mientras, la web falla con un mensaje claro. Ver bloqueos.
- Al recargar `/trenes?origen=…` los campos del buscador salen vacíos si las estaciones no se habían
  buscado en esa sesión (el id viene de la API y no está en la lista simulada). Se arregla pasando el
  nombre desde el resultado.
- App Expo: aún no arrancada (espera BD y facial).

## Bloqueos / preguntas para otros

- **Rubén**: `/estaciones` ya lo uso con `q` obligatorio (no pregunto con el campo vacío). Confirmar que
  `/trenes/:feed/:tripId/posicion` devuelve `404` cuando el viaje no circula: es lo que uso para decir
  «este tren ya no está circulando» en vez de enseñar un error.
- **Marina**: nada nuevo por mi parte; sin las migraciones y Supabase todo esto solo se puede probar
  contra datos simulados o contra Render (que aún no tiene BD).

## Cambios en contratos

Ninguno: la web se ha adaptado al contrato. Solo se ha usado `GET /estaciones`, `GET /trenes`,
`GET /trenes/:feed/:tripId`, `GET /trenes/:feed/:tripId/posicion`, `GET /posiciones` y las dos rutas
`/auth/cara/*`.

## Ficheros tocados

- `frontend/shared/api/`: `cliente.ts`, `tipos.ts`, `adaptador-trenes.ts`, `cara.ts`,
  `estaciones-memoria.ts`, `simulado-tiempo-real.ts`, `retraso-billete.ts` (+ sus tests).
- `frontend/web/src/`: `componentes/Buscador.tsx`, `componentes/Desplegable.tsx`,
  `paginas/Resultados.tsx`, `paginas/Mapa.tsx`, `paginas/mapa/CapasRuta.tsx`,
  `paginas/mapa/estado-tren.ts`, `paginas/mapa/mapa.css`,
  `componentes/herramientas/EstadoTren.tsx` (+ tests).

`pnpm lint`, `pnpm test` y el build de `frontend/web` en verde. Sin commit todavía.
