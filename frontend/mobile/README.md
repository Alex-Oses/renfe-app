# @renfe/mobile — App Expo (iOS y Android)

Expo SDK 58 con expo-router y TypeScript estricto. Funciona en **Expo Go** (sin módulos nativos fuera del SDK).
La lógica (cliente de la API, simulados, QR, tokens de diseño) viene de `@renfe/shared` (ver ADR-005).

## Ejecutar

```bash
pnpm install            # desde la raíz
pnpm dev:mobile         # expo start; escanea el QR con Expo Go
```

Variables (en `.env` de la raíz o de esta carpeta): `EXPO_PUBLIC_API_URL` (vacía = datos simulados) y
`EXPO_PUBLIC_POSICIONES_URL` (vacía = `https://renfe-api.onrender.com`).

## Estructura

- `src/app/`: rutas. Pestañas `(tabs)/`: Comprar, En directo, Billetes, Líneas, Cuenta; `pasajero` y `billete/[id]`.
- `src/components/`: botón, tarjeta de billete, mapa (`MapaTrenes.web.tsx` es el sustituto en web).
- `src/polyfills.ts`: `localStorage` (expo-sqlite) y `crypto` (expo-crypto + @noble/hashes para SHA-256/HMAC).
- `src/tema.ts`: estilos hechos solo con `@renfe/shared/tema/tokens` y la fuente Instrument Sans.

Metro no necesita `metro.config.js`: desde el SDK 52 Expo detecta el monorepo pnpm solo.

## Compilar con EAS

`eas build --profile preview --platform android` saca un APK interno. Perfiles en `eas.json`:
`development` (dev client), `preview` (APK interno) y `production`.
