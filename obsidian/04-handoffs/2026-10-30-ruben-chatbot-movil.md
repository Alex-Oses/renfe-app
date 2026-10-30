---
fecha: 2026-10-30
autor: Rubén
area: frontend
para: Alex, Kevin
rama: feat/mobile-paridad-features-web
pr: "#102"
tags: [handoff, frontend, mobile, chatbot]
estado: abierto
---

# Handoff — Chatbot en la app móvil

## Qué se hizo

- Se comprobó que el mapa móvil ya tenía recorrido real, paradas, progreso y detalle; no se duplicó
  esa funcionalidad.
- Se añadió la pantalla `/chatbot` a Expo y un acceso desde Cuenta.
- La pantalla conserva el `conversationId`, muestra respuestas con Markdown básico y tarjetas de
  tren, y enlaza cada tarjeta con el flujo móvil de pasajeros.
- Se actualizó el README de la app y el área de frontend para reflejar que Expo es la pieza principal.

## Qué queda

- Probar en Expo Go con datos simulados y con `EXPO_PUBLIC_API_URL` apuntando a una API accesible
  desde el móvil.
- Validar visualmente tarjetas, teclado y navegación al flujo de compra en iOS y Android.
- Si se necesita paridad con los pasos SSE de la web, adaptar el lector SSE para el runtime móvil;
  esta primera versión usa el endpoint JSON soportado por Expo Go.

## Bloqueos / preguntas para otros

- Expo Go no ejecuta el login facial ONNX; esa limitación sigue documentada y no afecta al chatbot.
- La API real requiere una URL accesible desde la red del teléfono; `localhost` no sirve en el móvil.

## Cambios en contratos

Ninguno. Se reutiliza `POST /chatbot/mensaje` de [[endpoints]].

## Ficheros tocados

- `frontend/mobile/src/app/chatbot.tsx`
- `frontend/mobile/src/app/_layout.tsx`
- `frontend/mobile/src/app/(tabs)/cuenta.tsx`
- `frontend/mobile/README.md`
- `obsidian/05-areas/frontend.md`
- `obsidian/01-estado/estado-equipo.md`
- Este handoff
