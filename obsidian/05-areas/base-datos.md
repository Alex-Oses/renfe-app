---
responsable: Marina
tags: [area]
---

# 🗄️ Área Base de datos y datos Renfe

**Código:** `backend/database`, `backend/gtfs-worker` · **Estado:** sin crear

## Pendiente
- Cerrar las preguntas abiertas de [[modelo-datos]] (precio, retención de butacas, caducidad del QR)
- Localizar URLs GTFS / GTFS-RT de Renfe

## Notas técnicas
- Supabase local inicializado: `backend/database/supabase/` (config, migraciones, seed).
  CLI como devDependency; `pnpm db:start | db:stop | db:reset | db:status`. Ver [[ADR-002-supabase-local]].
- `supabase start` necesita Docker Desktop abierto.
- [[modelo-datos]] está en borrador completo (contrato, sin SQL todavía): 14 tablas, claves naturales de GTFS, estados como `text + CHECK`, asientos generados bajo demanda y Realtime con una fila por viaje.
