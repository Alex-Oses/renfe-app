# @renfe/mobile — App Expo (iOS y Android)

Expo SDK 58 con expo-router y TypeScript estricto. Funciona en **Expo Go** (sin módulos nativos fuera del SDK).
La lógica (cliente de la API, simulados, QR, tokens de diseño) viene de `@renfe/shared` (ver ADR-005).

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
| `EXPO_PUBLIC_WEB_URL` | web, para el botón «Entrar con tu cara» de Cuenta | no sale el botón |

En el móvil **no uses `localhost`**: es el propio teléfono. Pon la IP del PC en la red local
(p. ej. `EXPO_PUBLIC_API_URL=http://192.168.1.40:3000`), con el móvil en la misma wifi. `localhost` solo
sirve en modo web (`expo start --web`, puerto 8081, que es el único origen que admite el CORS de la API local).

Expo Go: instala la versión compatible con **SDK 58** (la de la tienda si está al día; si no, la que
ofrece `expo start` al pulsar `a`/`i`). Todo funciona en Expo Go:

- Abonos (`/abonos`, `/comprar-abono`, `/abono/[id]` con QR), desde Cuenta.
- Modo revisor (`/revisor`, cuentas con rol `revisor` o `admin`): lee el QR con `expo-camera`.
- Asistente Renfe (`/chatbot`, accesible desde Cuenta): mantiene la conversación, responde sobre
  trenes/estaciones/horarios y muestra tarjetas de tren enlazadas al flujo de compra.
- Avisos: cada 20 s, con sesión, revisa billetes y líneas favoritas y lanza **notificaciones locales**
  (`expo-notifications`). Sin push remoto: Expo Go no lo admite.
- Login facial: la huella usa onnxruntime-web y no corre en Expo Go; el botón abre la web en `/acceder`.

## Estructura

- `src/app/`: rutas. Pestañas `(tabs)/`: Comprar, En directo, Billetes, Líneas, Cuenta; `pasajero`, `billete/[id]`, `abonos`, `comprar-abono`, `abono/[id]` y `revisor`.
- `src/components/`: botón, tarjeta de billete, mapa (`MapaTrenes.web.tsx` es el sustituto en web).
- `src/polyfills.ts`: `localStorage` (expo-sqlite) y `crypto` (expo-crypto + @noble/hashes para SHA-256/HMAC).
- `src/tema.ts`: estilos hechos solo con `@renfe/shared/tema/tokens` y la fuente Instrument Sans.

Metro no necesita `metro.config.js`: desde el SDK 52 Expo detecta el monorepo pnpm solo.

## Compilar con EAS

`eas build --profile preview --platform android` saca un APK interno. Perfiles en `eas.json`:
`development` (dev client), `preview` (APK interno) y `production`.
