# 📱 frontend/

**Responsable:** Alex (Product Owner + Frontend) · IA: Claude Code

Todo lo que ve el usuario vive aquí. El frontend **nunca** habla directamente con Renfe ni con la base
de datos: solo con la API (`backend/api`).

## Contenido

| Carpeta | Qué es | Estado |
|---|---|---|
| [`web/`](web/) | Web con Vite + React. Demo completa y plan B, desplegada en Vercel | ✅ en `develop` |
| [`mobile/`](mobile/README.md) | App Expo SDK 58 (iOS y Android) con expo-router | 🟡 en la rama `feat/mobile-app-expo`, sin mergear |
| [`shared/`](shared/README.md) | `@renfe/shared`: cliente de la API, tipos del contrato, simulados, contenido y tokens de diseño | ✅ en `develop` |

La web y la app comparten la lógica de `shared/`; la UI no se comparte (React DOM vs React Native).

## Pantallas

| Pantalla | Web | App |
|---|---|---|
| Inicio + buscador | ✅ | ✅ (rama) |
| Resultados y detalle del tren | ✅ | ✅ (rama) |
| Reserva (asientos, viajeros, pago simulado) | ✅ | ✅ (rama) |
| Mis billetes + QR | ✅ | ✅ (rama) |
| Login / registro / login facial | ✅ (facial pendiente del 512) | 🟡 (rama) |
| Mapa en tiempo real (`/posiciones`) | ✅ | ✅ (rama) |
| Revisor (escáner) | ✅ | ⛔ |
| Abonos y bonos | ✅ | ⛔ |
| Chatbot | ✅ | ✅ (rama) |

## Reglas

- Antes de consumir un endpoint, mira `obsidian/02-contratos-api/endpoints.md`. Si falta algo, pídelo a
  Rubén con un handoff; no inventes la respuesta.
- Variables públicas solo con prefijo `VITE_` (web) o `EXPO_PUBLIC_` (app). Ver `.env.example`.
- Nada de claves secretas en el frontend.
