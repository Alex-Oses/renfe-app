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
| Rubén | Backend + chatbot | 🟢 | `GET /estaciones` (#26), `GET /trenes` (#33), `GET /posiciones` (GTFS-RT real, probado) y `GET /trenes/:feed/:tripId` hechos. Siguiente: `/incidencias` | Necesita migraciones de Marina para validar el SQL; `/trenes/:feed/:tripId/posicion` bloqueado por el `tripId` de GTFS-RT | 2026-10-27 |
| Marina | SM + Base de datos | 🟢 | Contrato [[modelo-datos]] v2 revisado contra los feeds reales y plan de ingesta en [[plan-ingesta-gtfs]]. Siguiente: migración del catálogo | — | 2026-10-28 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- Migraciones de Marina solo en su PC: sin ellas no hay Supabase en la nube (ver riesgo en [[sprint-actual]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que Marina suba las migraciones y se rellene `DATABASE_URL` en Render.
- 🟡 **La app móvil ya tiene plan** ([[ADR-005-app-movil-expo]], 28/10): Expo para iOS y Android, y la web queda como demo y plan B. Sigue abierto **quién calcula el vector facial**: Alex decidió servidor Python (D7) y Rubén propone que lo calcule el dispositivo con la lógica en Postgres ([[ADR-007-reconocimiento-facial]]). No empezar el facial hasta resolverlo.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
