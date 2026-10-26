---
fecha: 2026-10-26
autor: Marina (con OpenCode)
area: database
para: todos
rama: docs/db-borrador-modelo-datos
pr: (pendiente de abrir)
tags: [handoff, contrato, base-datos]
---

# Handoff — Borrador del modelo de datos

## Qué se hizo
- [[modelo-datos]] pasa de «tablas previstas» a **borrador cerrado en lo estructural**: 14 tablas
  (+ `auth.users` de Supabase) con columnas, tipos, nullabilidad, claves, RLS, índices y motivos.
- Bloque GTFS completo: `estaciones`, `rutas`, `calendarios`, `calendario_excepciones`, `viajes`,
  `horarios`. Sin calendarios la búsqueda por fecha mentiría en festivos.
- Bloque app: `perfiles`, `reservas`, `pagos`, `asientos`, `billetes`, `validaciones`, y
  `embeddings_faciales` (inaccesible para la app: solo `service_role`).
- Realtime: `posiciones_trenes` con **una fila por viaje** (upsert), payload compatible con
  [[eventos-realtime]] (`rumbo`, `velocidad_kmh` y `proxima_estacion_id` opcionales).
- Decisiones con más peso, razonadas en el documento:
  - claves naturales `text` para GTFS / `uuid` para datos de app;
  - estados `text + CHECK` en vez de `ENUM` (las migraciones de Supabase corren en transacción);
  - horas GTFS en `interval` porque el feed usa `25:30`;
  - **una reserva = un viaje**, **un billete = una butaca = un viajero**;
  - ocupación de butaca en `asientos.reserva_id` (nulo = libre) con `UPDATE` atómico, en vez de
    tabla N:M;
  - pagos con un único éxito por reserva e idempotencia del webhook por `event.id`.

## Qué queda
- **Cerrar las 6 preguntas de §10** del contrato (abajo están las que son de otros).
- Primera migración: extensión `vector` + tablas de identidad y catálogo.
- Después: reserva/pago/billete, Realtime y `seed.sql` con estaciones de prueba.
- Sin SQL a propósito: primero el contrato, como pide el protocolo.

## Bloqueos / preguntas para otros
- **Rubén:** (a) ¿`tipo_servicio` de las rutas se deduce del feed en el worker o tabla manual?
  (b) ¿nombres `llega`/`sale`, `recoge`/`deja` o prefieres `llegada`/`salida`? Se cambia ahora o nunca.
  (c) Caducidad del QR: ¿fin del día de servicio o unas horas más?
- **Alex:** (a) ¿15 minutos de retención de butaca encajan con el flujo de pago? (b) ¿un QR por
  butaca (propuesta) o uno por reserva? (c) ¿el mapa necesita estela (histórico de posiciones)?
- **Kevin:** solo si Stripe test necesita algo más que `payment_intent_id` e `event.id`; hoy
  `pagos` no guarda datos de tarjeta (ni debe).
- **Aviso para Alex (importante, no es de este PR):** `origin/develop` fue **reescrito**
  (todos los commits cambiaron de SHA el 26/10 ~10:57) y `origin/main` se quedó en la historia
  antigua: `main` y `develop` ya **no comparten ancestro** (`git merge-base` sale vacío).
  Mi rama del `supabase init` la he rebasado sobre el nuevo `develop` y la he vuelto a subir con
  `--force-with-lease`, pero el PR `develop → main` de fin de sprint va a fallar así. Hay que
  poner `main` en la historia nueva (force-push acordado) o revertir el rewrite.

## Cambios en contratos
- [[modelo-datos]]: borrador completo (era una lista de tablas previstas). Sigue `estado: borrador`
  hasta que se respondan las preguntas de §10.
- [[endpoints]] y [[eventos-realtime]]: sin cambios; `posiciones_trenes` respeta el payload actual.

## Ficheros tocados
- `obsidian/02-contratos-api/modelo-datos.md`
- `obsidian/05-areas/base-datos.md`, `obsidian/01-estado/*` (mi fila y mi tarea)
- `obsidian/04-handoffs/2026-10-26-marina-modelo-datos.md`
