---
actualizado: 2026-10-28
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | Lógica común en `@renfe/shared` (web + futura app), mejora de la UI de la web y decisiones de la app en [[ADR-005-app-movil-expo]] | Para la app: BD (Marina) y facial (Rubén) | 2026-10-28 |
| Rubén | Backend + chatbot | 🟢 | #47 abierto (retrasos reales, `paradaActual` y login facial), esperando 1 aprobación. Hecho: ADR-007 (ArcFace 512, sin servidor Python, decide Postgres), la migración `20261028120300_reconocimiento_facial.sql` (adaptada a `perfiles` de Marina) y las **3 rutas `/auth/cara/*` con tests**. Siguiente: migración mínima `gtfs_*` si Marina no vuelve antes del 29 | Necesita las migraciones de Marina (su rama no tiene PR) para validar el SQL; sin BD el facial no se puede probar | 2026-10-28 |
| Marina | SM + Base de datos | 🟢 | **Catálogo AV/LD cerrado en local**: migración validada en la VM, carga completa (1 035 estaciones / 663 rutas / 8 729 viajes / 69 670 horarios), integridad y consulta de la API en verde e **idempotencia demostrada**. Siguiente hito: Supabase Cloud + Render ([[supabase-nube]]) | Pendiente mergear 3 ramas (contrato v2 → migración → importador): necesita aprobación de Alex y CI verde | 2026-10-28 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- Migraciones de Marina solo en su PC: sin ellas no hay Supabase en la nube (ver riesgo en [[sprint-actual]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que Marina suba las migraciones y se rellene `DATABASE_URL` en Render.
- 🟢 **La app móvil ya tiene plan** ([[ADR-005-app-movil-expo]], 28/10): Expo para iOS y Android, y la web queda como demo y plan B. El facial está decidido en [[ADR-007-reconocimiento-facial]]: **sin servidor Python**, el vector lo calcula el dispositivo y la decisión la toma Postgres.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
