---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** BD local validada; contrato en revisión

## Pendiente
- Respuestas de Rubén y Kevin a las 4 preguntas abiertas de [[modelo-datos]] §10.2
- Primera migración (`vector` + identidad y catálogo), cuando el contrato esté cerrado
- Localizar URLs GTFS / GTFS-RT de Renfe

## Notas técnicas
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-002-supabase-local]].
- **Validado de punta a punta** el 26/10 en una VM Linux de Azure (Docker Desktop está bloqueado en
  el portátil corporativo): `db:start`, Studio/API/PostgreSQL accesibles, `seed.sql` aplicado y `db:stop`.
- [[modelo-datos]] está en borrador completo (contrato, sin SQL todavía): 14 tablas, claves naturales de GTFS, estados como `text + CHECK`, asientos generados bajo demanda y Realtime con una fila por viaje. Decisiones de Alex ya incorporadas (15 min, QR por butaca, sin histórico de posiciones, webhook comprueba `expira_en`).
