---
actualizado: 2026-10-26
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | CI real y `render.yaml` hechos para descargar a Kevin; siguiente: conectar la web a la API real | Esperando migraciones de Marina y API desplegada | 2026-10-27 |
| Rubén | Backend + chatbot | 🟡 | API (Nest, auth, guards), contrato de [[endpoints]] y respuestas 5–7 de [[modelo-datos]] entregadas a Marina | Esperando esquema de Marina para `/estaciones` y `/trenes` | 2026-10-26 |
| Marina | SM + Base de datos | 🟢 | Supabase local validado en VM Linux; contrato de [[modelo-datos]] cerrado salvo la duda de Kevin sobre Stripe | — | 2026-10-26 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- Migraciones de Marina solo en su PC: sin ellas no hay Supabase en la nube (ver riesgo en [[sprint-actual]]).
- API sin desplegar: CI y `render.yaml` ya hechos por Alex; falta crear el servicio en Render.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
