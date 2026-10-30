---
fecha: 2026-10-26
autor: Rubén (con OpenCode)
area: api
para: todos
rama: (sin rama todavía; cambios locales sobre develop)
pr: —
tags: [handoff]
estado: cerrado
---

# Handoff — Arquitectura y plan de la API de Renfe

## Qué se hizo

- Repo clonado en local (`develop`) y vault `obsidian/` registrado y abierto en Obsidian 1.14.5.
- Verificadas en vivo las fuentes de datos abiertos de Renfe (2026-10-26): 2 GTFS estáticos
  (Cercanías 15,1 MB y AVE/LD 0,8 MB) y los 4 GTFS-RT en **JSON** (posiciones, retrasos, incidencias),
  con volúmenes medidos: ~2.155 paradas, 141.000 viajes, 1,9 M horarios y ~540 trenes en vivo.
- `docs/arquitectura.md` reescrito: diagrama de piezas, ingesta del worker, tres caminos de petición
  (búsqueda, compra+QR+validación, tiempo real), reglas no negociables, trampas de los feeds,
  rendimiento, alcance y decisiones abiertas.
- Confirmado que no hay CORS ni compresión en `gtfsrt.renfe.com` y que sirven `Cache-Control: max-age=30`.

## Qué queda

- **Rubén:** contrato detallado ✅ (ver [[endpoints]]). Siguiente: guard de JWT y, en cuanto haya
  tablas, `/estaciones` y `/trenes`.
- **Marina:** import GTFS estático idempotente y worker GTFS-RT (ver §4 y §7 de `docs/arquitectura.md`).
  Empezar verificando que los `tripId` de AVE/LD casan con `trips.txt` al quitar la fecha.

## Bloqueos / preguntas para otros

- ¿Una estación física es una sola en la UI (Atocha) o dos, una por feed? Recomiendo una (§9).
- ¿Tiempo real con worker + Supabase Realtime (ADR-001) o caché en memoria en la API? Recomiendo
  worker + Realtime, pero la variante cacheada ahorra ~3 días.

## Cambios en contratos

- [[endpoints]]: catálogo completo y **contrato detallado** de las 6 rutas de datos (`/estaciones`,
  `/trenes`, `/trenes/:feed/:tripId`, `/trenes/:feed/:tripId/posicion`, `/incidencias`, `/posiciones`),
  con convenciones (sobres, fechas con offset, `feed`, errores) y la sección de autenticación.
  Renombradas las rutas de viaje a `/trenes/:feed/:tripId` para no meter ids compuestos en la URL.
- [[modelo-datos]]: sin tocar (es de Marina); el worker necesitará las tablas `gtfs_*` y `rt_*`.

## Ficheros tocados

- `docs/arquitectura.md`
- `obsidian/04-handoffs/2026-10-26-ruben-arquitectura-api-renfe.md`
- `obsidian/01-estado/estado-equipo.md` (solo mi fila)
- `obsidian/05-areas/backend.md`
- `obsidian/02-contratos-api/endpoints.md`
