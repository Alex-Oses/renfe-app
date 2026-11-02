---
fecha: 2026-11-02
autor: Alex
area: frontend
para: todos
rama: feat/mobile-billetes-y-abonos
pr: (sin abrir)
tags: [handoff]
---

# Handoff — Mis billetes de la app igual que la web

## Qué se hizo

- `agrupar.ts` y su test pasan de `frontend/web/src/paginas/billetes/` a `@renfe/shared/billetes/agrupar`. La web solo cambia ese import y la app usa el mismo código (antes tenía su propia copia sin transbordos en `src/billetes.ts`, que ahora solo guarda `slug`).
- Pestaña Billetes de la app: los dos tramos de un transbordo salen en una sola tarjeta (aviso de espera, llegada final, viajeros de los dos trenes, los dos localizadores y el total).
- Sección "Mis abonos" arriba con una tarjeta por abono, con el color de su tipo (como la web), QR y estado. Al tocarla abre `/abono/[id]`.
- Retraso en vivo (`RetrasoVivo`) en los billetes próximos con `posicionesTrenes` cada 30 s, solo con la app en primer plano (`AppState`).

## Qué queda

- Probar en Expo Go (Android/iOS): solo se ha mirado el export web.
- El retraso en vivo no se ha visto pintado: con los datos de prueba el tren no entraba en la ventana de `seguirRetraso`.

## Bloqueos / preguntas para otros

Ninguno.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `frontend/shared/billetes/agrupar.ts`, `agrupar.test.ts` (movidos), `frontend/shared/tsconfig.json`, `frontend/shared/README.md`
- `frontend/web/src/paginas/MisBilletes.tsx` (solo el import)
- `frontend/mobile/src/app/(tabs)/billetes.tsx`, `frontend/mobile/src/billetes.ts`
- `frontend/mobile/src/components/TarjetaBillete.tsx`, `TarjetaAbono.tsx` (nuevo), `RetrasoVivo.tsx` (nuevo)
