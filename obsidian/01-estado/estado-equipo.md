---
actualizado: 2026-10-27
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | Web completa en `main` (menú, idiomas, avisos, cristal líquido). Siguiente: conectar la web a la API real | Reactivar protección de ramas; Vercel no promociona `main` solo | 2026-10-27 |
| Rubén | Backend + chatbot | 🟢 | `GET /estaciones` (#26), `GET /trenes` (#33), `GET /posiciones` (GTFS-RT real, probado) y `GET /trenes/:feed/:tripId` hechos. Siguiente: `/incidencias` | Necesita migraciones de Marina para validar el SQL; `/trenes/:feed/:tripId/posicion` bloqueado por el `tripId` de GTFS-RT | 2026-10-27 |
| Marina | SM + Base de datos | 🟢 | Supabase local validado en VM Linux; contrato de [[modelo-datos]] cerrado salvo la duda de Kevin sobre Stripe | — | 2026-10-26 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- Kevin: la CI no ejecuta lint ni tests y la API no está desplegada; es el camino crítico de la demo con datos reales.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
