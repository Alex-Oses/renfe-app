# 📱 frontend/

**Responsable:** Alex (Product Owner + Frontend) · IA: Claude Code

Todo lo que ve el usuario vive aquí. El frontend **nunca** habla directamente con Renfe ni con el face service: solo con la API (`backend/api`) y, para tiempo real, con Supabase Realtime.

## Contenido

| Carpeta | Qué es |
|---|---|
| [`mobile/`](mobile/README.md) | App Expo + React Native (iOS, Android y web). Dos modos: **viajero** y **revisor**. |

## Pantallas previstas (por sprint, ver `obsidian/01-estado/sprint-actual.md`)

- Login / registro + login con reconocimiento facial
- Búsqueda de trenes (origen, destino, fecha)
- Resultados y detalle del tren
- Selección de asiento (simulado) y pago (Stripe test)
- Mis billetes (QR firmado)
- Modo revisor: escáner de QR y validación
- Mapa en tiempo real de trenes
- Chatbot

## Reglas

- Antes de consumir un endpoint, mira `obsidian/02-contratos-api/endpoints.md`. Si falta algo, pídelo a Rubén con un handoff, no inventes la respuesta.
- Variables públicas solo con prefijo `EXPO_PUBLIC_` (ver `.env.example`).
- Nada de claves secretas en la app.
