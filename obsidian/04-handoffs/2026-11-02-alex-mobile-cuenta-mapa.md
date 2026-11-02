---
fecha: 2026-11-02
autor: Alex
area: frontend
para: Alex
rama: feat/mobile-cuenta-y-mapa
pr: sin abrir (no se ha hecho push)
tags: [handoff]
---

# Handoff — cuenta y mapa de la app al nivel de la web

## Qué se hizo

- **Mapa (En directo)**: `estado-tren.ts` pasa de la web a `@renfe/shared/estado/` con su test; la web lo importa de ahí. La app usa la misma lógica: retraso con `retrasoSeg` ("Adelantado", "Sin datos"), paradas pasadas recalculadas con el reloj, progreso y próxima parada. Si el tren elegido llega sin paradas (posiciones reales), pide el recorrido con `completarRuta` una vez por tren y el mapa pinta la ruta.
- **Cuenta**: ya tenía perfil, rol, mis abonos, revisor y cerrar sesión. Se añaden "Tus puntos" (1 por euro, como la web) y el estado del acceso facial con botón a la web (`EXPO_PUBLIC_WEB_URL`), porque Expo Go no ejecuta ONNX ([[ADR-007-reconocimiento-facial]]).
- **Web**: el vigilante (en todas las páginas) y Cuenta ya no piden `GET /billetes` sin sesión; con datos simulados todo sigue igual.

## Qué queda

- Selector "Tarjetas y descuentos" de la web: no se ha llevado a la app porque el descuento por defecto lo lee el buscador (`Buscador.tsx`, fuera de esta tarea).
- "Avísame al llegar" en las paradas del mapa (seguimientos) no está en la app.
- Admin: la app no tiene pantalla de admin (la de la web es un esqueleto).
- Probado solo en export web con datos simulados; falta probar en Expo Go con la API real.

## Bloqueos / preguntas para otros

Ninguno.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `frontend/shared/estado/estado-tren.ts` y `estado-tren.test.ts` (movidos desde `frontend/web/src/paginas/mapa/`)
- `frontend/web/src/paginas/Mapa.tsx`, `frontend/web/src/paginas/mapa/CapasRuta.tsx` (solo import)
- `frontend/mobile/src/app/(tabs)/directo.tsx`, `frontend/mobile/src/app/(tabs)/cuenta.tsx`
- `frontend/web/src/estado/vigilante.tsx`, `frontend/web/src/paginas/Cuenta.tsx`
