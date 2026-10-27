---
fecha: 2026-10-26
autor: Rubén (con OpenCode)
area: api
para: Marina
rama: docs/api-respuestas-modelo-datos
pr: pendiente de abrir a mano (en este PC no hay `gh`)
tags: [handoff, contrato, base-datos]
---

# Handoff — Respuestas a las preguntas del modelo de datos (§10.2)

> Las preguntas 5–8 viven en `obsidian/02-contratos-api/modelo-datos.md` de la rama
> `docs/db-borrador-modelo-datos` (todavía sin PR), **no en `develop`**: desde `develop` no se ven.
> Las de Rubén (5, 6 y 7) quedan cerradas aquí, listas para pegar. La 8 es de Kevin.

## Qué se hizo

Respuestas de Rubén a las preguntas 5, 6 y 7 de §10.2, con el porqué, para que se peguen en
§10.2 → §10.1 antes de abrir el PR.

### 5. `tipo_servicio` — heurística en el worker, sin tabla manual

- En el feed `cercanias` no hay nada que deducir: todo es `cercanias`.
- En `avld` se clasifica por palabras clave sobre `route_short_name` + `route_long_name`
  normalizados (mayúsculas, sin acentos), con precedencia
  AVE > AVLO > AVANT > ALVIA > INTERCITY > MEDIA DISTANCIA > REGIONAL, y `otro` de último recurso.
- El worker escribe en el log cuántas rutas caen en cada valor y **cuáles caen en `otro`**: se
  ajusta la lista en una línea y se reimporta, sin tocar la BD.
- Descarto la tabla manual: son ~100 filas que habría que revisar en cada importación para un dato
  que solo elige icono y precio simulado.

### 6. Caducidad del QR — fin del día de servicio + 2 h

- `billetes.expira_en = fecha_servicio + interval '26 hours'` → las 02:00 del día siguiente
  (Europe/Madrid). Cubre los viajes que GTFS marca como `24:xx`/`25:xx` y un retraso normal.
- Se calcula al emitir el billete (en la transacción del webhook, §5.3) y la misma marca va en el
  `exp` del QR.
- El barrido pasa a `caducado` los billetes con `estado = 'valido'` y `expira_en < now()`.

### 7. Nombres de las horas — se quedan como están

- `llega`/`sale` y `recoge`/`deja` son 1:1 con `arrival_time`, `departure_time`, `pickup_type` y
  `drop_off_type`, y la consulta de §4.6 se lee sola (`o.sale`, `d.llega`, `o.recoge and d.deja`).
- Cambiarlos ahora obliga a tocar migración, worker y DTOs sin ganar nada.
- La UI no ve estos nombres: la API devuelve `llegada`/`salida` como ISO 8601 con offset, como ya
  está en [[endpoints]].

## Tres huecos que hay que cerrar antes de la migración

1. **`reservas.fecha_servicio` (`date`, no nulo).** Sin ella no hay caducidad de QR (punto 6) ni se
   sabe qué día viaja el usuario, y `GET /trenes?...&fecha=` ya trabaja por fecha. Índice
   `(usuario_id, fecha_servicio)` para «mis viajes». `billetes` no la necesita: hereda `expira_en`.
2. **`asientos` bloquea la butaca para siempre.** La clave es `UNIQUE (viaje_id, coche, numero)` y
   `viaje_id` es plantilla sin fecha, así que reservar la 12 del AVE 03070 la deja ocupada **todos
   los días**. Tendría que ser `(viaje_id, fecha_servicio, coche, numero)`, con la generación
   perezosa por viaje + fecha que ya plantea §5.1. Es el cambio de clave más urgente.
3. **`feed` (`cercanias` | `avld`) y `incidencias`.** Mi contrato de [[endpoints]] (rama
   `docs/api-arquitectura-renfe`) da el feed por hecho: `/trenes/:feed/:tripId`, `posiciones_trenes`
   con feed y `GET /incidencias` (GTFS-RT Alerts), que no tiene tabla en el modelo. Si `feed` entra,
   las claves naturales pasan a `(feed, id)` —la misma Atocha tiene `stop_id` distinto en cada
   feed—. Si prefieres no meterlo, dímelo y lo quito de [[endpoints]]: lo que no vale es que un
   contrato lo dé por hecho y el otro no. Contexto en §9 de `docs/arquitectura.md`.

## Qué queda

- **Marina:** pegar 5–7 en §10.2 → §10.1, decidir los tres huecos y arrancar la primera migración.
- **Kevin:** pregunta 8 (¿`payment_intent_id` + `ultimo_evento_stripe` bastan para el webhook test?).
- **Rubén:** `/estaciones` y `/trenes` en cuanto existan tablas.

## Bloqueos / preguntas para otros

- Para Marina: confirmar `fecha_servicio` y `feed` antes de la migración; son las dos que cambian
  claves y las caras de deshacer después.

## Cambios en contratos

Ninguno en esta rama: las respuestas se aplican a [[modelo-datos]] en
`docs/db-borrador-modelo-datos`, que es donde vive el documento.

## Ficheros tocados

- `obsidian/04-handoffs/2026-10-26-ruben-respuestas-modelo-datos.md`
- `obsidian/01-estado/estado-equipo.md` (solo mi fila)
