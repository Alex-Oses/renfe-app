# @renfe/mobile — App Expo (iOS, Android y web)

Expo SDK 58 con expo-router y TypeScript estricto. La lógica (cliente de la API, simulados, QR,
tokens de diseño) viene de `@renfe/shared` (ver ADR-005).

**El reconocimiento facial corre en el dispositivo** (SCRFD + ArcFace con `onnxruntime-react-native`,
ver el ADR-007 en `obsidian/03-decisiones/`), así que esta pantalla **no funciona en Expo Go**: hay
que compilar la app (`npx expo run:android` o EAS, ver más abajo). El resto de la app sí funciona
en Expo Go.

## Ejecutar

```bash
pnpm install            # desde la raíz
pnpm dev:mobile         # expo start; escanea el QR con Expo Go
```

Variables (en `.env` de la raíz o de esta carpeta):

| Variable | Para qué | Vacía |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | API NestJS (billetes, abonos, cuenta, revisor) | datos simulados en el dispositivo |
| `EXPO_PUBLIC_POSICIONES_URL` | posiciones de trenes del mapa en directo | `https://renfe-api.onrender.com` |

En el móvil **no uses `localhost`**: es el propio teléfono. Pon la IP del PC en la red local
(p. ej. `EXPO_PUBLIC_API_URL=http://192.168.1.40:3000`), con el móvil en la misma wifi. `localhost` solo
sirve en modo web (`expo start --web`, puerto 8081, que es el único origen que admite el CORS de la API local).

Expo Go: instala la versión compatible con **SDK 58** (la de la tienda si está al día; si no, la que
ofrece `expo start` al pulsar `a`/`i`). El resto de la app funciona en Expo Go:

- Abonos (`/abonos`, `/comprar-abono`, `/abono/[id]` con QR), desde Cuenta.
- Modo revisor (`/revisor`, cuentas con rol `revisor` o `admin`): lee el QR con `expo-camera`.
- Asistente Renfe (`/chatbot`, accesible desde Cuenta): mantiene la conversación, responde sobre
  trenes/estaciones/horarios y muestra tarjetas de tren enlazadas al flujo de compra.
- Avisos: cada 20 s, con sesión, revisa billetes y líneas favoritas y lanza **notificaciones locales**
  (`expo-notifications`). Sin push remoto: Expo Go no lo admite.
- Login facial (`/cara`, desde Cuenta): **nativo**, con modelos ONNX empaquetados en
  `assets/modelos/`; requiere app compilada (no corre en Expo Go).

## Estructura

- `src/app/`: rutas. Pestañas `(tabs)/`: Comprar, En directo, Billetes, Líneas, Cuenta; `pasajero`, `billete/[id]`, `abonos`, `comprar-abono`, `abono/[id]`, `revisor` y `cara` (facial).
- `src/components/`: botón, tarjeta de billete, mapa (`MapaTrenes.web.tsx` es el sustituto en web).
- `src/fotos/`: pipeline del facial — `matematica.ts` (alineación, recorte, semejanza; lógica pura,
  con tests en `matematica.test.mjs`) y `ficha.ts` (carga de los modelos ONNX y huella ArcFace).
- `src/polyfills.ts`: `localStorage` (expo-sqlite) y `crypto` (expo-crypto + @noble/hashes para SHA-256/HMAC).
- `src/tema.ts`: estilos hechos solo con `@renfe/shared/tema/tokens` y la fuente Instrument Sans.

`metro.config.js` solo añade `onnx` a los assets de Metro para empaquetar los modelos de
`assets/modelos/` (`det-500m.onnx`, `arcface-w600k-mbf.onnx`).

## Compilar (necesario para el facial)

El facial necesita `onnxruntime-react-native` (módulo nativo), así que la app se compila en vez de
usarse desde Expo Go:

```bash
npx expo run:android     # build de desarrollo con el móvil conectado por USB
# o, sin SDK de Android instalado:
eas build --profile preview --platform android   # APK interno (ver eas.json)
```

`eas build --profile preview --platform android` saca un APK interno. Perfiles en `eas.json`:
`development` (dev client), `preview` (APK interno) y `production`.

## APK de prueba (Android)

El APK de prueba se compila en local, sin EAS, para un dispositivo ARM64:

```bash
pnpm --filter @renfe/mobile exec expo prebuild --platform android --no-install
cd frontend/mobile/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Queda en `android/app/build/outputs/apk/release/app-release.apk`; en la raíz del repo se guarda
una copia como `renfe-app-arm64.apk`. Es un build **release firmado con la clave de debug**: sirve
para probar en un móvil ARM64, no para publicar. Las variables `EXPO_PUBLIC_*` se embeben al
compilar, así que hay que definirlas antes de lanzar Gradle.

En Windows, si Gradle falla por la longitud de la ruta, compila desde una ruta corta (por ejemplo
`C:
`) o usa `eas build --profile preview --platform android`.
