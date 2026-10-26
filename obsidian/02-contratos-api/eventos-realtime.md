---
responsable: Marina
estado: borrador
actualizado: 2026-10-26
tags: [contrato, realtime]
---

# 📡 Eventos en tiempo real

> Solo lo que la app consume directamente de Supabase (Realtime). Todo lo demás va por la API.
> La tabla y sus columnas están en [[modelo-datos]] §6.

## Canales

| Canal / tabla | Quién escribe | Quién escucha | Payload |
|---|---|---|---|
| `posiciones_trenes` (`INSERT`/`UPDATE`) | gtfs-worker | App (mapa) | ver abajo |
| `billetes` (UPDATE estado) | API | App (mis billetes) | por definir |

### `posiciones_trenes`

```json
{
  "feed": "cercanias",
  "viaje_id": "3097L23537C1",
  "lat": 37.18487,
  "lon": -5.79046,
  "retraso_seg": 180,
  "actualizado": "2026-10-26T12:00:30+01:00"
}
```

Obligatorios: `feed`, `viaje_id`, `lat`, `lon`, `actualizado`.
Opcionales (pueden faltar o ser `null`): `retraso_seg`, `rumbo`, `velocidad_kmh`,
`estado` (`INCOMING_AT` \| `STOPPED_AT` \| `IN_TRANSIT_TO`), `parada_actual_id`, `vehiculo_id`.

**Cambio del 26/10:** el payload lleva `feed` porque dos feeds pueden usar el mismo `trip_id`;
`viaje_id` solo no identifica el tren. Es compatible hacia atrás (los campos nuevos son
opcionales), pero el mapa **debe** filtrar por `feed` + `viaje_id`.

**Reglas del canal:**
- Una fila por viaje (upsert): el worker no inserta histórico. La app recibe el estado actual.
- Realtime solo para `INSERT`/`UPDATE`; nunca `DELETE` (las posiciones viejas se purgan por
  `actualizado_en` y el mapa deja de pintar lo que no se refresca).
- RLS: lectura para `anon` y `authenticated`; escritura solo `service_role`.
- Frecuencia: la del sondeo del worker (`GTFS_RT_POLL_SECONDS`, 30 s por defecto).
