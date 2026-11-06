---
fecha: 2026-11-06
autor: Rubén
area: frontend
para: Alex
rama: docs/vault-cara-inferencesession
pr:
tags: [handoff, facial, onnx]
---

# Handoff — El facial no arranca: `InferenceSession` of `undefined`

Ticket: **#165** (label `bug` + `frontend`, asignado a Alex).
Antecedente: [[2026-11-05-alex-apk-mapa-cara-teclado]] (mapa, foto reducida y teclado).

## Qué se hizo

Investigación del cierre de la app al entrar en la pantalla de la cara. **No se ha cambiado código.**

**Síntoma**: en el APK, al entrar en `/cara` (Cuenta, pago o registro de la cara) sale
`Cannot read property 'InferenceSession' of undefined` y la app se cierra. **No es el OOM del #163**:
aquel era la decodificación del JPEG a resolución completa y ese arreglo sí está en `develop` (v1.1.2).
Este error salta antes, al cargar los modelos.

**Qué significa el mensaje**: `require("onnxruntime-react-native")` devolvió `undefined`. Punto exacto
en `frontend/mobile/src/fotos/ficha.ts`:

- `runtime()` (líneas 13-20) protege el `require` con `try/catch`, pero devuelve lo que devuelva el
  `require` sin comprobarlo.
- El acceso a la propiedad está **fuera** del `try`: `runtime().InferenceSession.create(...)` en
  `cargarModelos()` (líneas 50-51) y `runtime().Tensor` en `detectarCara` / `huellaArcFace`
  (líneas 77 y 90).

Por eso el `catch` no atrapa nada y `cara.tsx` (líneas 155-163) acaba pintando el `TypeError` crudo
con `setError(e.message)`, en vez del mensaje «necesita la app instalada».

**El módulo nativo no está enlazado en esa build**. Comprobado en local:

```
npx.cmd expo-modules-autolinking react-native-config --platform android
```

Lista `@react-native-masked-view/masked-view`, `react-native-gesture-handler`, `react-native-maps`,
`react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`,
`react-native-view-shot` y `react-native-worklets`. **`onnxruntime-react-native` no aparece**, aunque
está en `frontend/mobile/package.json` y resuelve (`node_modules/onnxruntime-react-native` es un
junction de pnpm).

Dos pistas más:

- `frontend/mobile/app.json` **no** incluye el config plugin que trae el propio paquete
  (`onnxruntime-react-native/app.plugin.js`), que es el que inyecta
  `implementation project(':onnxruntime-react-native')` en `android/app/build.gradle`. En el `android/`
  generado en local no hay ni una línea de `onnxruntime`.
- El paquete trae `unimodule.json` y `expo-modules-autolinking` lo lee como config de módulo Expo
  (`EXPO_MODULE_CONFIG_FILENAMES` en `ExpoModuleConfig.js` incluye `unimodule.json`). Candidato a
  quedarse entre los dos pases (módulos Expo y módulos RN) y no enlazarse por ninguno.

**No es una regresión obvia**: el `renfe-app-arm64.apk` v1.0.0 del repo **sí** trae
`lib/arm64-v8a/libonnxruntime.so` y `libonnxruntimejsi.so` (comprobado con `tar -tf` y `aapt2`), así
que en algún momento sí se enlazaba.

## Qué queda

1. Confirmar el binario instalado y ver el log nativo:
   ```
   adb shell dumpsys package com.alexoses.renfeapp | findstr versionName
   adb logcat *:E | findstr -i "onnx ort reactnativejs"
   ```
2. `npx expo prebuild --clean` y mirar si `android/app/build.gradle` acaba con la línea de
   `onnxruntime-react-native`. Si no aparece, añadir `"onnxruntime-react-native"` a `plugins` en
   `app.json`; si sigue sin aparecer, probar a quitar el `unimodule.json` del paquete con el parche que
   ya existe en `patches/onnxruntime-react-native@1.24.3.patch` (el mismo sitio donde está el arreglo
   de Gradle 9 y de `MAX_PATH` en Windows).
3. Arreglar el guard de `runtime()` mientras tanto: `if (!m?.InferenceSession) throw new Error(...)`.
   Un `TypeError` de propiedad de `undefined` no le dice nada a nadie.
4. Sacar APK nueva cuando esté, y volver a las notas del release: hay que **desinstalar** la anterior.

## Bloqueos / preguntas para otros

- **Alex**: ¿con qué build se reproduce? Si es un APK de EAS, la diferencia entre ese entorno y el
  local puede ser justo el autolinking. Y conviene saber si el facial llegó a funcionar alguna vez en
  el móvil (v1.0.0 tenía las `.so`, pero nadie ha confirmado que la cara funcionara en un dispositivo).
- Rubén: no tengo la app compilada en mi PC, así que la prueba en móvil real la tiene que hacer alguien
  que pueda instalar el APK.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- Solo esta nota y mi fila de [[estado-equipo]]. El diagnóstico se apoya en
  `frontend/mobile/src/fotos/ficha.ts`, `frontend/mobile/src/app/cara.tsx`,
  `frontend/mobile/app.json` y `patches/onnxruntime-react-native@1.24.3.patch`.
