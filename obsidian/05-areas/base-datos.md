---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** contrato revisado contra los feeds reales (28/10); siguiente: migración del catálogo para el sprint

## Pendiente
- **Primera migración** (`vector` + identidad + catálogo GTFS), sin RT ni reservas: bloquea a Rubén y a Alex
- Import del feed `avld` (69 670 horarios) — Cercanías queda fuera del sprint
- Revisión de [[modelo-datos]] v2 y de [[plan-ingesta-gtfs]] por el equipo
- Respuesta de Kevin a §10.2 (webhook de Stripe): **no bloquea** la primera migración

## Notas técnicas
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-003-supabase-local]].
- **Validado de punta a punta** el 26/10 en una VM Linux de Azure (Docker Desktop está bloqueado en
  el portátil corporativo): `db:start`, Studio/API/PostgreSQL accesibles, `seed.sql` aplicado y `db:stop`.
- **Todo lo que necesite Docker/Supabase/contenedores se ejecuta en la VM `genai-openllm-vm`**, no en el portátil.
- [[modelo-datos]]: contrato completo, sin SQL todavía. 16 tablas. **Dos feeds** (`cercanias` y `avld`)
  con claves `(feed, id)`; estaciones unificadas con `estacion_feeds`; asientos por viaje **y fecha**;
  `reservas.fecha_servicio`; tabla `incidencias` para los avisos GTFS-RT. Decisiones de Alex (15 min,
  QR por butaca, sin histórico de posiciones, webhook comprueba `expira_en`) y de Rubén
  (heurística de `tipo_servicio`, QR a `fecha_servicio + 26 h`, nombres de horas) incorporadas.
- **Revisión contra los feeds reales (28/10):** los viajes vienen **expandidos por fecha** (AV/LD/MD
  con la fecha dentro del `trip_id`; Cercanías 139 900 viajes en 30 días), así que `viajes` lleva
  `fecha_inicio`/`fecha_fin` y columnas resumen; `posiciones_trenes` lleva `fecha_servicio` porque el
  RT no manda `start_date`; `incidencias` se ajusta al `Alert` real (sin `headerText` ni enums); el
  número de tren vive en `viajes.numero`; `recoge`/`deja` con default; estaciones unificadas por el
  `CODIGO` del CSV.
- Volúmenes: **AV/LD/MD 8 729 viajes y 69 670 horarios** (lo que entra en el sprint);
  **Cercanías 139 900 viajes y 1 918 539 horarios** (fuera del sprint, es lo que haría falta para la
  ventana de 7 días y el aviso de los 500 MB del plan gratuito).
- Plan de carga, entorno y reparto: [[plan-ingesta-gtfs]].
