# Ticket 023 — La APK se cierra al abrir (R8 + WorkManager/Room)

- **Prioridad:** P0 (bloquea la demo)
- **Área:** `frontend/mobile`, build Android
- **Estado:** Arreglado en código; **pendiente de compilar un APK nuevo**
- **Dependencias:** [ticket-005](ticket-005.md) (build instalable), #147 (EAS de Alex)

## Problema observado

Al abrir el APK interno, la app se cierra antes de pintar:

```
Caused by: java.lang.RuntimeException: Failed to create an instance of class
  androidx.work.impl.WorkDatabase.canonicalName
  at androidx.work.WorkManagerInitializer.b(...)
  at androidx.startup.InitializationProvider.onCreate(...)
```

## Causa

El build de release iba con R8 activado (`enableMinifyInReleaseBuilds: true` en el plugin
`expo-build-properties`). R8 renombra `androidx.work.impl.WorkDatabase_Impl` (en la traza, `v06`) y
Room lo busca por nombre con reflexión, así que falla al crear la base de datos de WorkManager.
WorkManager no es código nuestro: entra por `expo-notifications`.

## Criterios de aceptación

- La app abre y llega a la portada sin cerrarse.
- Las notificaciones locales de avisos funcionan (son las que inicializan WorkManager).
- `/cara` carga los modelos ONNX y pide cámara (ticket 005).

## Resolución (2026-11-04, rama `fix/mobile-apk-r8`, PR #153)

- `enableMinifyInReleaseBuilds: false` (valor por defecto de RN): no se renombra nada de
  Room/WorkManager.
- Se conservan y amplían las reglas de ProGuard (`androidx.work.**`, el `_Impl` explícito,
  `androidx.room.**`) por si se vuelve a activar minify.

## Verificación

Hay que **reconstruir** el APK (`npx eas-cli build --profile preview --platform android` con la
cuenta `alos209`) y desinstalar la versión rota antes de instalar la nueva. Detalles en
[[2026-11-04-buffy-apk-workmanager]].
