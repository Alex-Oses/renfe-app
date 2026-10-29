---
actualizado: 2026-10-29
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | La web ya usa los datos reales de la API: buscador con `/estaciones`, resultados con `/trenes`, mapa con recorrido y paradas del GTFS estático, retraso de GTFS-RT (incluido «Sin datos») y login facial con el cuerpo del contrato. `lint`, `test` y build en verde, sin commit todavía ([[2026-10-29-alex-mapa-datos-reales]]). Además: Dependabot sin PRs, títulos de PR flexibles y revisión obligatoria de todo el equipo (3 aprobaciones, PR #81) | Para la app: BD (Marina) y facial (Rubén). El facial sigue en 1024 (Human) y el ADR pide 512 | 2026-10-29 |
| Rubén | Backend + chatbot | 🟢 | #47 abierto (retrasos reales, `paradaActual` y login facial), esperando 1 aprobación. Hecho: ADR-007 (ArcFace 512, sin servidor Python, decide Postgres), la migración `20261028120300_reconocimiento_facial.sql` (adaptada a `perfiles` de Marina) y las **3 rutas `/auth/cara/*` con tests**. Siguiente: migración mínima `gtfs_*` si Marina no vuelve antes del 29 | Necesita las migraciones de Marina (su rama no tiene PR) para validar el SQL; sin BD el facial no se puede probar | 2026-10-28 |
| Marina | SM + Base de datos | 🟢 | **Supabase Cloud validada**: proyecto `hqwwucagvlhnlqrspwvh` (eu-west-1), 4 migraciones con `db push`, catálogo AV/LD cargado por el session pooler y `gtfs:verificar` en verde (1 035 estaciones / 668 rutas / 8 908 viajes / 71 781 horarios, feed 29/10). Los 3 PRs (#72, #73, #74) ya están mergeados. Siguiente: `DATABASE_URL` en Render ([[supabase-nube]]) | Nada por mi parte. Render sigue en 503 hasta que Kevin/Alex pongan `DATABASE_URL` | 2026-10-29 |
| Kevin | DevOps + despliegue + Docker | 🟢 | CI revisada y en verde (excepción para Dependabot + `pnpm test:ramas`): PR **#75** abierta, `CI / ok` y `PR / reglas` ✅, falta aprobación. API viva en Render sin base de datos. Siguiente: en cuanto exista Supabase Cloud ([[supabase-nube]]) rellenar las variables de Render; y Docker (D10 de [[ADR-005-app-movil-expo]]) | `DATABASE_URL` bloqueada hasta que Marina cree Supabase Cloud | 2026-10-28 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- 🟢 **Supabase Cloud operativa desde el 29/10** (`hqwwucagvlhnlqrspwvh`, eu-west-1): esquema y catálogo AV/LD cargados y verificados. Ya no depende de la VM de Marina ([[supabase-nube]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que se rellene `DATABASE_URL` (session pooler) en el panel de Render.
- 🟢 **La app móvil ya tiene plan** ([[ADR-005-app-movil-expo]], 28/10): Expo para iOS y Android, y la web queda como demo y plan B. El facial está decidido en [[ADR-007-reconocimiento-facial]]: **sin servidor Python**, el vector lo calcula el dispositivo y la decisión la toma Postgres.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
