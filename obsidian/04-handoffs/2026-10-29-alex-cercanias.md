---
fecha: 2026-10-29
autor: Alex (con Claude)
area: gtfs
para: Marina
rama: feat/gtfs-importar-cercanias
pr: (este)
tags: [handoff, gtfs, cercanias]
---

# Handoff — Importar Cercanías

## Qué se hizo
- `pnpm gtfs:importar --feed cercanias` (URL por defecto la de Renfe, o `GTFS_CERCANIAS_URL`). El lector
  de [[plan-ingesta-gtfs]] ya era genérico; solo faltaba que `calendar_dates.txt` fuera opcional y que
  `--reemplazar` vacíe el feed pedido en vez de siempre `avld`.
- Las **497 paradas sin CODIGO** entran como estaciones propias `cercanias:<stop_id>` con las
  coordenadas de `stops.txt` (lo que ya hacía tu lector); no se inventa ningún mapeo.
- Probado en Supabase local (Docker): 1 532 estaciones, 1 147 `estacion_feeds`, 275 rutas, 870 calendarios,
  139 606 viajes y **1 922 405 horarios** en ~2 min. Aviso del propio importador: 456 viajes sin paradas.
- **Mapa:** 123 de 123 Cercanías en vivo cruzan con su viaje (línea, origen, destino, próxima parada y
  a tiempo/retraso) en `/posiciones`.

## Qué queda / decisiones para Marina
- **¿A la nube?** Son ~2 M filas más: mira el tamaño contra el plan gratuito de Supabase (500 MB).
- **Caduca a los 30 días**: hay que reimportar a diario (`--reemplazar`) o se queda sin horarios.
- `gtfs:verificar` sigue midiendo solo `avld` (no se ha tocado).
- `viajes.numero` sale vacío en Cercanías (Renfe no publica `trip_short_name`): el mapa enseña la línea.
