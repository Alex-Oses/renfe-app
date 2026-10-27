---
fecha: 2026-10-27
autor: Rubén
area: api
para: Alex
rama: feat/api-detalle-tren
pr: "#39 (apilada sobre #36 y #33)"
tags: [handoff, api, posiciones, gtfs-rt, retrasos, frontend]
---

# Handoff — `/posiciones` con posiciones **y retrasos reales**: lo que la web puede usar ya

> Para Alex y su IA. Esto es lo que hay **hoy** en `/posiciones`, comprobado contra Renfe, y lo que
> todavía no se puede pintar. Si vas a montar el mapa, empieza por aquí y no pierdas una tarde
> descubriendo lo que ya está en esta nota.

## 1. Qué funciona y qué no necesita la base de datos

`GET /posiciones` **no toca Supabase**. Lee los feeds de Renfe en memoria cada 30 s. Funciona en tu
máquina sin migraciones, sin `DATABASE_URL` y sin esperar a Marina. Es el único endpoint de datos que
está desbloqueado del todo.

## 2. Cómo levantarlo en tu máquina

```bash
pnpm dev:api          # API en http://localhost:3000 (si el 3000 está pillado, API_PORT=3100)
```

En tu `.env` de la web: `VITE_API_URL=http://localhost:3000`.

**Trampa de CORS:** la API solo acepta los orígenes de `CORS_ORIGINS` (por defecto
`http://localhost:5173,http://localhost:8081`). Si tu Vite arranca en otro puerto, la petición se
bloquea en el navegador y el error parece un fallo de la API. Añade tu puerto al `CORS_ORIGINS` del
`.env` de la API.

## 3. Forma de la respuesta

```json
{
  "datos": [
    {
      "feed": "avld",
      "vehicleId": "03272",
      "tripId": "0327212026-10-26",
      "lat": 40.571243,
      "lon": -3.1454396,
      "rumbo": null,
      "velocidadKmh": null,
      "estado": "STOPPED_AT",
      "retrasoSeg": 2640,
      "actualizado": "2026-10-27T10:06:03+01:00"
    }
  ],
  "actualizado": "2026-10-27T10:06:03+01:00"
}
```

- `GET /posiciones?bbox=minLon,minLat,maxLon,maxLat&feed=avld|cercanias`. Los dos parámetros son
  **opcionales**; sin `bbox` te llegan los ~460 trenes de toda España.
- `estado` es el enum de GTFS-RT sin traducir: `INCOMING_AT` · `STOPPED_AT` · `IN_TRANSIT_TO`.
- `actualizado` es ISO 8601 **con offset de Madrid**, no UTC: no hay que convertir nada.
- `400` si `bbox` va mal o con los mínimos al revés. `503` solo si Renfe no responde **y** no hay
  datos previos.

## 4. Lo que **no** vas a poder pintar (y por qué)

| Campo | Estado | Motivo |
|---|---|---|
| `rumbo` | `null` siempre | Renfe no publica `bearing` en su feed. |
| `velocidadKmh` | `null` siempre | Renfe no publica `speed`. |
| `retrasoSeg` | **real** | Sale de `trip_updates`. `null` solo si ese viaje no lo publica. |

**`retrasoSeg` puede ser negativo**: es un tren **adelantado**, no un dato roto. En la última prueba,
26 de 460 trenes iban con retraso negativo. Píntalo en verde, no en rojo.

**Sí puedes hacer clic en un tren y pedir su ficha.** El `tripId` que devuelve `/posiciones` es el
`trip_id` del GTFS estático: pásalo tal cual a `GET /trenes/:feed/:tripId/posicion` y tendrás la
posición de ese viaje con `paradaActual`. Confirmado en `avld` contra el `trips.txt` real de Renfe.
Ojo: `paradaActual` es el `stop_id` del feed, así que **hoy solo puedes mostrar el id**, no el nombre
de la estación (eso necesita la BD).

## 5. Números reales de la última prueba (27/10, 10:06)

- 461 posiciones: 460 con retraso real.
- En la caja de Madrid: 90 trenes, 89 con retraso.
- Retraso máximo visto: 106 min. Adelantados: 26.
- Cobertura del cruce: 193/205 en `avld` y 282/285 en Cercanías (el resto no publica retraso).

## 6. Lo que sigue bloqueado para todos

- **La API no está desplegada.** Render es de Kevin y sigue pendiente, así que **no hay URL pública**
  a la que apuntar la web de Vercel. Mientras tanto, en local.
- `/estaciones`, `/trenes` y el detalle necesitan las migraciones de Marina y **hoy devuelven `503`**
  sin `DATABASE_URL`. Eso no es un fallo: es a propósito.

## Cambios en contratos

[[endpoints]]: `retrasoSeg` deja de ser «`null` porque no se lee» y pasa a ser real, con el aviso del
signo negativo y del feed de retrasos (`GTFS_RT_URL_RETRASOS_AVLD` / `GTFS_RT_URL_RETRASOS_CERCANIAS`,
vacías = las de Renfe). `.env.example` actualizado.
