---
responsable: Marina
estado: obsoleto
actualizado: 2026-10-29
tags: [contrato, realtime]
---

# 📡 Eventos en tiempo real

> **OBSOLETO desde el 27/10/2026.** No hay Supabase Realtime, ni tabla `posiciones_trenes`, ni worker de
> GTFS-RT: el mapa usa **`GET /posiciones`** (snapshot en memoria de la API, sondeo cada 30 s) y se
> refresca preguntando. Se conserva como histórico del diseño; si algún día vuelve el Realtime, se
> reabre. Ver §5.3 de [`docs/arquitectura.md`](../../docs/arquitectura.md) y [[endpoints]].
>
> Solo lo que la app consume directamente de Supabase (Realtime). Todo lo demás va por la API.
> La tabla y sus columnas están en [[modelo-datos]] §6.1.

## Canales

| Canal / tabla | Quién escribe | Quién escucha | Payload |
|---|---|---|---|
| `posiciones_trenes` (`INSERT`/`UPDATE`) | gtfs-worker | App (mapa) | ver abajo |
| `billetes` (`UPDATE` de `estado`) | API | App (mis billetes) | por definir |

### `posiciones_trenes`

```json
{
  "feed": "cercanias",
  "viaje_id": "3099X23512C1",
  "fecha_servicio": "2026-10-28",
  "lat": 37.18487,
  "lon": -5.79046,
  "estado": "IN_TRANSIT_TO",
  "proxima_parada_id": "51200",
  "retraso_seg": 120,
  "cancelado": false,
  "actualizado": "2026-10-28T12:00:30+01:00"
}
```

Obligatorios: `feed`, `viaje_id`, `fecha_servicio`, `lat`, `lon`, `cancelado`, `actualizado`.
Opcionales (pueden faltar o ser `null`): `estado` (`INCOMING_AT` \| `STOPPED_AT` \|
`IN_TRANSIT_TO`), `proxima_parada_id`, `proxima_secuencia`, `retraso_seg`, `llegada_prevista`,
`rumbo`, `velocidad_kmh`, `vehiculo_id`.

**Cambio del 28/10:** el payload lleva **`fecha_servicio`** además de `feed` + `viaje_id`. Motivo: el
GTFS-RT de Renfe **no envía `trip.start_date`** y el mismo `trip_id` puede circular varios días
(AV/LD/MD), así que `feed` + `viaje_id` **no** identifican una fila; la clave es
`(feed, viaje_id, fecha_servicio)`. La deduce el worker (ver [[modelo-datos]] §6.1).

**El payload no lleva nombres.** No incluye `linea`, `origen`, `destino` ni `proxima_parada_nombre`:
el worker no duplica el catálogo en cada fila. El mapa tiene dos opciones, ambas válidas:

1. **Recomendada:** usar el evento como **señal** (debounce ~5 s) y refrescar con
   `GET /posiciones?bbox=…`, que ya devuelve el tren enriquecido.
2. Resolver los nombres en cliente con `GET /trenes/:feed/:tripId?fecha=` y `GET /estaciones`,
   cacheados.

**Reglas del canal:**
- Una fila por **viaje y fecha** (upsert): el worker no inserta histórico. La app recibe el estado
  actual.
- Realtime solo para `INSERT`/`UPDATE`; nunca `DELETE` (las posiciones viejas se purgan por
  `actualizado_en` y el mapa deja de pintar lo que no se refresca).
- RLS: lectura para `anon` y `authenticated`; escritura solo `service_role`.
- Frecuencia: la del sondeo del worker. Fuentes reales: posiciones cada **15 s** (AV/LD/MD) y el
  feed de Cercanías según Renfe; el worker sondea cada `GTFS_RT_POLL_SECONDS` (30 s por defecto).
- Si el viaje no está en el catálogo (feed sin importar o viaje purgado), la posición se publica
  igualmente y el mapa la marca sin etiqueta: **la API resuelve `sinCatalogo: true` con `left join`**.
