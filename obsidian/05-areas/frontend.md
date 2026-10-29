---
responsable: Alex
tags: [area]
---

# 🎨 Área Frontend

**Código:** `frontend/web` (Vite + React, en Vercel), `frontend/mobile` (Expo SDK 58, en la rama
`feat/mobile-app-expo`) y `frontend/shared` (`@renfe/shared`, lógica común).
**Estado (29/10):** web completa y conectada a la API real; app móvil escrita pero **sin mergear**.

## Pantallas

| Pantalla | Web | App (rama) |
|---|---|---|
| Inicio animado + buscador | ✅ | ✅ |
| Búsqueda y resultados | ✅ | ✅ |
| Reserva (asientos, viajeros, pago simulado) | ✅ | ✅ |
| Mis billetes (QR) | ✅ | ✅ |
| Login / registro / login facial | ✅ (pendiente pasar de 1024 a 512) | 🟡 |
| Mapa tiempo real (`/posiciones`) | ✅ | ✅ |
| Revisor (escáner) | ✅ | ⛔ |
| Abonos y bonos | ✅ | ⛔ |
| Chatbot | ✅ | ✅ |

## App móvil

- Vive en `frontend/mobile` **dentro de la rama `feat/mobile-app-expo`** (9 commits, Expo SDK 58 con
  expo-router, EAS y polyfills de `localStorage`/`crypto`). En `develop` solo queda el README.
- La UI es React Native; todo lo demás (cliente API, tipos, simulados, QR, tokens) se importa de
  `@renfe/shared`. Ver [[ADR-005-app-movil-expo]].
- Variables: `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_POSICIONES_URL`.

## Notas técnicas (web)

- **Vercel solo despliega `main` y solo si cambia `frontend/web` o `frontend/shared`** (`ignoreCommand`
  en `frontend/web/vercel.json`). No hay previews por PR; para probar, `pnpm dev:web` en local.
- **Tiempo real:** orden en `cliente.ts`: API de Render si hay `VITE_API_URL` → función de Vercel
  (`frontend/web/api/posiciones.ts`, lee GTFS-RT porque Renfe no da CORS) → simulado.
  `VITE_TIEMPO_REAL=simulado` fuerza el plan B. En `pnpm dev` no existe `/api`, así que en local
  siempre es simulado salvo que apuntes `VITE_API_URL` a la API.
- **Scroll al navegar:** `componentes/AlNavegar.tsx` sube arriba en cada página nueva y centra el
  `#ancla`; con atrás/adelante no toca nada.
- **Catálogos locales:** estaciones fijas (`ESTACIONES`), tarifas, descuentos y extras siguen en
  `shared/api/simulado*`: Renfe no publica precios y `/estaciones` exige `q`.
- El cristal está en `src/estilos/base.css` (niveles `--cristal-1/2/3`). La capa `cristal-liquido.css`
  se quitó el 27/10: era demasiado transparente y pisaba ese sistema.
- El mapa vive en su propia capa (`.mapa-pagina { isolation: isolate }`) para que Leaflet no tape los menús.
- Único punto de acceso a la API: `shared/api/cliente.ts`. El id de tren es `feed:tripId:fecha`.
- `/posiciones` no trae origen/destino/progreso: el mapa los deja vacíos con la API real.
