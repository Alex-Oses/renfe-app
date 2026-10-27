---
actualizado: 2026-10-27
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | API en Render (https://renfe-api.onrender.com), CI completa y mapa con trenes reales. Siguiente: `VITE_POSICIONES_URL` en Vercel | Base de datos de Marina; reactivar protección de ramas | 2026-10-27 |
| Rubén | Backend + chatbot | 🟢 | `GET /estaciones` (#26), `GET /trenes` (#33), `GET /posiciones` (GTFS-RT real, probado) y `GET /trenes/:feed/:tripId` hechos. Siguiente: `/incidencias` | Necesita migraciones de Marina para validar el SQL; `/trenes/:feed/:tripId/posicion` bloqueado por el `tripId` de GTFS-RT | 2026-10-27 |
| Marina | SM + Base de datos | 🟢 | Supabase local validado en VM Linux; contrato de [[modelo-datos]] cerrado salvo la duda de Kevin sobre Stripe | — | 2026-10-26 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- Migraciones de Marina solo en su PC: sin ellas no hay Supabase en la nube (ver riesgo en [[sprint-actual]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que Marina suba las migraciones y se rellene `DATABASE_URL` en Render.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
