---
fecha: 2026-11-02
autor: Alex (agente)
area: frontend
para: Alex
rama: feat/mobile-contenido-informativo
pr: sin abrir (falta push)
tags: [handoff, mobile, contenido]
---

# Handoff — Contenido informativo en la app

## Qué se hizo
- Ruta `/contenido/[...ruta]`: pinta cualquier página de `@renfe/shared/contenido` (texto, lista, tarjetas con foto, tabla como fichas, FAQ desplegable, pasos, aviso, CTA). Migas con títulos, «En esta sección» con las hijas y 404 con volver / ir a Ayuda.
- Menús sin página propia (p. ej. `/inspirate` si no existe) muestran sus grupos de `menuPrincipal`.
- Enlaces: contenido → `/contenido/...`; `/billetes`, `/billetes/:id`, `/cuenta`, `/acceder`, `/abonos`, `/mapa` (→ `/directo`), `/lineas`, `/revisor`, `/` y `/trenes` → pantalla móvil; el resto y los bloques «herramienta» → web con expo-web-browser (`https://renfe-app-beta.vercel.app`).
- Pantalla `/informacion` (índice con menús y grupos, más Ayuda) y sección «Información y ayuda» al final de Inicio.

## Qué queda
- Las herramientas interactivas siguen solo en la web.
- Probado en export web; falta probar en Expo Go (Android/iOS).

## Bloqueos / preguntas para otros
- `pnpm lint` en la raíz llama a `pnpm` a pelo; en Windows sin pnpm en el PATH hay que usar `corepack pnpm -r lint`.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `frontend/mobile/src/app/contenido/[...ruta].tsx` (nuevo)
- `frontend/mobile/src/app/informacion.tsx` (nuevo)
- `frontend/mobile/src/app/_layout.tsx` (dos `Stack.Screen`)
- `frontend/mobile/src/app/(tabs)/index.tsx` (solo la sección nueva)