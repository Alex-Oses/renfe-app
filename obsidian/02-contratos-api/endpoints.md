---
responsable: Rubén
estado: borrador
tags: [contrato, api]
---

# 🔌 Endpoints de la API

> **Fuente de verdad** entre frontend y backend. Se actualiza ANTES de implementar.
> Base URL local: `http://localhost:3000` · Auth: `Authorization: Bearer <jwt>`
> **El contrato lo manda la API**: el frontend se adapta a estos shapes, no al revés.

## Convenciones

| Tema | Regla |
|---|---|
| Colecciones | `{ "datos": [...], "total": n }`. Un detalle es un objeto plano, sin sobre |
| Fechas y horas | ISO 8601 **con offset** de `Europe/Madrid` (`2026-11-02T07:15:00+01:00`). Si GTFS trae `25:10`, se devuelve la fecha real del día siguiente (`2026-11-03T01:10:00+01:00`) |
| `feed` | `"cercanias"` o `"avld"`. Obligatorio en viajes, posiciones e incidencias. Las estaciones van unificadas y exponen `feeds[]` |
| `id` público | Cadena opaca y estable. **No** garantizamos que sea un `stop_id` de GTFS (hoy coincide con el de AVE/LD por comodidad) |
| Dinero | Euros con 2 decimales. `precioDesde` y `plazasLibres` son **simulados** (ver tabla de real/simulado en [`docs/arquitectura.md`](../../docs/arquitectura.md)) |
| Paginación | `limit` 1–50 (por defecto 20). Sin `offset` hasta que haya necesidad real |
| Auth | Públicos: `/estaciones`, `/trenes*`, `/incidencias`, `/posiciones`. El resto, `Bearer` |
| Errores | `{ "statusCode": 400, "error": "Bad Request", "message": "..." }` (formato de Nest) |
| Límite de peticiones | Pendiente (fase F7). Cuando exista, `429` con `Retry-After` |
| Versión | Sin prefijo. Si hay cambio incompatible, se abre `/v2` |

Códigos de error habituales: `400` parámetros inválidos · `401` token ausente o inválido · `403` rol
insuficiente · `404` recurso inexistente · `503` base de datos no disponible.

## POST /chatbot/mensaje

Consulta conversacional pública sobre los datos de Renfe disponibles en la API. El chatbot usa Gemini
con herramientas internas de solo lectura para buscar estaciones, consultar trenes, obtener el detalle
de un viaje y consultar posiciones en tiempo real. No acepta SQL, URLs ni nombres de herramientas del
cliente. El modelo no puede crear reservas, consultar billetes/abonos privados ni ejecutar acciones.

Auth: **no**. La ruta requiere `GEMINI_API_KEY` y usa el modelo `gemini-3.5-flash-lite`; si no está
configurada o el proveedor no responde,
devuelve `503`.

Request:

```json
{ "mensaje": "¿Qué trenes hay de Madrid a Barcelona mañana?" }
```

`mensaje` debe tener entre 1 y 2000 caracteres. `conversationId` es opcional y opaco; el servidor no
persiste conversaciones y solo lo devuelve para que el cliente pueda correlacionar la respuesta.

Response 200:

```json
{
  "respuesta": "He encontrado 3 trenes...",
  "conversationId": "c-...",
  "herramientas": ["buscar_trenes"]
}
```

Errores: `400` mensaje inválido · `503` proveedor de IA o datos no disponibles.

## Autenticación

- Dos formas de entrar, **un solo formato de token** (HS256 con `SUPABASE_JWT_SECRET`):
  - **Contraseña**: el token lo emite **Supabase Auth**; la API solo lo verifica. Trae
    `access_token` + `refresh_token`.
  - **Cara**: la API firma el token cuando `verificar_cara` dice que coincide. Ver
    [[ADR-007-reconocimiento-facial]]. **Sin `refresh_token`**: dura 12 h y después hay que volver a
    mirar a la cámara.
- Claims del token: `sub` (uuid), `email`, `app_metadata.rol` (`viajero` \| `revisor` \| `admin`),
  `iat` y `exp`. El facial los rellena igual que Supabase para que el guard no distinga cómo se entró.
- Rol `admin` (propuesto por Alex, 2026-10-27): además de `revisor`, puede validar billetes.
- Los endpoints públicos no llevan token. Los privados exigen `Authorization: Bearer <jwt>`.
- La API usa un JWT propio firmado con `JWT_SECRET`; Supabase Auth solo valida internamente las
  credenciales y nunca se entrega al cliente un token de Supabase.

## POST /auth/registro

Descripción: alta con email y contraseña. La API crea el usuario en **Supabase Auth** con
`service_role` (`email_confirm: true`), inserta su fila en `perfiles` y devuelve una sesión ya
iniciada. El rol de un alta siempre es `viajero`: nadie puede autoasignarse `revisor`.
Auth: **no**

Request:

```json
{ "nombre": "Ana", "email": "ana@ejemplo.es", "password": "contrasena-larga" }
```

Response 201: mismo shape que `/auth/login`.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": null,
  "usuario": {
    "id": "6f1c…", "nombre": "Ana", "email": "ana@ejemplo.es",
    "rol": "viajero", "caraRegistrada": false
  }
}
```

Errores: `400` nombre, email o contraseña inválidos · `409` email ya registrado · `503` Supabase
Auth o la BD no responden.

Notas: el rol va en `perfiles.rol` y en `app_metadata.rol` del usuario de Supabase. Si falla el alta
del perfil, la API borra el usuario de Supabase para no dejar cuentas a medias.

## POST /auth/login

Descripción: login con email y contraseña. Supabase Auth valida las credenciales y la API emite su
propio JWT, añadiendo el perfil (nombre, rol y si tiene la cara registrada).
Auth: **no**

Request: `{ "email": "ana@ejemplo.es", "password": "contrasena-larga" }`

Response 200: `{ "token", "refreshToken", "usuario": { "id", "nombre", "email", "rol", "caraRegistrada" } }`.

Errores: `400` email o contraseña mal formados · `401` credenciales incorrectas · `503` Supabase Auth
o la BD no responden.

Notas: `rol` se lee de `perfiles.rol` y se firma en `app_metadata.rol` dentro del JWT propio. El
token es HS256, dura 12 horas y no incluye `refreshToken`.


## Plantilla por endpoint

```
### METODO /ruta
Descripción:
Auth: sí/no
Request:  { ... }
Response 200: { ... }
Errores: 400 ..., 401 ..., 404 ...
Estado: propuesto | implementado | cambiado (fecha)
```

## Catálogo

| Método | Ruta | Para qué | Estado |
|---|---|---|---|
| GET | `/estaciones?q=&feed=` | Autocompletar estaciones | **implementado** · **detallado** |
| GET | `/trenes?origen=&destino=&fecha=` | Buscar viajes directos | **implementado** · **detallado** |
| GET | `/trenes/:feed/:tripId?fecha=` | Detalle de un viaje con paradas y horas | **implementado** · **detallado** |
| GET | `/trenes/:feed/:tripId/posicion` | Última posición del tren | **implementado** · **detallado** |
| GET | `/incidencias?feed=&linea=` | Avisos GTFS-RT | propuesto · **detallado** |
| GET | `/posiciones?bbox=&feed=` | Posiciones para el mapa en vivo (sustituye a Realtime) | **implementado** · **detallado** |
| GET | `/health` | Estado del servicio (infra) | implementado |
| POST | `/auth/registro` | Alta de usuario | **implementado** · **detallado** |
| POST | `/auth/login` | Login email/contraseña | **implementado** · **detallado** |
| POST | `/auth/cara/registrar` | Guardar embedding facial (una sola vez) | **implementado** · **detallado** |
| POST | `/auth/cara/verificar` | Login facial | **implementado** · **detallado** |
| POST | `/auth/cara/reset` | Admin borra la plantilla de un usuario | **implementado** · **detallado** |
| GET | `/trenes/:feed/:tripId/asientos?fecha=` | Asientos disponibles (simulado) | propuesto |
| POST | `/reservas` | Crear reserva | **implementado** · **detallado** |
| POST | `/pagos/intent` | PaymentIntent Stripe test | propuesto |
| POST | `/pagos/webhook` | Webhook de Stripe | propuesto |
| GET | `/billetes` | Mis billetes | **implementado** · **detallado** |
| GET | `/billetes/:id/qr` | QR firmado | **implementado** · **detallado** |
| POST | `/billetes/validar` | Revisor valida un QR | **implementado** · **detallado** (Alex) |
| GET | `/admin/resumen` | Cifras para el panel de administración | propuesto · **detallado** (Alex) |
| POST | `/chatbot/mensaje` | Mensaje al chatbot | propuesto |
| GET | `/abonos` | Mis abonos y bonos | **implementado** · **detallado** (Alex) |
| POST | `/abonos` | Comprar un abono o bono | **implementado** · **detallado** (Alex) |
| GET | `/abonos/:id` | Un abono con su QR firmado | **implementado** · **detallado** (Alex) |

Los marcados **detallado** tienen contrato completo abajo. Los demás se detallan en el sprint que
los implementa: no dependen de GTFS, así que no bloquean la fase de datos.

---

## GET /estaciones

Descripción: busca estaciones por nombre o ciudad. Sin tildes y sin distinguir mayúsculas
("atocha" → "Madrid-Puerta de Atocha"). Las estaciones están unificadas entre feeds.
Auth: **no**

Request (query):

| Parámetro | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `q` | string 1–60 | sí | Texto libre; se normalizan tildes |
| `feed` | `cercanias` \| `avld` | no | Solo estaciones servidas por ese feed |
| `limit` | int 1–50 | no | Por defecto 20 |

Response 200:

```json
{
  "datos": [
    {
      "id": "60000",
      "nombre": "Madrid-Puerta de Atocha",
      "ciudad": "Madrid",
      "lat": 40.4066,
      "lon": -3.6906,
      "feeds": ["avld", "cercanias"]
    }
  ],
  "total": 1
}
```

Errores: `400` `q` vacío o `limit` fuera de rango · `503` si la BD no responde.

Notas: `ciudad` sale de una tabla de apoyo; si no se conoce, cadena vacía (nunca inventada).

Estado: **implementado** (2026-10-27). El filtro de tildes se hace con `translate()` en SQL, no con
la extensión `unaccent`, para no añadir dependencias al modelo.

El SQL **se ejecutó contra Postgres real** (PGlite, en local y sin Docker) y funciona: tildes,
filtro por feed, `feeds[]` vacío, `ciudad` nula y `total` con límite. Ese test **no se queda en el
repo** porque la dependencia tumba el preview de Vercel, y Vercel no es nuestra área. Queda
pendiente verlo contra el Supabase de verdad cuando existan las migraciones.

## GET /trenes

Descripción: viajes **directos** entre dos estaciones para una fecha de servicio.
Auth: **no**

Request (query):

| Parámetro | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `origen` | string | sí | `id` de estación |
| `destino` | string | sí | `id` de estación, distinto de `origen` |
| `fecha` | `AAAA-MM-DD` | sí | Fecha local de servicio |
| `limit` | int 1–50 | no | Por defecto 20 |

Response 200:

```json
{
  "datos": [
    {
      "id": "avld:3097L23537C1:2026-11-02",
      "feed": "avld",
      "tripId": "3097L23537C1",
      "fecha": "2026-11-02",
      "linea": "AVE 02070",
      "tipo": "AVE",
      "numero": "02070",
      "origen": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
      "destino": { "id": "71801", "nombre": "Barcelona-Sants" },
      "salida": "2026-11-02T07:15:00+01:00",
      "llegada": "2026-11-02T09:40:00+01:00",
      "duracionMin": 145,
      "numParadas": 3,
      "retrasoSeg": 180,
      "precioDesde": 45.0,
      "plazasLibres": 12
    }
  ],
  "total": 9
}
```

Errores: `400` falta un parámetro o `fecha` inválida · `404` estación inexistente · `503` BD caída.

Notas:

- `retrasoSeg` es `null` si no hay dato en GTFS-RT. Hoy **siempre** es `null`: `/trenes` no consulta
  GTFS-RT; el retraso real llega con `/trenes/:feed/:tripId` y `/posiciones`.
- `tipo` es `rutas.tipo_servicio` en mayúsculas (`AVE`, `ALVIA`…); si es `null`, `"DESCONOCIDO"`.
- `numero` sale del número al final de `nombre_corto` (`AVE 02070` → `02070`); si no lo hay, `null`.
  **Puede ser `null`**: quien pinte la UI debe tener un plan B.
- `precioDesde` y `plazasLibres` son simulados y deterministas (misma búsqueda → mismo resultado).
- Solo directos en fase 1. Los transbordos, si llegan, serán `numTransbordos` > 0 en una v2.
- La fecha se resuelve con `calendarios` + `calendario_excepciones` en la misma consulta, y `recoge`/
  `deja` excluyen las paradas técnicas.

## GET /trenes/:feed/:tripId

Descripción: detalle de un viaje: paradas, horas y retraso por parada.
Auth: **no**

Request (params y query):

| Parámetro | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `feed` | `cercanias` \| `avld` | sí | En la ruta |
| `tripId` | string | sí | `trip_id` de GTFS (URL-encoded) |
| `fecha` | `AAAA-MM-DD` | sí | El `tripId` se repite todos los días: sin fecha no hay viaje |

Response 200:

```json
{
  "feed": "avld",
  "tripId": "3097L23537C1",
  "fecha": "2026-11-02",
  "linea": "AVE 02070",
  "tipo": "AVE",
  "numero": "02070",
  "origen": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
  "destino": { "id": "71801", "nombre": "Barcelona-Sants" },
  "salida": "2026-11-02T07:15:00+01:00",
  "llegada": "2026-11-02T09:40:00+01:00",
  "retrasoSeg": 180,
  "paradas": [
    {
      "seq": 1,
      "estacion": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
      "llega": null,
      "sale": "2026-11-02T07:15:00+01:00",
      "retrasoSeg": 0
    },
    {
      "seq": 2,
      "estacion": { "id": "04040", "nombre": "Zaragoza-Delicias" },
      "llega": "2026-11-02T08:32:00+01:00",
      "sale": "2026-11-02T08:34:00+01:00",
      "retrasoSeg": 120
    }
  ]
}
```

Errores: `400` falta `fecha`, `feed` no válido o `fecha` mal formada · `404` el viaje no circula esa
fecha · `503` BD caída.

Notas:

- `llega` es `null` en la primera parada y `sale` en la última. Si a la primera le falta `sale` se
  usa su `llega` (y al revés en la última), porque GTFS exige una de las dos.
- `retrasoSeg` es `null` **siempre** hoy, en el viaje y en cada parada: el retraso vive en
  `trip_updates` de GTFS-RT y este endpoint solo lee el GTFS estático.
- `404` también cubre «el viaje existe pero ese día no circula»: la fecha se resuelve con
  `calendarios` + `calendario_excepciones`.
- `tipo` y `numero` siguen la misma regla que en `/trenes` (`numero` puede ser `null`).

## GET /trenes/:feed/:tripId/posicion

Descripción: última posición conocida del tren que hace ese viaje **ahora**.
Auth: **no**

> **El `tripId` de GTFS-RT es el `trip_id` del GTFS estático.** Comprobado el 27/10 contra el
> `trips.txt` real de AVE/LD de Renfe: `0327212026-10-26` existe tal cual. Es decir, el `tripId` que
> devuelve `/posiciones` se puede pasar **directo** a esta ruta: el mapa puede enlazar a la ficha
> del viaje. Confirmado solo en `avld`; en `cercanias` falta el GTFS estático para comprobarlo
> (el `Fichero_CERCA` público da 404), aunque el formato encaja.

Response 200:

```json
{
  "feed": "avld",
  "tripId": "0327212026-10-26",
  "vehicleId": "03272",
  "lat": 40.399803,
  "lon": -3.6778688,
  "rumbo": null,
  "velocidadKmh": null,
  "estado": "IN_TRANSIT_TO",
  "paradaActual": "60000",
  "retrasoSeg": 2280,
  "actualizado": "2026-10-27T10:27:18+01:00"
}
```

Errores: `400` `feed` no es `avld`/`cercanias` · `404` el viaje no está circulando ahora o Renfe no
publica su posición · `503` Renfe no responde y no hay datos previos.

Notas:

- `estado` es el enum de GTFS-RT (`INCOMING_AT`, `STOPPED_AT`, `IN_TRANSIT_TO`). Si no se conoce el
  rumbo o la velocidad, `null`.
- `paradaActual` es el **`stop_id` del feed**, no el `id` unificado de `estaciones`. Para `avld`
  coinciden; para `cercanias` **no**: para traducirlo a una estación hay que pasar por
  `estacion_feeds`. Hasta que exista la BD, la web solo puede mostrar el id.
- El viaje se busca en el snapshot de `/posiciones`, así que no gasta ni una consulta más a Renfe.

## GET /incidencias

Descripción: avisos y alertas del feed GTFS-RT.
Auth: **no**

Request (query): `feed` (opcional), `linea` (opcional, `route_short_name`), `limit` (1–50, def 20).

Response 200:

```json
{
  "datos": [
    {
      "id": "AVISO_518335",
      "feed": "avld",
      "titulo": "Retrasos por incidencia en la línea",
      "descripcion": "Texto tal y como lo publica Renfe",
      "causa": "MAINTENANCE",
      "efecto": "DELAY",
      "inicio": "2026-10-26T06:00:00+01:00",
      "fin": null,
      "lineas": ["AVE 02070"],
      "paradas": ["60000"]
    }
  ],
  "total": 69
}
```

Errores: `400` `limit` fuera de rango · `503` BD caída.

Notas: `causa` y `efecto` son enums de GTFS-RT en inglés (se exponen tal cual, sin traducir). El
texto viene en el idioma que publique Renfe.

## GET /posiciones

Descripción: snapshot de posiciones, filtrable por caja geográfica. **Alternativa** a Supabase
Realtime: si se usa el Realtime del ADR-001, este endpoint no existe.
Auth: **no**

Request (query): `bbox` (`minLon,minLat,maxLon,maxLat`), `feed` (opcional), opcionalmente `linea`.

Response 200:

```json
{
  "datos": [
    {
      "feed": "cercanias",
      "vehicleId": "23537",
      "tripId": "3097L23537C1",
      "lat": 37.18487,
      "lon": -5.79046,
      "rumbo": 45,
      "velocidadKmh": 78,
      "estado": "INCOMING_AT",
      "paradaActual": "60000",
      "retrasoSeg": 180,
      "actualizado": "2026-10-26T12:00:30+01:00"
    }
  ],
  "actualizado": "2026-10-26T12:00:30+01:00"
}
```

Errores: `400` `bbox` mal formada o con los mínimos al revés · `503` Renfe no responde **y** no hay
datos previos.

Notas:

- `bbox` es siempre opcional. Hoy el feed completo son ~500 posiciones (210 AVE/LD + 298
  Cercanías), así que la regla de «obligatoria si hay más de 500» no se aplica.
- La API **sondea Renfe cada `GTFS_RT_POLL_SECONDS` (30 s por defecto) en memoria**, sin worker y
  sin BD: `/posiciones` funciona aunque Supabase esté caído. Cada intervalo son **4 descargas**
  (posiciones + retrasos de los dos feeds) y se comparten entre todas las peticiones simultáneas.
- Si falla el feed de **retrasos** pero no el de posiciones, se sirve el mapa igual con `retrasoSeg`
  a `null`: el retraso es un extra, la posición no.
- Si Renfe falla, se sigue sirviendo el último snapshot bueno y `actualizado` deja de avanzar. Solo
  hay `503` si nunca se ha podido leer.
- `actualizado` es el del feed **más antiguo** de los dos: es el que se queda corto.
- `rumbo` y `velocidadKmh` son `null` **siempre** hoy: el feed JSON de Renfe no publica ni `bearing`
  ni `speed`. `retrasoSeg` **sí es real**: sale de `trip_updates` (`GTFS_RT_URL_RETRASOS_*`), cruzado
  por `tripId`, y es `null` solo si ese viaje no lo publica. **Puede ser negativo** (tren adelantado),
  así que la web no debe tratarlo como «0 o tarde».
- Un mismo `vehicleId` aparece varias veces con `tripId` distintos (un tren encadenando viajes): no
  se deduplica, cada fila es un viaje.
- `tripId` es el de GTFS-RT tal cual, que **sí coincide** con el `trip_id` del GTFS estático
  (comprobado contra el `trips.txt` real de AVE/LD). Se puede pasar directo a
  `/trenes/:feed/:tripId` y a `/trenes/:feed/:tripId/posicion`.
- `paradaActual` es el `stop_id` del feed, no el `id` unificado de `estaciones` (ver la nota de
  `/trenes/:feed/:tripId/posicion`).

### Campos del viaje para el mapa — aceptado (Rubén, 2026-10-27) · **implementado (Alex, 2026-10-29)**

Al pulsar un tren, la web quiere enseñar **qué tren es, de dónde sale, adónde va, la próxima parada
y las horas**. Alex propuso estos campos y la web ya los lee (`frontend/web/src/api/cliente.ts`,
`aPosicion`) ocultando los que lleguen vacíos. **La forma se acepta tal cual**: añadir campos
opcionales no rompe nada, así que se pueden ir rellenando sin tocar la web.

```json
{
  "nombre": "AVE 02070",
  "linea": "C-4",
  "origen": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
  "destino": { "id": "71801", "nombre": "Barcelona-Sants" },
  "proximaParada": { "id": "04040", "nombre": "Zaragoza-Delicias", "llegada": "2026-10-27T12:41:00+01:00" },
  "llegadaDestino": "2026-10-27T14:05:00+01:00"
}
```

**Estado: los seis son `null` hoy.** No es que falte código: **los seis salen del GTFS estático**, que
vive en Supabase, y Supabase no tiene migraciones todavía. `vehicle_positions` solo publica
`tripId`, `vehicleId`, `stopId`, latitud y longitud: ni nombres de estación ni horas.

De dónde sale cada uno cuando exista la BD:

| Campo | Origen |
|---|---|
| `nombre` | `rutas.nombre_corto` del viaje (`AVE 02070`) |
| `linea` | `rutas.nombre_corto` en `cercanias` (`C-4`); `null` en `avld` |
| `origen` | primera parada del viaje en `horarios` + `estaciones.nombre` |
| `destino` | última parada del viaje en `horarios` + `estaciones.nombre` |
| `proximaParada` | primera parada con `secuencia > paradaActual.secuencia`, con su `llega` |
| `llegadaDestino` | `llega` de la última parada |

Dos avisos:

- `paradaActual` (el `stopId` de GTFS-RT) es el `stop_id` **del feed**, no el `id` unificado de
  `estaciones`. Para traducirlo hace falta `estacion_feeds`, que también es BD. Sin eso no hay ni
  `proximaParada.nombre` ni `origen`/`destino`.
- Las horas, cuando lleguen, van **con el retraso aplicado** si se conoce, y con offset de Madrid.

**Implementado el 29/10** (`backend/api/src/modules/posiciones/enriquecer.ts`): `/posiciones` y
`/trenes/:feed/:tripId/posicion` cruzan cada posición con `viajes`, `rutas`, `horarios`,
`estacion_feeds` y `estaciones` en **una consulta por feed y por refresco** del snapshot. Sin BD, o si
el viaje no está en el catálogo (p. ej. los `SPECIAL_*` del día o Cercanías, que no está cargado), los
seis campos van a `null` como antes. Detalles:

- `nombre` = `rutas.nombre_corto` + `viajes.numero` (`AVE 03301`): en el feed real `nombre_corto` solo
  trae el producto (`AVE`).
- `proximaParada`: si el tren está `STOPPED_AT` es la siguiente a `paradaActual`; si va `IN_TRANSIT_TO`
  es la propia `paradaActual`.
- Dos campos nuevos, opcionales y aditivos:
  - `estadoHorario`: `a_tiempo` (|retraso| < 3 min), `retraso`, `adelanto` o `sin_datos`.
  - `retrasoFuente`: `renfe` (trip_updates de GTFS-RT, manda siempre), `horario` (Renfe no lo da y se
    estima con el horario de la BD en la parada actual) o `null`.
- La estimación por horario es un **mínimo**: solo cuenta lo que el tren ya va tarde en su parada. Contra
  el retraso de Renfe el 29/10 dio un error mediano de 4 min (p90 18 min), así que es solo el plan B.

**`velocidadKmh` y `rumbo` se quedan** (siempre `null`), aunque Alex propuso quitarlos: `aPosicion`
todavía los mapea (`rumbo: p.rumbo ?? 0`) y quitarlos no arregla nada. Quedan como obsoletos; se
pueden borrar cuando la web deje de leerlos.

## POST /reservas

Descripción: crea una reserva **pagada** (el pago es simulado: no hay Stripe) y emite **un billete con
QR firmado por pasajero**. La API genera la plantilla de butacas del viaje y fecha si no existe, asigna
las libres con `for update skip locked` y calcula el precio simulado y determinista del trayecto.
Auth: **sí**

Request:

```json
{
  "feed": "avld",
  "viajeId": "3097L23537C1",
  "fecha": "2026-11-02",
  "origenId": "60000",
  "destinoId": "04040",
  "pasajeros": [
    { "nombre": "Lucía Pérez Gómez", "documento": "12345678Z" }
  ]
}
```

`pasajeros` va de 1 a 6: **una butaca por pasajero**. La butaca la elige la API (primeras libres por
coche y número); el `documento` solo se enmascara en el QR (`••••678Z`).

Response 201:

```json
{
  "id": "9b2f…",
  "localizador": "R-7K3M9Q",
  "estado": "pagada",
  "total": 45.0,
  "creada": "2026-10-29T10:00:00+01:00",
  "billetes": [
    {
      "id": "1c4a…",
      "qr": "RNF1.eyJ2IjoxLCJpZCI6…",
      "coche": 1, "asiento": "1A", "clase": "Confort", "precio": 45.0
    }
  ]
}
```

Errores: `400` fecha pasada, origen = destino o pasajeros fuera de rango · `401` sin token · `404` el
viaje no circula ese día o el trayecto no existe · `409` no quedan butacas · `503` BD caída.

Notas: `estado` es siempre `pagada` mientras el pago sea simulado. La reserva, las butacas y los
billetes se escriben en **una transacción**: si falla algo, no queda nada a medias. `expira_en` del
billete es la fecha de servicio + 26 h.

## GET /billetes

Descripción: mis billetes, del más nuevo al más viejo.
Auth: **sí**

Response 200:

```json
{
  "datos": [
    {
      "id": "1c4a…", "localizador": "R-7K3M9Q", "estado": "valido",
      "tipo": "AVE", "numero": "02070",
      "salida": "2026-11-02T07:15:00+01:00", "llegada": "2026-11-02T09:40:00+01:00",
      "origen": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
      "destino": { "id": "04040", "nombre": "Zaragoza-Delicias" },
      "coche": 3, "asiento": "12A", "clase": "Turista",
      "precio": 45.0,
      "emitido": "2026-10-29T10:00:00+01:00",
      "expira": "2026-11-03T02:00:00+01:00",
      "qr": "RNF1.eyJ2IjoxLCJpZCI6…"
    }
  ],
  "total": 1
}
```

Errores: `401` sin token · `503` BD caída. `estado` es el de `billetes` (`valido` | `usado` |
`anulado` | `caducado`). `numero` puede ser `null`.

## GET /billetes/:id/qr

Descripción: QR firmado de un billete **propio**. Se devuelve el token guardado en BD, así que es
idempotente (misma petición, mismo QR).
Auth: **sí**

Response 200: `{ "id": "1c4a…", "qr": "RNF1.eyJ2IjoxLCJpZCI6…" }`

Errores: `401` sin token · `404` no existe o es de otro usuario.

## Formato del QR del billete — propuesto (Alex, 2026-10-27)

`RNF1.<datos>.<firma>`, con `datos` y `firma` en base64url. `firma` firma el texto `RNF1.<datos>`.

- **API real:** Ed25519 con `QR_SIGNING_PRIVATE_KEY` (ver `.env.example`). La web nunca tiene la clave privada.
- **Sin API (simulado):** HMAC-SHA256 con una clave de demostración en la web
  (`frontend/web/src/api/qr-billete.ts`). Detecta QR manipulados en la demo, pero no es seguridad real.
- **Implementado (2026-10-29):** mientras no existan las claves Ed25519, la API firma con
  **HMAC-SHA256** y `QR_SIGNING_SECRET` (secreto nuevo, ver `.env.example`). El formato del token y
  las claves de `datos` son los mismos: cambiar a Ed25519 solo toca `common/qr/firma.ts`.
- `datos` es JSON con claves cortas para que el QR sea pequeño:

| Clave | Contenido |
|---|---|
| `v` | versión, `1` |
| `id`, `rid`, `loc` | id del billete, id de la reserva, localizador |
| `tipo`, `num` | tipo y número del tren |
| `sal`, `lle` | salida y llegada (ISO con offset) |
| `o`, `d` | nombres de origen y destino |
| `co`, `as`, `cl` | coche, asiento (`12A`) y clase |
| `p`, `doc` | nombre del viajero y documento **enmascarado** (`••••678Z`) |

## POST /billetes/validar — implementado (2026-10-29) · propuesto por Alex (2026-10-27)

> **Ampliado (Alex, 2026-10-28):** también acepta QR de abonos (prefijo `RNA1.`). Estados nuevos: `agotado` (bono sin viajes) y `otro_dia` (abono aún no vigente). Con un abono válido la respuesta trae `abono` (tipo, titular enmascarado, trayecto, validez y viajes restantes) y, si es un bono, se descuenta un viaje.

Descripción: el revisor escanea el QR; la API comprueba firma, existencia, estado de la reserva y
fechas, y **apunta la validación** (la primera vez).
Auth: **sí**, rol `revisor` o `admin` (`403` si no).

Request:

```json
{ "qr": "RNF1.eyJ2IjoxLCJpZCI6…" }
```

Response 200 (siempre 200 si el QR se ha podido procesar; el veredicto va en `estado`):

```json
{
  "estado": "valido",
  "billete": {
    "id": "HDBW9K-1", "localizador": "HDBW9K",
    "pasajero": "Lucía Pérez Gómez", "documento": "••••678Z",
    "tipo": "AVE", "numero": "03142",
    "salida": "2026-11-02T07:15:00+01:00", "llegada": "2026-11-02T09:40:00+01:00",
    "origen": "Madrid-Puerta de Atocha", "destino": "Barcelona-Sants",
    "coche": 3, "asiento": "12A", "clase": "Confort"
  },
  "validadoEn": "2026-11-02T07:20:11+01:00",
  "primeraValidacion": null,
  "comprobadoEnServidor": true
}
```

| `estado` | Cuándo | `billete` |
|---|---|---|
| `valido` | firma OK, existe, pagado, es hoy y no se había validado | sí |
| `ya_validado` | igual, pero ya tenía validación (`primeraValidacion` = la primera) | sí |
| `otro_dia` | el viaje es otro día | sí |
| `caducado` | más de 2 h después de la llegada | sí |
| `anulado` | la reserva está cancelada o reembolsada | sí |
| `falso` | no es `RNF1` o la firma no cuadra | no |
| `no_existe` | firma OK pero el billete no está en la BD | sí (lo que dice el QR) |

Errores: `400` sin `qr` · `401` sin token · `403` sin rol de revisor.

Notas: la tabla `validaciones` (migración `20261029120000_billetes_y_abonos.sql`) es **append-only** y
guarda también los intentos fallidos (`falso`, `no_existe`); `billetes.estado` es el estado actual.
La web ya lo consume en `cliente.ts` (`validarBillete`). `comprobadoEnServidor` va siempre en `true`.
El orden del veredicto de un billete es: anulado → caducado → otro día → ya validado → válido. Al
validar por primera vez se marca `billetes.estado = 'usado'`. Un abono `bono-10` descuenta un viaje
por lectura; los ilimitados no. `motivo` solo se rellena en los rechazos que no tienen fila detrás.

## GET /admin/resumen — propuesto (Alex, 2026-10-27)

Auth: **sí**, rol `admin`. Response 200: `billetesVendidos`, `reservas`, `reservasCanceladas`,
`ingresos` (euros), `validaciones`, `usuarios` y `ultimasReservas[]` (`localizador`, `trayecto`,
`total`, `estado`, `creada`). Tipo `ResumenAdmin` en `frontend/web/src/api/tipos.ts`. El resto del
panel (usuarios y roles, anular reservas, avisos) se detalla en el próximo sprint.

## Abonos y bonos — implementado (2026-10-29) · propuesto por la web (Alex, 2026-10-28)

Abonos y bonos como los de Renfe, **simulados** como los billetes. Auth: **sí** en las tres rutas;
cada usuario solo ve los suyos (`404` si el id es de otro).

| `tipo` | Nombre | Trayecto | Validez | Viajes |
|---|---|---|---|---|
| `ave-ld-mensual` | Abono mensual AVE/Larga Distancia | sí | 30 días | ilimitados |
| `avant-mensual` | Abono mensual Avant | sí | 30 días | ilimitados |
| `cercanias-recurrente` | Abono recurrente Cercanías | no | 30 días | ilimitados |
| `bono-10` | Bono 10 viajes | sí | 60 días | 10 |

Objeto `Abono` (tipo en `frontend/shared/api/tipos.ts`):

```json
{
  "id": "AB-7K2M9Q", "tipo": "bono-10", "nombre": "Bono 10 viajes",
  "origen": { "id": "60000", "nombre": "Madrid-Puerta de Atocha" },
  "destino": { "id": "04040", "nombre": "Zaragoza-Delicias" },
  "inicio": "2026-11-01", "fin": "2026-12-30",
  "viajesTotales": 10, "viajesRestantes": 10,
  "precio": 220, "creado": "2026-10-28T10:00:00+01:00",
  "qr": "RNA1.eyJ2IjoxLCJpZCI6…"
}
```

`origen` y `destino` van a `null` en `cercanias-recurrente`; `viajesTotales` y `viajesRestantes`,
a `null` en los abonos sin límite. `fin` es el último día válido (inclusive).

### GET /abonos

Response 200: `{ "datos": Abono[], "total": n }`, del más nuevo al más viejo.

### POST /abonos

Request: `{ "tipo": "bono-10", "origenId": "60000", "destinoId": "04040", "inicio": "2026-11-01" }`.
La API calcula `fin` (inicio + 30 días, o + 60 en `bono-10`, con el último día inclusive), `precio` y
los viajes. **Sin Stripe** el abono nace `activo` y con su QR firmado; cuando exista el pago se
cambiará a `pendiente` + activación por webhook como una reserva.
Response 201: el `Abono`.
Errores: `400` tipo desconocido, falta trayecto, origen = destino, `inicio` pasado o a más de 60
días, o trayecto enviado en `cercanias-recurrente` · `401` sin token · `404` estación inexistente.

Notas: precios simulados y cerrados: `ave-ld-mensual` 380 €, `avant-mensual` 230 €,
`cercanias-recurrente` 60 € y `bono-10` 220 €.

### GET /abonos/:id

Response 200: el `Abono` con `qr` firmado. Errores: `401` · `404` si no existe o es de otro usuario.

### QR del abono

Mismo esquema que el del billete, con prefijo `RNA1`: `RNA1.<datos>.<firma>`. `datos` lleva
`v`, `id`, `t` (tipo), `o`/`d` (nombres o `null`), `ini`/`fin`, `vr` (viajes restantes o `null`)
y `p` (nombre del titular). El revisor ya acepta `RNA1` en `POST /billetes/validar`.

### Preferencia «Usar mi cara para validar»

Sin endpoint de momento: la web solo la guarda en el navegador y solo se puede activar si el
usuario tiene la cara registrada. Cuando haya tornos faciales hará falta guardarla en la API.

## POST /auth/cara/registrar

Descripción: guarda la plantilla facial del usuario autenticado. **Una sola vez**: si ya existe, no se
puede cambiar (el `reset` lo hace un `admin`). El vector lo calcula el dispositivo; la imagen nunca
sale de él.
Auth: **sí** (token del login con contraseña)

Request:

```json
{
  "embedding": [0.031, -0.118, 0.204],
  "modelo": "arcface/buffalo_l"
}
```

`embedding`: exactamente **512** floats (ArcFace). `modelo` tiene que ser el de `config_cara`.

Response 204: sin cuerpo.

Errores: `400` embedding de otra dimensión, vector vacío o modelo distinto · `401` token ausente o
inválido · `404` el usuario no existe · `409` la cara ya estaba registrada · `503` BD caída.

Notas:

- La API solo llama a `registrar_cara(...)` en Postgres, que valida dimensión, modelo, normaliza
  (L2 = 1) y hace el alta. La tabla no tiene políticas RLS: ni `anon` ni `authenticated` pueden leerla.
- Cada fallo de la función trae su **SQLSTATE**, así que la API no compara textos:
  `RF001` modelo distinto → 400 · `RF002` dimensión → 400 · `RF003` vector vacío → 400 ·
  `RF004` ya registrada → 409 · `RF005` usuario inexistente → 404 · `RF006` no autorizado → 403.
- Si el registro sale mal (foto borrosa), solo un `admin` puede borrarlo con `/auth/cara/reset`.

## POST /auth/cara/reset

Descripción: borra la plantilla facial de un usuario para que pueda volver a registrarse. Es la única
forma de rehacer un registro malo, porque la cara no se puede cambiar.
Auth: **sí**, y el token tiene que ser de un `admin`.

Request:

```json
{ "usuarioId": "6f1c…" }
```

Response 204: sin cuerpo.

Errores: `400` falta `usuarioId` · `401` token ausente o inválido · `403` el que llama no es `admin` ·
`503` BD caída.

Notas: la API pasa su propio `sub` y el `usuarioId` a `resetear_cara(...)`, y **Postgres** comprueba el
rol contra `app_metadata`; la API no decide nada. Si el usuario no tenía plantilla, no hace nada.

## POST /auth/cara/verificar

Descripción: login facial. Compara el vector con la plantilla del email y, si coincide, devuelve una
sesión.
Auth: **no** (es el propio login)

Request:

```json
{
  "email": "ana@ejemplo.es",
  "embedding": [0.031, -0.118, 0.204]
}
```

Response 200: mismo shape que `/auth/login`.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "6f1c…",
    "nombre": "Ana",
    "email": "ana@ejemplo.es",
    "rol": "viajero",
    "caraRegistrada": true
  }
}
```

Errores: `400` embedding inválido · `401` **siempre el mismo mensaje**, sea «no hay plantilla», «no
coincide» o «modelo distinto» · `503` BD caída.

Notas:

- La decisión es de Postgres (`verificar_cara`): umbral de `config_cara` y similitud coseno de pgvector.
- **No se devuelve la similitud.** Un número de similitud por intento es un oráculo que permite
  reconstruir la plantilla probando vectores; se mide con SQL cuando toque ajustar el umbral.
- El token es el mismo formato que el de la contraseña (HS256 con el secreto compartido), así que hay
  un solo guard. Ver [[ADR-007-reconocimiento-facial]].
- No hay límite de intentos todavía (fase F7): el facial es alternativa a la contraseña, nunca el
  único factor.

## Pendientes de detallar

`/trenes/:feed/:tripId/asientos`, `/pagos/*`, `/admin/resumen` y `/chatbot/mensaje` no dependen de
GTFS. Se detallan en el sprint que los implemente, siempre aquí antes del código.

## Historial

- 2026-10-29 — Implementados `/auth/registro`, `/auth/login`, `/reservas`, `/billetes`,
  `/billetes/:id/qr`, `/billetes/validar` y las tres rutas de `/abonos`. QRs firmados con
  HMAC-SHA256 (`QR_SIGNING_SECRET`) hasta que existan las claves Ed25519. Los abonos nacen `activo`
  mientras no haya Stripe.
- 2026-10-28 — Propuestas por la web `GET/POST /abonos` y `GET /abonos/:id` (Alex).
- 2026-10-28 — Detallados `/auth/cara/registrar`, `/auth/cara/verificar` y `/auth/cara/reset`
  (ADR-005: ArcFace 512, lógica en Postgres, JWT propio).
- 2026-10-26 — Añadidas y detalladas las 6 rutas de datos (estaciones, viajes, posiciones, incidencias).
  Renombradas a `/trenes/:feed/:tripId` para evitar ids compuestos en la URL.
- 2026-10-26 — Creado el catálogo inicial con 17 rutas propuestas.

## Formas de respuesta usadas por la web (pendiente de alinear)

La web (`frontend/web/src/api/tipos.ts`) consume con datos simulados `Estacion`, `Tren`, `Asiento`, `Reserva`, `IntentoPago`, `Billete`, `Sesion` y `PosicionTren`. Al integrar con la API, **manda este contrato**: el detalle de tren es `GET /trenes/:feed/:tripId` (no `/trenes/:id`) y las posiciones del mapa son `GET /posiciones` (no `/tiempo-real/trenes`). Alex adapta `tipos.ts`; si a la web le falta algún campo, lo propone aquí antes de tocar código.
