# Ticket 005 — Compilar y validar la app nativa con reconocimiento facial

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `face`
- **Estado:** **Bloqueado por entorno**: bundle Android verificado; falta build instalable y dispositivo real
- **Dependencias:** [ticket-004](ticket-004.md) para validar el flujo de confirmación de compra

## Objetivo

Obtener un build instalable de Android y comprobar el flujo facial en un dispositivo real; el README indica que Expo Go no soporta el módulo nativo ONNX.

## Criterios de aceptación

- Seguir los perfiles y comandos existentes de Expo/EAS, sin cambiar dependencias nativas salvo que el build demuestre que es necesario.
- El build termina y se puede instalar en un dispositivo compatible.
- Verificar carga de modelos, permisos/cámara, registro o reconocimiento, cierre de cámara y gestión de errores.
- Si depende de API, documentar variables y configurar solo valores de prueba; no incluir credenciales en Git.
- Registrar dispositivo/plataforma, comandos, resultado y bloqueos en el handoff.
- No publicar en una tienda ni distribuir un build de producción.

## Verificación

Usar el build interno/de desarrollo descrito en `frontend/mobile/README.md` y realizar una prueba manual con consentimiento.

## Estado (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Verificado sin dispositivo:**

- `npx expo config --type public` correcto.
- `npx expo export --platform android` correcto: bundle Hermes de Android generado y los dos modelos
  ONNX empaquetados (`arcface-w600k-mbf.onnx` 13 MB, `det-500m.onnx` 2,5 MB).
- `metro.config.js` incluye `onnx` en `assetExts` y `assets/modelos/` tiene los modelos.

**Bloqueo (no es un fallo del código):**

- No hay Android SDK ni `adb` (`ANDROID_HOME` vacío) ni dispositivo/emulador: no se puede ejecutar
  `npx expo run:android` ni instalar el APK.
- No hay `eas-cli` ni sesión de Expo: no se puede lanzar un build en la nube sin cuenta y sin subir
  el proyecto, algo que no se hace sin autorización.
- El JDK instalado es **Java 25**; RN 0.88 suele necesitar JDK 17/21.

**Para cerrarlo:** SDK + JDK compatible + móvil USB → `npx expo run:android` (o `eas build --profile
preview --platform android`), y probar carga de modelos, permisos, registro/reconocimiento, la
confirmación facial del ticket 004 y el cierre de cámara. Comandos y checklist en
[[2026-11-03-buffy-ticket-005-build-nativo]].
