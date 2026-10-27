---
fecha: 2026-10-27
autor: Alex (con Claude Code)
area: mobile
para: todos
rama: feat/mobile-tipos-contrato-y-pulido
pr: (ver PR de esta rama)
tags: [handoff]
---

# Handoff — Web alineada con el contrato y pulido visual

## Qué se hizo
- Mergeados en `develop`: #13 (ADR-004), #15 y #16 (Marina), #25 (Rubén); #17 y `develop` → `main` (#27): la web está en producción en Vercel.
- Cerrados los PRs de Dependabot #20–#24 (saltos de versión mayor sin probar).
- `frontend/web/src/api/cliente.ts`: con `VITE_API_URL` usa el contrato de [[endpoints]]: sobres `{datos,total}`, `/trenes/:feed/:tripId?fecha=` (el id de tren es `feed:tripId:fecha`) y `/posiciones`, traducido a `PosicionTren`.
- `tipos.ts`: `Tren` acepta `feed`, `tripId`, `fecha`, `retrasoSeg`; las estaciones de un tren pueden venir sin ciudad (`ciudadDe()`).
- Fallos visuales: desbordamiento horizontal de la reserva en móvil, duración partida en vertical en resultados, "A Coruña" mostrada como "A" en el mapa y columna de tipo de tren más ancha en escritorio.

## Qué queda
- **Rubén:** cuando `/trenes` exista, comprobar que el `id` sigue el formato `feed:tripId:fecha`; la web depende de él.
- **Kevin:** subir dependencias mayores (TS 7, Vite 8, Vitest 5, React Router 7) en una tarea con pruebas; la CI aún no ejecuta lint ni tests.
- `/posiciones` no trae origen, destino ni progreso: el mapa los muestra vacíos con la API real hasta que se amplíe el contrato.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno (la web se adapta al contrato).

## Ficheros tocados
- `frontend/web/src/api/{cliente,tipos}.ts`, `frontend/web/src/paginas/**`, `frontend/web/src/estilos/base.css`
- `obsidian/01-estado/estado-equipo.md` (fila de Alex), este handoff.
