---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** BD local validada; contrato cerrado salvo la duda de Kevin sobre Stripe

## Pendiente
- Respuesta de Kevin a [[modelo-datos]] §10.2 (campos del webhook de Stripe test)
- Primera migración (`vector` + identidad y catálogo), cuando el contrato esté aceptado
- Localizar URLs GTFS / GTFS-RT de Renfe

## Notas técnicas
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-003-supabase-local]].
- **Validado de punta a punta** el 26/10 en una VM Linux de Azure (Docker Desktop está bloqueado en
  el portátil corporativo): `db:start`, Studio/API/PostgreSQL accesibles, `seed.sql` aplicado y `db:stop`.
- [[modelo-datos]]: contrato completo, sin SQL todavía. 16 tablas. **Dos feeds** (`cercanias` y `avld`)
  con claves `(feed, id)`; estaciones unificadas con `estacion_feeds`; asientos por viaje **y fecha**;
  `reservas.fecha_servicio`; tabla `incidencias` para los avisos GTFS-RT. Decisiones de Alex (15 min,
  QR por butaca, sin histórico de posiciones, webhook comprueba `expira_en`) y de Rubén
  (heurística de `tipo_servicio`, QR a `fecha_servicio + 26 h`, nombres de horas) incorporadas.
