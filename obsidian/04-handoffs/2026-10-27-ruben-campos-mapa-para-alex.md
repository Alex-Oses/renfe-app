---
fecha: 2026-10-27
autor: Rubén
area: api
para: Alex
rama: feat/api-retrasos
pr: "#47"
tags: [handoff, api, posiciones, contrato, mapa, retrasos]
estado: cerrado
---

# Handoff — respuesta a los «campos del viaje para el mapa» y qué llega en #47

> Respuesta a tu PR #57. Resumen: **la forma de los campos se acepta**, pero los seis salen del GTFS
> estático y **hoy son `null` por falta de BD, no por falta de código**.

## 1. Lo que sí llega en cuanto se mergee #47

No hace falta que toques nada: tu `aPosicion` ya lo lee.

| Campo | Antes | Ahora |
|---|---|---|
| `retrasoSeg` | `null` siempre | **real**, de `trip_updates`. Negativo = adelantado |
| `paradaActual` | no existía | el `stopId` del feed (`"60000"`), **no** el id unificado de `estaciones` |

Tu `retrasoMin: Math.round((p.retrasoSeg ?? 0) / 60)` empieza a dar números reales solo. Ojo con el
signo: hoy tu código lo redondea bien, pero asegúrate de que un `-5` se pinte como «5 min antes» y no
como retraso.

También llega `GET /trenes/:feed/:tripId/posicion`, que devuelve la posición de un viaje concreto
pasándole el `tripId` de `/posiciones` tal cual. **El `tripId` de GTFS-RT es el `trip_id` del GTFS
estático**: lo comprobé contra el `trips.txt` real de AVE/LD.

## 2. Los seis campos del mapa: aceptados, pero bloqueados

`nombre`, `linea`, `origen`, `destino`, `proximaParada` y `llegadaDestino` **no se pueden calcular
con GTFS-RT**. `vehicle_positions` solo publica `tripId`, `vehicleId`, `stopId`, latitud y longitud:
ni un nombre de estación, ni una hora, ni una línea. Todos salen de tablas del GTFS estático
(`rutas`, `horarios`, `estaciones`), que están en Supabase, y **Supabase no tiene migraciones**.

En [[endpoints]] dejé la tabla de dónde sale cada uno para que no se pierda. El orden en que se
podrán rellenar, cuando haya BD:

1. `nombre` y `linea` — solo necesitan `rutas` (la más fácil).
2. `origen`, `destino` y `llegadaDestino` — necesitan `horarios` + `estaciones`.
3. `proximaParada` — necesita además traducir el `stopId` de GTFS-RT por `estacion_feeds`.

**No los voy a inventar.** Un `nombre` inventado o una hora estimada en la UI es peor que un campo
vacío que se oculta, que es justo lo que ya hace tu `aPosicion`.

## 3. `velocidadKmh` y `rumbo`: los dejo

Propusiste quitarlos. Los dejo porque `aPosicion` todavía los mapea (`rumbo: p.rumbo ?? 0`) y
quitarlos no arregla nada; quedan marcados como obsoletos en el contrato. Si quieres que
desaparezcan, quita primero el campo del tipo de la web y te los borro en el mismo PR.

## 4. Un aviso de tu lado: `/posiciones` en Render sirve código viejo

Comprobado hace un momento contra `https://renfe-api.onrender.com/posiciones`: 455 posiciones, con
`retrasoSeg` a `null` y sin `paradaActual`. Es lo esperado: Render despliega `develop` y #47 no está
mergeado. No es un fallo de tu handler.

## 5. Nit del `pnpm sync`

Lo he ejecutado y a la segunda ha ido. La primera vez petó con un stack trace de Node en vez del
mensaje de error: en `scripts/sync-rama.mjs` el `git fetch` está **fuera** del `try`, así que un fallo
de red sale como excepción sin capturar. Arreglo de dos líneas, meterlo dentro del `try`. No lo toco
porque no es mi área.

## Ficheros tocados

- `obsidian/02-contratos-api/endpoints.md`: propuesta aceptada + tabla de origen de cada campo +
  `paradaActual` y su límite.
- Este handoff.
