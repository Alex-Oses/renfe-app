---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** **Supabase Cloud validada como transición** (esquema + catálogo AV/LD cargados y verificados); objetivo final: Supabase self-hosted en Docker en el servidor ([[ADR-009-supabase-self-hosted-en-servidor]])

## Pendiente
- **Servidor Docker:** preparar Supabase self-hosted, almacenamiento persistente, backups y migración cuando el administrador abra los puertos y autorice proxy/TLS
- **Render**: poner `DATABASE_URL` (session pooler), `JWT_SECRET` y `QR_SIGNING_SECRET` → `/health` con
  `"baseDatos":"ok"` y `/estaciones` / `/trenes` con datos reales. Lo hacen Kevin/Alex con los
  valores de [[supabase-nube]]
- `explain analyze` de `/trenes` y `/estaciones` contra la nube; índice solo si hace falta
- Reimportación semanal programada (AV/LD tiene horizonte hasta 29/09/2027)
- Fuera del sprint: Cercanías (497 paradas sin `CODIGO`), `posiciones_trenes`, Stripe

## Notas técnicas
- **Supabase Cloud (29/10):** proyecto `renfe-app`, ref `hqwwucagvlhnlqrspwvh`, región
  **eu-west-1 (Irlanda)**. Las **6 migraciones** aplicadas con `db push` y el catálogo AV/LD
  cargado por el **session pooler** (`aws-0-eu-west-1.pooler.supabase.com:5432`, usuario
  `postgres.<ref>`): la conexión directa es **solo IPv6** y la VM da `ENETUNREACH`.
  Conteos del feed del 29/10: 1 035 estaciones · 1 008 estacion_feeds · 668 rutas ·
  8 908 calendarios · 31 991 excepciones · 8 908 viajes · 71 781 horarios.
  `pnpm gtfs:verificar` **en verde**. Runbook completo en [[supabase-nube]].
- **Catálogo AV/LD en local (28/10):** migración [[migracion-catalogo-gtfs]] aplicada y
  `backend/gtfs-worker` importando el feed real: 1 035 estaciones · 1 008 estacion_feeds ·
  663 rutas · 8 729 calendarios · 31 702 excepciones · 8 729 viajes · 69 670 horarios.
  Integridad y consulta de la API en verde, **idempotencia demostrada** (segunda pasada sin
  `--reemplazar` no duplica nada). Runbook del importador en `backend/gtfs-worker/README.md`.
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-003-supabase-local]].
- **Validado de punta a punta** el 26/10 en una VM Linux de Azure (Docker Desktop está bloqueado en
  el portátil corporativo): `db:start`, Studio/API/PostgreSQL accesibles, `seed.sql` aplicado y `db:stop`.
- **Todo lo que necesite Docker/Supabase/contenedores se ejecuta en la VM `genai-openllm-vm`**, no en el portátil.
- [[modelo-datos]]: contrato completo; **las migraciones ya existen** (15 tablas). `posiciones_trenes`,
  `incidencias` y `pagos` no se crean: el GTFS-RT vive en memoria y no hay Stripe. **Dos feeds** (`cercanias` y `avld`)
  con claves `(feed, id)`; estaciones unificadas con `estacion_feeds`; asientos por viaje **y fecha**;
  `reservas.fecha_servicio`; `incidencias` para los avisos GTFS-RT (descartada). Decisiones de Alex (15 min,
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
