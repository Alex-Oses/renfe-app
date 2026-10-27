---
fecha: 2026-10-27
autor: Alex
area: mobile
para: Rubén
rama: feat/mobile-mapa-detalle-tren
pr: (ver PR de esta rama)
tags: [handoff, contrato]
---

# Handoff — Detalle del tren en el mapa (campos nuevos para /posiciones)

## Qué se hizo
- Fuera la velocidad del mapa (Renfe no la publica en tiempo real).
- Al pulsar un tren de la lista, el mapa lo centra y el panel muestra: **nombre/línea, sale de, va a (con hora de llegada), próxima parada (con hora) y retraso**. Cada dato solo aparece si llega.
- [[endpoints]] → `GET /posiciones` → sección **"Campos del viaje para el mapa — propuesto (Alex)"**: `nombre`, `linea`, `origen`, `destino`, `proximaParada {nombre, llegada}`, `llegadaDestino`, todos opcionales.
- `frontend/web/src/api/cliente.ts` (`aPosicion`) ya lee esos campos: en cuanto la API de Render los mande, la web los enseña sin más cambios.

## Qué queda
- **Rubén:** añadir esos campos en `/posiciones` cruzando con el GTFS estático (lo que estás haciendo de nombre y línea). Si cambias nombres o formas, cámbialo primero en [[endpoints]] y avísame.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
- [[endpoints]]: campos opcionales propuestos en `GET /posiciones`.

## Ficheros tocados
- `frontend/web/src/paginas/Mapa.tsx`, `frontend/web/src/paginas/mapa/mapa.css`, `frontend/web/src/api/{cliente,tipos,simulado-tiempo-real}.ts`, `frontend/web/api/posiciones.ts`
- `obsidian/02-contratos-api/endpoints.md`, este handoff.
