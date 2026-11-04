---
fecha: 2026-11-04
autor: Buffy (agente de Rubén)
area: mobile
para: Alex
rama: fix/mobile-apk-r8
pr: 153
tags: [handoff, urgente, apk, android, eas, workmanager, r8]
estado: arreglado en código, pendiente de compilar
---

# Handoff URGENTE — la APK se cierra al abrir (WorkManager / R8)

## Qué pasa

El APK interno se cierra nada más abrir, antes de pintar nada:

```
Caused by: java.lang.RuntimeException: Failed to create an instance of class
  androidx.work.impl.WorkDatabase.canonicalName
  at androidx.work.WorkManagerInitializer.b(...)
  at androidx.startup.InitializationProvider.onCreate(...)
```

## Causa

El APK está compilado **con R8 activado** (`enableMinifyInReleaseBuilds: true` en `app.json`, que
escribe `android.enableMinifyInReleaseBuilds=true` en `gradle.properties`). R8 renombra
`androidx.work.impl.WorkDatabase_Impl` —en la traza aparece como `at v06.a(...)`— y Room lo busca
**por nombre con reflexión** (`Class.forName("androidx.work.impl.WorkDatabase_Impl")`), así que al
no encontrarlo lanza ese `RuntimeException` y mata el proceso.

`androidx.work` entra por `expo-notifications` (notificaciones locales de avisos), no por código
nuestro: no hay `expo-task-manager` ni background tasks en la app.

## Arreglo (ya en la rama, PR #153)

`frontend/mobile/app.json`, plugin `expo-build-properties`:

- `enableMinifyInReleaseBuilds: false` — vuelve al valor por defecto de React Native. Es lo único
  que garantiza que nada de Room/WorkManager se renombre; no se pierde nada en una demo interna.
- Se mantienen y amplían las reglas de ProGuard (`-keep class androidx.work.**`, el `_Impl` explícito,
  `androidx.room.**` y el `<init>()` de las `RoomDatabase`) por si alguien vuelve a activar minify.

## Qué tienes que hacer tú

1. Comprueba que la rama tiene el cambio: `git checkout fix/mobile-apk-r8 && git pull`.
2. Compila un APK nuevo (**el que falla no sirve: el arreglo es de configuración, hay que reconstruirlo**):
   ```bash
   cd frontend/mobile
   npx eas-cli login                 # cuenta alos209, dueña del proyecto EAS
   npx eas-cli build --profile preview --platform android
   ```
3. Desinstala la app anterior del móvil antes de instalar el APK nuevo (si no, Android puede
   reutilizar datos de la versión rota).

## Cómo comprobar que queda cerrado

- La app abre y llega a la portada sin cerrarse.
- Llega una notificación local de avisos con sesión (es lo que inicializa WorkManager).
- `/cara` carga los modelos ONNX y pide cámara (ticket 005).
- `npx expo config --type public` sigue en verde con el plugin aplicado.

## Límites

- No he podido compilar ni instalar nada aquí (sin Android SDK, sin `adb`, sin sesión de EAS con
  permisos): el diagnóstico sale de la traza y de la configuración, no de un APK reproducido.
- Si al desactivar minify el APK creciera demasiado para la entrega, la alternativa es volver a
  activarlo **con** las reglas que ya están puestas y verificar que `WorkDatabase_Impl` sobrevive
  en el `mapping.txt`; para el 06/11 no lo recomiendo.

## Ficheros tocados

- `frontend/mobile/app.json` (plugin `expo-build-properties`).
