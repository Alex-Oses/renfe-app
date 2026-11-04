---
fecha: 2026-11-04
autor: Alex
area: mobile
tags: [handoff, mobile, web, infra, release]
---
# APK en GitHub, Render arreglado y logo de la app

**Para:** todo el equipo.

## Qué se hizo
- Releases `develop → main` con merge commit: #146, #148, #149 y #152 (incluyen #140, #142, #144, #145, #147 y #151).
- Web: favicon SVG, enlace «App» en la cabecera y página `/app`. El botón de Android descarga `releases/latest/download/renfe.apk` y usa el tren de la portada; iOS sale «En proceso».
- APK con EAS (perfil `preview`, proyecto `@alos209/renfe-app`): v1.0.0 y v1.1.0 en GitHub Releases. La 1.1.0 trae el logo nuevo (frontal de tren blanco sobre `#81005E`) y el ONNX para la cara.
- Parche pnpm de `onnxruntime-react-native` para Gradle 9 (`patches/`).
- La app usa el Docker por Funnel y, si cae, pasa sola a Render (`_layout.tsx`, respaldo por defecto `https://renfe-api.onrender.com`).
- Render arreglado: faltaba `SUPABASE_URL` y la migración `20261103120000_extras_reserva.sql` en la nube (aplicada a mano en el SQL Editor). Prueba de punta a punta en Render: login, cara, reserva creada y cancelada.

## Qué queda / avisos
- Rubén desactiva R8 en #153 porque la APK se cerraba al abrir: hay que sacar una APK nueva (v1.1.1) desde `develop` y subirla como latest.
- Probar la APK en un móvil real: icono, pago con cámara.
- iOS sin build.
- `QR_SIGNING_PRIVATE_KEY` se compartió por chat: rotarla antes de cualquier uso serio.

## Rama y PR
Notas en `docs/vault-apk-render-logo`. Código ya fusionado en `main`.
