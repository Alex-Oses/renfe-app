---
fecha: 2026-11-02
autor: Rubén
area: mobile
para: Alex, Kevin
rama: feat/mobile-facial-en-app
pr: "123"
tags: [handoff, facial, movil, onnx, expo, arcface]
estado: abierto
---

# Handoff — Facial nativo en la app (sin navegador ni WebView)

## Qué se hizo

- **La app entra con la cara de forma nativa**: pantalla `/cara` (`frontend/mobile/src/app/cara.tsx`)
  con `<CameraView>` de `expo-camera`, permisos gestionados con `useCameraPermissions` (petición al
  entrar, pantalla de permiso denegado con `Linking.openSettings` si `canAskAgain`) y el mismo método
  que la web: **SCRFD detecta la cara y ArcFace 512 calcula la huella, todo en el dispositivo**
  (ADR-007). **No se abre el navegador ni WebView para nada.**
- **Pipeline nuevo en `frontend/mobile/src/fotos/`**:
  - `matematica.ts`: lógica pura (preparar 640×640 y normalizar, decodificar SCRFD con NMS,
    alineación por semejanza de Umeyama a 112×112, recorte, semejanza de coseno, normalización).
  - `ficha.ts`: carga de los dos ONNX con `onnxruntime-react-native` (`Asset.fromModule`), foto
    JPEG → RGBA con `jpeg-js`, `detectarCara` y `huellaArcFace`.
  - `matematica.test.mjs`: **6 tests con `node --test`** (`pnpm --filter @renfe/mobile test`),
    sin cámara ni ONNX, que cubren la matemática entera antes de poder probarla en un móvil.
- **Modelos empaquetados**: `frontend/mobile/assets/modelos/{det-500m.onnx,arcface-w600k-mbf.onnx}`
  (SCRFD 500m de `buffalo_s`, 2,5 MB; el embedding es el `w600k_mbf` que ya usa la web) con
  `metro.config.js` añadiendo `onnx` a `assetExts`.
- **Dependencias**: + `onnxruntime-react-native`, `jpeg-js`, `expo-asset`, `expo-file-system`,
  `expo-camera`; **− `react-native-webview`** (ya no se usa en ningún sitio).
- **Camino WebView borrado**: `?movil=1` eliminado de `frontend/web/src/paginas/Acceder.tsx` (la web
  queda **sin cambios respecto a `develop`**), y `EXPO_PUBLIC_WEB_URL` fuera de `cuenta.tsx`,
  `.env.example` y del README. Cuenta navega a `/cara` con el email como parámetro.
- **Registro también nativo**: opción «Registrar mi cara» → `/cara?modo=registrar`, con paso de email.
  Bucle de captura (varias fotos, media de huellas) y estados de ok / error / reintentar.
- `frontend/mobile/app.json`: permiso de cámara actualizado (revisor + facial).
- README del móvil reescrito: el facial **no corre en Expo Go** y hay que compilar
  (`npx expo run:android` o `eas build --profile preview --platform android`).

## Qué queda

- **Compilar y probar en un móvil**: en mi PC **no hay Android SDK, JDK ni Android Studio**, así que
  el build no se ha podido hacer aquí. Es lo primero en cuanto haya máquina con el SDK: la app ya no
  se puede probar en Expo Go (falta `onnxruntime-react-native`).
- **Medir el umbral con la cámara** (misma persona con gafas/rotación vs. personas distintas) y, si
  hace falta, ajustar `config_cara`. Sin liveness por ahora: los 5 puntos de SCRFD no dan párpados
  (límite anotado con `shortcut:` en `ficha.ts`).
- **Alex**: revisar `cara.tsx` y `cuenta.tsx` antes de la congelación del 04/11 (es su área).
- **Kevin**: ya **no hace falta `EXPO_PUBLIC_WEB_URL`** en ningún `.env` ni desplegar la web con
  `?movil=1`. La única que queda es `frontend/Dockerfile` (`ENV EXPO_PUBLIC_WEB_URL=$WEB_URL`), que
  ya no la lee nadie: puedes quitarla junto al `ARG WEB_URL` cuando toques el Docker. Si la app se
  compila con EAS, solo toca el perfil de `eas.json`.

## Bloqueos / preguntas para otros

- **Ninguno técnico para el equipo**: la API y los contratos no cambian.
- Arreglo ajeno que he tenido que tocar: `frontend/shared/api/cliente.test.ts` (área de Alex) caducó
  hoy — la parada llegaba el 02/11 a las 08:32 y el test ya no coincide con el reloj. Pasa la fecha a
  2099 para que no dependa del día. **Alex: revísalo**, es un cambio de 3 líneas en un fixture.

## Cambios en contratos

Ninguno. `/auth/cara/verificar` y `/auth/cara/registrar` siguen igual y el vector lo calcula el
dispositivo (ADR-007).

## Ficheros tocados

- `frontend/mobile/src/fotos/` (nuevo: `matematica.ts`, `ficha.ts`, `matematica.test.mjs`)
- `frontend/mobile/src/app/cara.tsx` (nuevo), `src/app/(tabs)/cuenta.tsx`, `src/app/_layout.tsx`
- `frontend/mobile/assets/modelos/` (nuevo), `metro.config.js` (nuevo), `app.json`, `package.json`,
  `README.md`
- `frontend/shared/api/cliente.test.ts` (fixture de fecha)
- `.env.example`, `pnpm-lock.yaml`
- Vault: este handoff, ADR-007 (2ª actualización), `estado-equipo.md`
