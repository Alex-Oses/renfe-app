---
responsable: Alex
tags: [area]
---

# 📱 Área Frontend

**Código:** `frontend/web` (React + Vite, publicada en Vercel) y `frontend/mobile` (Expo para iOS,
Android y web). La app móvil es ahora la pieza principal del sprint; la web queda como demo y plan B.
**Estado:** completa con datos simulados; cliente alineado con [[endpoints]]. Sin `VITE_API_URL` usa simulado.

## Pantallas

| Pantalla | Estado |
|---|---|
| Inicio animado + buscador | ✅ |
| Búsqueda y resultados | ✅ |
| Reserva (asientos, viajeros, pago simulado) | ✅ |
| Mis billetes (QR) | ✅ |
| Login / registro / login facial (Human en el navegador) | ✅ |
| Mapa tiempo real | ✅ simulado; real cuando exista `/posiciones` |
| Revisor (escáner) | fuera de la entrega |
| Chatbot | ✅ web y móvil; la app móvil usa el endpoint JSON y conserva la conversación |

## Notas técnicas

- **Vercel solo despliega `main` y solo si cambia `frontend/web`** (`ignoreCommand` en `frontend/web/vercel.json`): el plan gratuito permite 100 despliegues al día y antes se gastaban en cada push de cualquier rama. Ya no hay previews por PR; para probar, `pnpm dev` en local.

- **Tiempo real:** `frontend/web/api/posiciones.ts` es una función de Vercel que lee el GTFS-RT de Renfe (sin CORS en el navegador) y devuelve la forma de `GET /posiciones` del contrato. Orden en `cliente.ts`: API de Render si hay `VITE_API_URL` → función de Vercel → simulado. `VITE_TIEMPO_REAL=simulado` fuerza el plan B. En `pnpm dev` no existe `/api`, así que en local siempre es simulado.
- **Scroll al navegar:** `componentes/AlNavegar.tsx` sube arriba en cada página nueva y centra el `#ancla`; con atrás/adelante no toca nada.
- **Catálogos locales:** estaciones fijas (`ESTACIONES`), tarifas, descuentos y extras siguen en `api/simulado*`: Renfe no publica precios y `/estaciones` exige `q`. Todo lo que viene de la API pasa por `api/cliente.ts`.

- El cristal está en `src/estilos/base.css` (niveles `--cristal-1/2/3`). La capa `cristal-liquido.css` se quitó el 27/10: era demasiado transparente y pisaba ese sistema.
- El mapa vive en su propia capa (`.mapa-pagina { isolation: isolate }`) para que Leaflet no tape los menús.

- Único punto de acceso a la API: `src/api/cliente.ts`. El id de tren es `feed:tripId:fecha`.
- `/posiciones` no trae origen/destino/progreso: el mapa los deja vacíos con la API real.
