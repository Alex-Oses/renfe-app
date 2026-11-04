---
fecha: 2026-11-04
autor: alex
area: face
tags: [handoff, face, reservas, mobile, web]
---
# Pago confirmado con la cara

**Para:** Rubén (API y facial) y todo el equipo.

## Qué se hizo
- Pagar pide confirmación del importe y después la cara, en la web (`ConfirmarPago.tsx`) y en la app (`confirmarPago.ts` + `/cara?modo=pago`).
- Al crear la cuenta se obliga a registrar la cara (web `/registrar-cara`, app `/cara?modo=registrar&obligatorio=1`); la única salida es cerrar sesión.
- La API lo exige de verdad: `CaraRecienteGuard` en `POST /reservas` y `POST /reservas/transbordo`. El token debe venir de `/auth/cara/verificar` hace < 10 min (claim `cara_en`); si no, 403. Ver [[endpoints]].
- Un 401 de `/auth/login` o `/auth/cara/verificar` ya no cierra la sesión.

## Qué queda / avisos
- En Expo Go no hay ONNX: no se puede pagar, hace falta la APK.
- Probar en APK con cámara real y en la web con la API.
- El token de cara dura lo mismo que el de contraseña; solo `cara_en` caduca a los 10 min para pagar.

## Rama y PR
`feat/face-pago-con-cara` (sale de `feat/mobile-mapa-panel-y-ayuda`, #142: fusionar #142 antes).
