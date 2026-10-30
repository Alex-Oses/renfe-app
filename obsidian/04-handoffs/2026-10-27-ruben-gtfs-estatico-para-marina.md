---
fecha: 2026-10-27
autor: Rubén
area: db
para: Marina
rama: feat/api-retrasos
pr: "#47"
tags: [handoff, db, gtfs, import, avld, trips]
estado: cerrado
---

# Handoff — dos hallazgos del GTFS estático real antes de importar

> Lo he descubierto descargando el GTFS estático de AVE/LD de Renfe
> (`https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip`, 867 KB, accesible sin token).
> Los dos afectan al import de `backend/gtfs-worker` y uno toca [[modelo-datos]]. Ninguno es un
> fallo del modelo: es información que solo se ve mirando el fichero. Ya dejé el aviso en la propia
> nota ([[modelo-datos]] §4.6).

## 1. `trips.txt` de AVE/LD **no son plantillas**: viene un viaje por fecha

[[modelo-datos]] §4.6 dice que un viaje **no tiene fecha**, que es una plantilla («AVE 03070,
laborables») y que la fecha se resuelve con `calendarios` + `calendario_excepciones`. Para `avld`
Renfe **ya lo materializa**:

| Dato de `trips.txt` (avld) | Valor |
|---|---|
| Filas | **8.663** |
| Fechas distintas dentro del `trip_id` | 84 (26/10/2026 → 29/09/2027) |
| Viajes base distintos (lo que va antes de la fecha) | 2.005 |

El `trip_id` tiene la forma `<numero><fecha>`:

```
0019012026-10-27
0019012026-11-03
0019012026-11-04
```

Y `service_id` también lleva las fechas pegadas: `2026-10-272026-10-31001901`.

**Qué implica para el import:**

- `viajes` de `avld` serán ~8.700 filas, no ~2.000. No es un problema, pero cambia el volumen que
  estimamos en [[modelo-datos]] §8 (decía ~30 000 entre los dos feeds: solo LD ya son 8.663).
- `stop_times.txt` son **23 MB** y ~57.000 filas por versión del feed. Es la tabla grande de verdad.
- El SQL de `/trenes` y del detalle **sigue funcionando** tal cual: el filtro por
  `calendarios`/`calendario_excepciones` no molesta aunque cada viaje dure un solo día. No hay que
  cambiar el contrato, solo saberlo.
- Si el worker iba a deduplicar viajes por plantilla, **no lo hagas** en `avld`: cada `trip_id` es un
  viaje de un día concreto y así es como lo referencia GTFS-RT.

## 2. El `tripId` de GTFS-RT **sí** coincide con el `trip_id` estático

Esto corrige un bloqueo que yo mismo había anotado en [[endpoints]] y que era **falso**:

```
0327212026-10-26 -> existe en trips.txt
0393312026-10-26 -> existe en trips.txt
0029112026-10-27 -> existe en trips.txt
```

Coinciden exactos, con fecha incluida. Yo había comparado un id del feed en vivo de AVE/LD contra
`3097L23537C1`, que es un ejemplo con formato de **Cercanías** sacado del contrato, no del feed real.

Consecuencia: `/trenes/:feed/:tripId/posicion` **ya está implementado** (PR #47), sin BD, leyendo el
snapshot en memoria de `/posiciones`. El mapa puede enlazar a la ficha del viaje.

**Lo que falta confirmar:** el GTFS estático de **Cercanías**. Las URLs que probé dan 404
(`Fichero_CERCA`, `Fichero_Cercanias`, `Fichero_CER_CERCA`, `Fichero_NUCLEOS`). Si sabes la buena,
pásala: el formato del `tripId` de Cercanías (`5198M28281R2S`) encaja con un `trip_id` estático, pero
no lo he podido comprobar.

## 3. Un detalle que te va a afectar en `estacion_feeds`

GTFS-RT publica `stopId` por vehículo (`04007`, `60000`…). Es el **`stop_id` del feed**, no el `id`
unificado de `estaciones`. Para `avld` coinciden hoy porque el modelo decidió que `estaciones.id` =
`stop_id` de `avld`; para `cercanias` **no**. Lo he documentado en [[endpoints]]: la web solo podrá
mostrar el id hasta que exista `estacion_feeds` y la API pueda traducirlo.

## Qué necesito de ti

1. Los ficheros de `backend/database/supabase/migrations/` (aunque sea solo el bloque de catálogo
   §4 + `incidencias`) y una `DATABASE_URL` a un Postgres con ellos aplicados. Es lo único que le
   falta al SQL de `/estaciones`, `/trenes` y el detalle para dejar de estar sin probar.
2. Confirmar si los nombres finales llevan prefijo `gtfs_` ([[sprint-actual]]) o no ([[modelo-datos]]).
3. La URL del GTFS estático de Cercanías, si la tienes.

## Ficheros tocados

- `backend/api/src/modules/posiciones/posiciones.service.ts` (+ spec): `paradaActual` y `posicionDe`.
- `backend/api/src/modules/trenes/` (`trenes.controller.ts`, `trenes.module.ts`): ruta nueva.
- `obsidian/02-contratos-api/endpoints.md`
