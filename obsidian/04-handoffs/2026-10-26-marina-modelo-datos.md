---
fecha: 2026-10-26
autor: Marina (con OpenCode)
area: database
para: todos
rama: docs/db-borrador-modelo-datos
pr: (pendiente de abrir)
tags: [handoff, contrato, base-datos]
---

# Handoff — Modelo de datos (contrato cerrado salvo Kevin)

## Qué se hizo
- [[modelo-datos]] pasa de «tablas previstas» a **contrato completo**: 16 tablas (+ `auth.users` de
  Supabase) con columnas, tipos, nullabilidad, claves, RLS, índices y el motivo de cada decisión.
- **Respuestas de Alex integradas:** retención de butaca 15 min, un QR por butaca, sin histórico de
  posiciones y la **regla del webhook** (comprueba `expira_en` antes de emitir billetes, con los
  cuatro casos y el reembolso si la reserva ya caducó).
- **Respuestas de Rubén integradas:** `tipo_servicio` por heurística en el worker, caducidad del QR
  a `fecha_servicio + 26 h` y nombres `llega`/`sale` y `recoge`/`deja` confirmados.
- **Sus tres huecos, cerrados** (ver abajo): `feed` en las claves, `reservas.fecha_servicio`,
  butaca por viaje **y fecha** y tabla `incidencias`.
- [[eventos-realtime]] actualizado: el payload ahora lleva `feed` (dos feeds comparten `trip_id`).

## Los tres huecos de Rubén y cómo quedan

1. **`feed` en las claves naturales: sí.** Renfe publica dos feeds (`cercanias` y `avld`) y el mismo
   `stop_id`/`trip_id` no significa lo mismo en cada uno, así que la clave pasa a `(feed, id)` en
   `rutas`, `calendarios`, `viajes` y `posiciones_trenes`, y lo que apunta a un viaje lleva `feed`.
   **Las estaciones se quedan unificadas** (una Atocha, no dos) con la tabla puente
   `estacion_feeds (estacion_id, feed, stop_id)`: eso es lo que permite el `feeds[]` que ya promete
   `GET /estaciones`. El `id` de estación es opaco a propósito ([[endpoints]] no garantiza que sea
   un `stop_id`).
2. **`reservas.fecha_servicio`: añadida** (`date`, no nulo) con índice `(usuario_id, fecha_servicio)`.
   Sin ella no hay caducidad de QR ni «mis viajes».
3. **Butaca bloqueada todos los días: corregido.** La clave de `asientos` pasa a
   `(feed, viaje_id, fecha_servicio, coche, numero)` y la generación perezosa es por viaje + fecha.
   Era un fallo real del borrador: `viaje_id` es plantilla, así que la butaca 12 del AVE 03070
   habría quedado ocupada para siempre.
4. **`incidencias`: tabla propia.** El contrato de [[endpoints]] ya expone `GET /incidencias?feed=&linea=`
   y sin tabla no se puede cumplir. Se simplifica el `Alert` de GTFS-RT: título, descripción, causa,
   efecto, periodo activo y `lineas`/`paradas` afectadas (arrays con índice GIN). No es historial:
   el worker reemplaza las vigentes en cada sondeo.

## Qué queda
- **La única pregunta abierta es la de Kevin** (§10.2): ¿`payment_intent_id` + `ultimo_evento_stripe`
  bastan para el webhook en modo test? Cuando conteste, el contrato pasa a `estado: aceptado`.
- **Nada de migraciones hasta entonces** (decisión de la sesión). Después: `vector` + identidad y
  catálogo, luego reserva/pago/billete y Realtime.
- Marina: localizar las URLs de GTFS / GTFS-RT de Renfe.

## Aviso: cambios que rompen contratos ya escritos
- **`feed` en las claves** → [[eventos-realtime]] y el mapa de Alex ya lo llevan; el payload de
  Realtime pasa a `{ feed, viaje_id, lat, lon, retraso_seg, actualizado }`. Los campos nuevos son
  opcionales, pero **el mapa debe filtrar por `feed` + `viaje_id`**, no solo por `viaje_id`.
- **`estaciones.id` es opaco**: coincide hoy con el `stop_id` de `avld`, pero ningún cliente debe
  asumirlo.
- El contrato de [[endpoints]] (rama `docs/api-arquitectura-renfe` de Rubén) y este modelo ya
  encajan: `feed`, `incidencias`, `bbox`, `plazasLibres` y el id público `feed:tripId:fecha` tienen
  soporte en las tablas.

## Bloqueos / preguntas para otros
- **Kevin:** pregunta 11 de §10.2 (campos del webhook de Stripe test). Es lo único que queda.
- **Rubén:** sus tres huecos están aplicados; si ves algo distinto en tu rama de `endpoints`,
  dilo antes de la migración.
- **Sin bloqueos técnicos:** Supabase validado en VM Linux el 26/10 y `main`/`develop` vuelven a
  compartir ancestro.

## Cambios en contratos
- [[modelo-datos]]: de 14 a **16 tablas**, claves `(feed, id)`, estaciones unificadas con
  `estacion_feeds`, `reservas.fecha_servicio`, `asientos` por fecha y tabla `incidencias`.
- [[eventos-realtime]]: payload con `feed` y campos opcionales alineados con `GET /posiciones`.
- [[endpoints]]: sin cambios (es de Rubén); se ha adaptado el modelo a lo que ya prometía.

## Ficheros tocados
- `obsidian/02-contratos-api/modelo-datos.md`, `obsidian/02-contratos-api/eventos-realtime.md`
- `obsidian/05-areas/base-datos.md`, `obsidian/01-estado/*` (mi fila y mi tarea)
- `obsidian/04-handoffs/2026-10-26-marina-modelo-datos.md`
