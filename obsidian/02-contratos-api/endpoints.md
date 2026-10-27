---
responsable: Rubén
estado: borrador
tags: [contrato, api]
---

# 🔌 Endpoints de la API

> **Fuente de verdad** entre frontend y backend. Se actualiza ANTES de implementar.
> Base URL local: `http://localhost:3000` · Auth: `Authorization: Bearer <jwt de Supabase>`
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

## Autenticación

- El token lo emite **Supabase Auth**; la API solo lo verifica (HS256 con `SUPABASE_JWT_SECRET`).
- Identidad: `sub` (uuid de usuario) y `email`.
- Rol: claim `app_metadata.rol` → `"viajero"` (por defecto) o `"revisor"`.
- Los endpoints públicos no llevan token. Los privados exigen `Authorization: Bearer <jwt>`.


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
| GET | `/estaciones?q=&feed=` | Autocompletar estaciones | propuesto · **detallado** |
| GET | `/trenes?origen=&destino=&fecha=` | Buscar viajes directos | **implementado** · **detallado** |
| GET | `/trenes/:feed/:tripId?fecha=` | Detalle de un viaje con paradas y retraso | propuesto · **detallado** |
| GET | `/trenes/:feed/:tripId/posicion` | Última posición del tren | propuesto · **detallado** |
| GET | `/incidencias?feed=&linea=` | Avisos GTFS-RT | propuesto · **detallado** |
| GET | `/posiciones?bbox=&feed=` | Posiciones para el mapa (alternativa al Realtime) | **implementado** · **detallado** |
| GET | `/health` | Estado del servicio (infra) | implementado |
| POST | `/auth/registro` | Alta de usuario | propuesto |
| POST | `/auth/login` | Login email/contraseña | propuesto |
| POST | `/auth/cara/registrar` | Guardar embedding facial | propuesto |
| POST | `/auth/cara/verificar` | Login facial | propuesto |
| GET | `/trenes/:feed/:tripId/asientos?fecha=` | Asientos disponibles (simulado) | propuesto |
| POST | `/reservas` | Crear reserva | propuesto |
| POST | `/pagos/intent` | PaymentIntent Stripe test | propuesto |
| POST | `/pagos/webhook` | Webhook de Stripe | propuesto |
| GET | `/billetes` | Mis billetes | propuesto |
| GET | `/billetes/:id/qr` | QR firmado | propuesto |
| POST | `/billetes/validar` | Revisor valida un QR | propuesto |
| POST | `/chatbot/mensaje` | Mensaje al chatbot | propuesto |

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

Errores: `400` falta `fecha` · `404` viaje o fecha inexistente · `503` BD caída.

Notas: `llega` es `null` en la primera parada y `sale` en la última.

## GET /trenes/:feed/:tripId/posicion

Descripción: última posición conocida del tren que hace ese viaje **hoy**.
Auth: **no**

Response 200:

```json
{
  "feed": "cercanias",
  "tripId": "3097L23537C1",
  "vehicleId": "23537",
  "lat": 37.18487,
  "lon": -5.79046,
  "rumbo": 45,
  "velocidadKmh": 78,
  "estado": "INCOMING_AT",
  "paradaActual": "51200",
  "retrasoSeg": 180,
  "actualizado": "2026-10-26T12:00:30+01:00"
}
```

Errores: `404` el viaje no circula ahora o no hay dato (Renfe caída / feed sin esa posición).

Notas: `estado` es el enum de GTFS-RT (`INCOMING_AT`, `STOPPED_AT`, `IN_TRANSIT_TO`). Si no se
conoce el rumbo o la velocidad, `null`.

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
  sin BD: `/posiciones` funciona aunque Supabase esté caído. Las dos peticiones del intervalo se
  agrupan en una sola descarga.
- Si Renfe falla, se sigue sirviendo el último snapshot bueno y `actualizado` deja de avanzar. Solo
  hay `503` si nunca se ha podido leer.
- `actualizado` es el del feed **más antiguo** de los dos: es el que se queda corto.
- `rumbo` y `velocidadKmh` son `null` **siempre** hoy: el feed JSON de Renfe no publica ni `bearing`
  ni `speed`. `retrasoSeg` es `null` porque el retraso vive en `trip_updates`, que no se lee.
- Un mismo `vehicleId` aparece varias veces con `tripId` distintos (un tren encadenando viajes): no
  se deduplica, cada fila es un viaje.
- `tripId` es el de GTFS-RT tal cual (`0029112026-10-27`), que **no coincide** con el `trip_id` del
  GTFS estático (`3097L23537C1`): no se puede cruzar con `viajes` por id. Para el mapa da igual;
  para `/trenes/:feed/:tripId/posicion` es un bloqueo.

## Pendientes de detallar

`/auth/*`, `/trenes/:feed/:tripId/asientos`, `/reservas`, `/pagos/*`, `/billetes*` y `/chatbot/mensaje`
no dependen de GTFS. Se detallan en el sprint que los implemente, siempre aquí antes del código.

## Historial

- 2026-10-26 — Añadidas y detalladas las 6 rutas de datos (estaciones, viajes, posiciones, incidencias).
  Renombradas a `/trenes/:feed/:tripId` para evitar ids compuestos en la URL.
- 2026-10-26 — Creado el catálogo inicial con 17 rutas propuestas.

## Formas de respuesta usadas por la web (pendiente de alinear)

La web (`frontend/web/src/api/tipos.ts`) consume con datos simulados `Estacion`, `Tren`, `Asiento`, `Reserva`, `IntentoPago`, `Billete`, `Sesion` y `PosicionTren`. Al integrar con la API, **manda este contrato**: el detalle de tren es `GET /trenes/:feed/:tripId` (no `/trenes/:id`) y las posiciones del mapa son `GET /posiciones` (no `/tiempo-real/trenes`). Alex adapta `tipos.ts`; si a la web le falta algún campo, lo propone aquí antes de tocar código.
