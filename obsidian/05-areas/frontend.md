---
responsable: Alex
tags: [area]
---

# 📱 Área Frontend

**Código:** `frontend/web` (React + Vite, publicada en Vercel) y `frontend/mobile` (Expo, pieza principal según [[ADR-005-app-movil-expo]]).
**Estado:** web con datos reales de la API; app Expo lista para probar en Expo Go (PR #95). Sin `VITE_API_URL`/`EXPO_PUBLIC_API_URL` las dos usan simulados.

## Pantallas

| Pantalla | Estado |
|---|---|
| Inicio animado + buscador | ✅ |
| Búsqueda y resultados | ✅ |
| Reserva (asientos, viajeros, pago simulado) | ✅ |
| Mis billetes (QR) | ✅ |
| Login / registro / login facial (Human en el navegador) | ✅ |
| Mapa tiempo real | ✅ con `/posiciones`, recorrido y paradas reales |
| Revisor (escáner) | fuera de la entrega |
| Chatbot | fuera de la entrega |

## Notas técnicas

- **Vercel solo despliega `main` y solo si cambia `frontend/web`** (`ignoreCommand` en `frontend/web/vercel.json`): el plan gratuito permite 100 despliegues al día y antes se gastaban en cada push de cualquier rama. Ya no hay previews por PR; para probar, `pnpm dev` en local.

- **Tiempo real:** `frontend/web/api/posiciones.ts` es una función de Vercel que lee el GTFS-RT de Renfe (sin CORS en el navegador) y devuelve la forma de `GET /posiciones` del contrato. Orden en `cliente.ts`: API de Render si hay `VITE_API_URL` → función de Vercel → simulado. `VITE_TIEMPO_REAL=simulado` fuerza el plan B. En `pnpm dev` no existe `/api`, así que en local siempre es simulado.
- **Scroll al navegar:** `componentes/AlNavegar.tsx` sube arriba en cada página nueva y centra el `#ancla`; con atrás/adelante no toca nada.
- **Catálogos locales:** estaciones fijas (`ESTACIONES`), tarifas, descuentos y extras siguen en `api/simulado*`: Renfe no publica precios y `/estaciones` exige `q`. Todo lo que viene de la API pasa por `api/cliente.ts`.

- El cristal está en `src/estilos/base.css` (niveles `--cristal-1/2/3`). La capa `cristal-liquido.css` se quitó el 27/10: era demasiado transparente y pisaba ese sistema.
- El mapa vive en su propia capa (`.mapa-pagina { isolation: isolate }`) para que Leaflet no tape los menús.

- Único punto de acceso a la API: `frontend/shared/api/cliente.ts`. El id de tren es `feed:tripId:fecha`.
- `/posiciones` ya trae origen, destino, próxima parada, retraso y estado horario; el recorrido completo
  y las paradas salen de `/trenes/:feed/:tripId` (GTFS estático).

## App móvil (`frontend/mobile`)

Expo SDK 58 con expo-router, TypeScript estricto y la lógica de `@renfe/shared`. Pestañas Comprar,
En directo, Billetes, Líneas y Cuenta; resultados, pasajeros y billete con QR. `src/polyfills.ts` cubre
`localStorage` (expo-sqlite) y `crypto` (expo-crypto + @noble/hashes).

- La portada repite el tramo fijo de la web con `Animated.Value` del scroll: el tren sale y el buscador
  entra; con movimiento reducido no se ancla ni anima.
- El mapa nativo (`react-native-maps`) pinta `ruta` y paradas reales; en web lo sustituye
  `MapaTrenes.web.tsx`. El panel arranca plegado.
- Arranque: `pnpm dev:mobile` y Expo Go. APK con `eas build --profile preview --platform android`.
  El facial todavía no está en la app.
