---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend / mobile / docs
para: alex
rama: fix/mobile-tickets-pendientes
pr: 143
tags: [handoff, pr-143, pr-140, pr-142, apk, mobile]
estado: abierto
---

# Handoff — Integración de las PR 140 y 142 y APK de prueba

## Qué se hizo

- Se integró `origin/pr-142` (que ya incluye la PR 140) en `fix/mobile-tickets-pendientes` con el
  merge `e48bc74`. La PR 143 sigue abierta y **no se ha fusionado**.
- Se recuperaron los contratos que la PR 142 dejó atrás: `TransbordoApi`, `Billete.transbordos`,
  `obtenerEstacion`, `calcularPrecio`, el corte de compra sin sesión, el aviso de tren ya salido y
  `misBilletes` con transbordos.
- Se corrigieron los tipos de `Animated.View` y `Animated.ScrollView` para React 19 y se resolvió el
  choque de `react-native-view-shot` con `@types/react` 18 usando su declaración pública.
- Se restauró el script de tests móviles y se actualizó `hoja.test.mjs` al contrato nuevo de la PR
  142: ScrollView propio y lista sin `FlatList`.
- Se retiraron las etiquetas académicas que reintrodujo la PR 142 y el último enlace al directorio
  de skills retirado.
- Se documentó el APK release local ARM64 en `frontend/mobile/README.md`.

## Qué queda

- Revisión, aprobación y merge humano de la PR 143.
- Regenerar `renfe-app-arm64.apk` si se vuelve a tocar código que afecte al binario.

## Bloqueos / preguntas para otros

- El APK no se ha instalado ni probado en un dispositivo físico en esta sesión.
- La PR 142 estaba `dirty` respecto a `develop`; el merge local resuelve esos conflictos, pero la
  comprobación final de GitHub depende de que el remoto acepte el push.

## Cambios en contratos

- Vuelven `Billete.transbordos` y `TransbordoApi` al contrato compartido para que `agrupar` y
  `misBilletes` conserven los transbordos que devuelve la API.

## Comprobación

- `pnpm --filter @renfe/shared test` → **179**.
- `pnpm --filter @renfe/web test` → **39**.
- `pnpm --filter @renfe/mobile test` → **21**.
- `shared lint`, `web lint`, `mobile lint` y `api lint` en verde.
- `git diff --check` sin errores.
- APK: build release ARM64 firmado con la clave de debug; comandos y salida documentados en el
  README móvil.

## Ficheros tocados

- `frontend/mobile/README.md`
- `frontend/mobile/package.json`
- `frontend/mobile/tsconfig.json`
- `frontend/mobile/src/app/(tabs)/index.tsx`
- `frontend/mobile/src/app/pasajero.tsx`
- `frontend/mobile/src/components/EntradaTren.tsx`
- `frontend/mobile/src/components/Pie.tsx`
- `frontend/mobile/src/components/hoja.test.mjs`
- `frontend/shared/api/cliente.ts`
- `frontend/shared/api/tipos.ts`
- `tickets/README.md`
- `obsidian/04-handoffs/2026-11-03-buffy-integracion-pr-140-142-y-apk.md`
