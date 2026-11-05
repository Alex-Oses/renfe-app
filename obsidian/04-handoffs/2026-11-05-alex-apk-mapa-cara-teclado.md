---
fecha: 2026-11-05
autor: Alex
area: frontend
para: todos
rama: fix/mobile-apk-mapa-cara-teclado
pr:
tags: [handoff, mobile, apk]
---

# Handoff — APK: mapa, cara y teclado

## Qué se hizo
- APK v1.1.1 publicada en GitHub Releases (latest, la descarga `/app`), con el arreglo de R8 de Rubén (#153) y #157.
- **Mapa**: la APK se cerraba al entrar. `react-native-maps` en Android usa Google Maps y no hay clave de API (Expo Go trae la suya). Ahora el mapa nativo es Leaflet + OpenStreetMap dentro de `react-native-webview`, como la web: sin claves. Se quita `react-native-maps` y `mapa/TrenAnimado.tsx`. Probado el HTML en Chromium headless: teselas, recorrido, paradas y toque sobre un tren.
- **Cara**: la foto salía a resolución completa (12-50 MP) y `jpeg-js` la decodificaba en JS en cada vuelta: Android mataba la app por memoria. Se reduce a 640 px con `expo-image-manipulator` antes de decodificar. Diagnóstico sin logcat (no había móvil conectado).
- **Teclado**: `Hoja.tsx` usaba `KeyboardAvoidingView` solo en iOS; el Modal edge-to-edge de Android no se redimensiona. Ahora `behavior="padding"` en las dos.
- Versión 1.1.2.

## Qué queda
- Probar la APK 1.1.2 en un móvil real: mapa, registro con la cara y buscador con teclado.
- Si la cara sigue cerrándose, hace falta `adb logcat` con el móvil por USB.
- El mapa necesita internet para Leaflet (unpkg) y las teselas de OSM.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `frontend/mobile/src/components/MapaTrenes.tsx`, `mapa-tipos.ts`, `mapa/TrenAnimado.tsx` (borrado)
- `frontend/mobile/src/app/cara.tsx`
- `frontend/mobile/src/components/Hoja.tsx`
- `frontend/mobile/package.json`, `app.json`, `pnpm-lock.yaml`
