# 📱 frontend/

**Responsable:** Alex (Product Owner + Frontend) · IA: Claude Code

Todo lo que ve el usuario vive aquí. El frontend **nunca** habla directamente con Renfe, con Postgres ni con un servicio facial: consume la API (`backend/api`). El mapa usa `GET /posiciones`; en la web desplegada, su función de Vercel `/api/posiciones` puede leer GTFS-RT. No hay cliente de Supabase Realtime.

## Contenido

| Carpeta | Qué es |
|---|---|
| [`web/`](web/README.md) | Web React/Vite: viajero, cuenta, abonos, mapa, revisor y contenido. |
| [`mobile/`](mobile/README.md) | App Expo + React Native (iOS, Android y web). Dos modos: **viajero** y **revisor**. |
| [`shared/`](shared/README.md) | Cliente de API, tipos, simulados, QR, contenido y tokens de diseño comunes. |

## Cobertura funcional actual

La web y la app ya incluyen, según el área: login/registro y acceso facial, búsqueda y resultados de
viajes, reserva con pago simulado, billetes con QR firmado, abonos, modo revisor, mapa de posiciones,
chatbot y páginas de ayuda/contenido. Es una demo en desarrollo: no todas las funciones están
verificadas en todos los entornos ni desplegadas.

La web y la app comparten `@renfe/shared`; los datos GTFS son reales (CC BY 4.0) y precios, asientos,
reservas y pagos son simulados. Stripe queda pendiente y siempre sería en modo test.

## Reglas

- Antes de consumir un endpoint, mira `obsidian/02-contratos-api/endpoints.md`. Si falta algo, pídelo a Rubén con un handoff, no inventes la respuesta.
- Variables públicas solo con prefijo `EXPO_PUBLIC_` (ver `.env.example`).
- Nada de claves secretas en la app.
