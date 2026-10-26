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

## Decisiones cerradas (Alex, 26/10)
- Retención de butaca: **15 minutos**.
- **Un QR por butaca** (1 billete = 1 butaca = 1 viajero).
- **Sin histórico de posiciones**: el mapa solo pinta la posición actual.
- **El webhook comprueba `expira_en` antes de emitir billetes**: si la reserva ya caducó, la pasa a
  `caducada`, libera butacas, deja el pago en `reembolsado` y **no emite billetes**. Regla completa
  en §5.3 del contrato, con los cuatro casos posibles.

## Qué queda
- **Cerrar las 4 preguntas de §10.2** (de Rubén y Kevin; ver abajo).
- Primera migración: extensión `vector` + tablas de identidad y catálogo.
- Después: reserva/pago/billete, Realtime y `seed.sql` con estaciones de prueba.
- Sin SQL a propósito: primero el contrato, como pide el protocolo.

## Bloqueos / preguntas para otros
- **Rubén:** (a) ¿`tipo_servicio` de las rutas se deduce del feed en el worker o tabla manual?
  (b) ¿nombres `llega`/`sale`, `recoge`/`deja` o prefieres `llegada`/`salida`? Se cambia ahora o nunca.
  (c) Caducidad del QR: ¿fin del día de servicio o unas horas más?
- **Kevin:** ¿`payment_intent_id` + `ultimo_evento_stripe` bastan para el webhook en modo test, o
  Stripe exige guardar algo más? Hoy `pagos` no guarda datos de tarjeta (ni debe).
- **Resuelto:** el aviso de `main` y `develop` sin ancestro común ya está arreglado (Alex puso
  `main` en la historia nueva: `merge-base` vuelve a devolver `43fb3d5`).
- **Resuelto:** la validación de Supabase se hizo en una VM Linux de Azure (Docker Desktop está
  bloqueado en el portátil corporativo). Ver [[2026-10-26-marina-supabase-init]].

## Cambios en contratos
- [[modelo-datos]]: borrador completo (era una lista de tablas previstas). Sigue `estado: borrador`
  hasta que se respondan las 4 preguntas de §10.2; las de Alex ya están dentro del documento.
- [[endpoints]] y [[eventos-realtime]]: sin cambios; `posiciones_trenes` respeta el payload actual.

## Ficheros tocados
- `obsidian/02-contratos-api/modelo-datos.md`
- `obsidian/05-areas/base-datos.md`, `obsidian/01-estado/*` (mi fila y mi tarea)
- `obsidian/04-handoffs/2026-10-26-marina-modelo-datos.md`
