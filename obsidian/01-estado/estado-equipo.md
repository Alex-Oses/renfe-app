---
actualizado: 2026-10-26
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | Web en producción y alineada con [[endpoints]]; plan de entrega del 6/11 en [[sprint-actual]]. Siguiente: conectar la web a la API real | Esperando API desplegada | 2026-10-27 |
| Rubén | Backend + chatbot | 🟡 | API (Nest, auth, guards), contrato de [[endpoints]] y respuestas 5–7 de [[modelo-datos]] entregadas a Marina | Esperando esquema de Marina para `/estaciones` y `/trenes` | 2026-10-26 |
| Marina | SM + Base de datos | 🟢 | Supabase local validado en VM Linux; contrato de [[modelo-datos]] cerrado salvo la duda de Kevin sobre Stripe | — | 2026-10-26 |
| Kevin | DevOps + Stripe + face | ⚪ | Pendiente: CI, Docker Compose real, protección de ramas | Esperando repo en GitHub | 2026-10-26 |

## Bloqueos globales
- Kevin: la CI no ejecuta lint ni tests y la API no está desplegada; es el camino crítico de la demo con datos reales.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
