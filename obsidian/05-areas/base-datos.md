---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** sin crear

## Pendiente
- Diseñar [[modelo-datos]]
- Localizar URLs GTFS / GTFS-RT de Renfe

## Notas técnicas
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-002-supabase-local]].
- `supabase start` necesita Docker Desktop abierto.
