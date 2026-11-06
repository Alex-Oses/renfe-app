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
- **Causa confirmada** en el código de `expo-modules-autolinking`
  (`build/reactNativeConfig/androidResolver.js`):
  ```js
  if (reactNativeConfig === undefined && expoModuleConfig?.supportsPlatform('android')) {
    if (!!gradle && !expoModuleConfig?.rawConfig.android?.gradlePath) return null; // no se enlaza
  }
  ```
  El paquete cumple las tres: no tiene `react-native.config.js`, el `unimodule.json` lo delata como
  módulo Expo (`EXPO_MODULE_CONFIG_FILENAMES` en `ExpoModuleConfig.js` incluye `unimodule.json`) y
  tiene `android/build.gradle` sin `gradlePath` en ese JSON. Lo descartan los dos pases.
  Con el `native_modules.gradle` de versiones anteriores de Expo esto no pasaba, y por eso la v1.0.0
  sí llevaba las `.so`.

## Arreglo (PR #167)

- `frontend/mobile/react-native.config.js` (nuevo) declara la dependencia con sus plataformas: el
  `dependencies` del proyecto manda sobre el config del paquete, así que deja de cumplirse la regla
  de conflicto. Comprobado: el autolinking ya devuelve `import ai.onnxruntime.reactnative.OnnxruntimePackage;`
  y `new OnnxruntimePackage()`.
- `ficha.ts`: `runtime()` comprueba el resultado del `require` y lanza un mensaje legible en vez de
  dejar que reviente el `TypeError`.
- `app.json`: versión 1.1.3.

## Qué queda

1. Sacar el APK con EAS (cuenta nueva) y comprobar dentro del fichero:
   `tar -tf renfe.apk | findstr onnxruntime` → debe salir `lib/arm64-v8a/libonnxruntime.so`.
2. Instalarlo **desinstalando antes** el 1.1.2 y entrar en Cuenta > Acceso con la cara.
3. Si algo falla, `adb logcat *:E | findstr -i "onnx ort reactnativejs"` y
   `adb shell dumpsys package com.alexoses.renfeapp | findstr versionName` para saber qué build corre.

## Bloqueos / preguntas para otros

- **Alex**: queda el build con EAS en la cuenta del equipo y probarlo en un móvil real: el CI no
  compila la app nativa, así que el enlazado solo se confirma mirando el APK.
- Rubén: no tengo la app compilada en mi PC, así que la prueba en móvil real la tiene que hacer alguien
  que pueda instalar el APK.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- Solo esta nota y mi fila de [[estado-equipo]]. El diagnóstico se apoya en
  `frontend/mobile/src/fotos/ficha.ts`, `frontend/mobile/src/app/cara.tsx`,
  `frontend/mobile/app.json` y `patches/onnxruntime-react-native@1.24.3.patch`.
