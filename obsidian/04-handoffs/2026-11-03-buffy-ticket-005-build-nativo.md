---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-005, face, mobile, build, bloqueo]
estado: bloqueado
---

# Handoff — Ticket 005: build nativo y prueba facial (bloqueado por entorno)

## Qué se hizo

**Comprobado lo que no necesita dispositivo:**

- `npx expo config --type public` → OK (app.json, plugins y rutas de assets válidos).
- `npx expo export --platform android --output-dir .export-check` → **OK**: Metro genera el bundle de
  Android (Hermes, 5,3 MB) y **empaqueta los dos modelos** (`arcface-w600k-mbf.onnx` 13 MB y
  `det-500m.onnx` 2,5 MB). El directorio temporal se borró después.
- `metro.config.js` añade `onnx` a `assetExts`, que es lo que hace falta para que `require` de los
  modelos funcione al compilar.
- `assets/modelos/` contiene los dos modelos esperados.

**No se pudo hacer lo que pide el ticket:**

- **No hay Android SDK ni `adb`:** `ANDROID_HOME`/`ANDROID_SDK_ROOT` vacíos y `adb` no existe. Por eso
  no se puede ejecutar `npx expo run:android` ni instalar nada.
- **No hay dispositivo conectado** ni emulador; el ticket pide un dispositivo real y el facial usa la
  cámara.
- **No hay `eas-cli`** (`npx eas --version` falla) ni sesión de Expo, así que `eas build --profile
  preview --platform android` no se puede lanzar. Además, un build en la nube sube el proyecto a Expo:
  no se hace sin que la persona lo autorice y tenga cuenta.
- `java -version` da **Java 25**; el Gradle de React Native 0.88 suele pedir JDK 17/21. Aun con SDK
  instalado, habría que usar un JDK compatible.

## Qué queda (para quien tenga SDK y móvil)

1. Instalar Android SDK + `adb` y un **JDK 17/21** (no el 25 de esta máquina).
2. Con el móvil por USB y depuración activada: `npx expo run:android` (build de desarrollo).
   Alternativa sin SDK local: `eas build --profile preview --platform android` (APK interno) e
   instalar el APK a mano.
3. Con `EXPO_PUBLIC_API_URL` apuntando a una API de prueba (nunca credenciales en Git), comprobar:
   - Carga de los modelos ONNX y permiso de cámara (concedido y denegado).
   - Registro de cara desde Cuenta (`/cara?modo=registrar`) y reconocimiento (`/cara`).
   - **Confirmación facial antes de pagar** (ticket 004): comprar, cancelar, cara distinta y error.
   - Cierre de la cámara al salir y liberación del recurso.
4. Registrar en el handoff dispositivo, plataforma, comandos, resultado y bloqueos.

## Bloqueos / preguntas para otros

- **Bloqueo de hardware:** sin SDK ni dispositivo no hay build instalable ni prueba facial real. Es
  el mismo bloqueo que ya consta en [[2026-11-02-ruben-facial-movil]] y en
  [[handoffs-pendientes]]; no es un problema del código.
- Si alguien tiene un móvil Android y SDK, este ticket se cierra en una sesión.

## Cambios en contratos

- Ninguno.

## Ficheros tocados

- `tickets/ticket-005.md` (estado y comprobaciones)
- Vault: este handoff
