---
responsable: Alex
tags: [area]
---

# 📱 Área Frontend

**Código:** `frontend/web` (React + Vite, publicada en Vercel). `frontend/mobile` (Expo) queda fuera de la entrega (ADR-004).
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
| Chatbot | fuera de la entrega |

## Notas técnicas

- Único punto de acceso a la API: `src/api/cliente.ts`. El id de tren es `feed:tripId:fecha`.
- `/posiciones` no trae origen/destino/progreso: el mapa los deja vacíos con la API real.
