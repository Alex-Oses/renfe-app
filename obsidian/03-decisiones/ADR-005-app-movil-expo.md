---
fecha: 2026-10-28
estado: aceptado
autor: Alex
tags: [adr, frontend, movil]
---

# ADR-005 — App móvil con Expo para iOS y Android, reutilizando la lógica de la web

Responde a la incidencia [[2026-10-27-ruben-plan-app-movil]] (D1–D9). Sustituye en parte a [[ADR-004-web-primero-vercel-render]]: el Android con Capacitor y el facial solo en el navegador.

## Contexto
- La entrega del 06/11 tiene como pieza principal la **app móvil**. La web (`frontend/web`) ya está hecha y desplegada en Vercel.
- Reparto del 28/10: **Rubén** hace el servidor Python de reconocimiento facial, **Marina** la base de datos y **Alex** el frontend (web y app).
- La UI de la web es React DOM + CSS y no se puede reutilizar en React Native. La lógica sí, porque es TypeScript puro.

## Decisión
- **D1:** Expo (managed) con EAS Build. No hace falta Android Studio ni Mac.
- **D2:** la lógica se comparte en el paquete `frontend/shared` (`@renfe/shared`): cliente de la API, tipos del contrato, simulados, reglas de avisos, contenido y tokens de diseño (`shared/tema`). La UI de la app se escribe en React Native usando esos tokens. Cada app llama a `configurarApi()` al arrancar: la web con `VITE_*` y la app con `EXPO_PUBLIC_*`.
- **D3:** la web se queda en Vercel como demo, plan B y banco de pruebas de UX. Lo que se pule en la web se porta a la app.
- **D4:** la app va en `frontend/mobile`.
- **D5:** iOS y Android.
- **D6:** Android como APK con EAS Build (perfil `preview`). En iOS, Expo Go para la demo. Para instalarla como app propia (TestFlight) hace falta una cuenta de Apple Developer.
- **D7:** el facial vuelve a un servidor propio (Rubén). **Actualizado el 28/10 (Alex): Rubén puede elegir la tecnología, no tiene que ser Python** (por ejemplo, Node/TypeScript dentro de la API). Condiciones: que funcione en el plan gratuito, que la app solo envíe la imagen o el embedding y que el contrato esté en [[endpoints]]. La app captura la imagen con `expo-camera` y la envía al servidor. Se guardan solo embeddings, nunca fotos. El contrato lo publica Rubén en [[endpoints]].
- **D8:** ADR-004 queda **obsoleto** en Capacitor y en el facial en el navegador. Sigue vigente en la web en Vercel y la API en Render.
- **D9:** se reescribe [[sprint-actual]] con la app dentro del alcance.

## Alternativas descartadas
- **React Native CLI (bare):** necesita Android Studio y Mac para compilar. Con 8 días, no.
- **Capacitor envolviendo la web:** sale una app web en un marco, sin sensación nativa. Además, el equipo pidió React Native.
- **Reescribir la lógica en la app:** duplica el cliente, los tipos y los simulados, y se desincronizarían.

## Consecuencias
- La app necesita sustitutos de `localStorage` y de `crypto.subtle`, que usan los simulados y el QR firmado (por ejemplo `react-native-mmkv` y `expo-crypto`).
- La API tiene que aceptar peticiones sin cabecera `Origin` (CORS, aviso de Rubén).
- Quedan para el equipo D10 (qué se dockeriza, Kevin), D11 (qué documentación se entrega) y D12 (qué se recorta si no cabe).
