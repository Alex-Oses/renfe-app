---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-004, facial, mobile, pagos]
estado: abierto
---

# Handoff — Ticket 004: confirmar la compra con la cara antes de pagar

## Qué se hizo

**Decisión de contrato (sin cambios).** El contrato no tiene un endpoint de «verificación facial de
una compra» y la API **no tiene módulo de pagos**. No se ha inventado nada: se reutiliza
`POST /auth/cara/verificar` (el login facial, que ya compara contra la plantilla del email) como
**puerta de la compra**, y el resultado se liga a un **intento de compra concreto** generado en la
app. No se tocan endpoints, tablas ni el contrato de [[endpoints]]. Si más adelante se quiere un
justificante firmado por el servidor, eso sí sería un cambio de contrato aparte (post-entrega).

**Flujo móvil:**

1. En `pasajero.tsx` y `transbordo.tsx`, «Pagar» valida los datos y **exige sesión**. Si no hay
   sesión, avisa y no sale a la red.
2. Se crea un `intento` y se abre la pantalla `/cara` existente con `intento` y el email de la sesión
   (`modo=confirmar` implícito). La cámara se usa solo después de esa acción del usuario.
3. `cara.tsx` reutiliza el pipeline nativo de siempre (SCRFD + ArcFace 512, la foto no sale del
   teléfono) y llama a `verificarCara`. **Solo con éxito** cierra el intento como `ok` y vuelve a la
   pantalla de pago; entonces —y no antes— se envía `POST /reservas` o `/reservas/transbordo`.
4. Cancelar (botón o gesto del sistema), denegar la cámara, no tener cara registrada o un error de la
   API cierran el intento como `cancelado`/`error`: **no se compra** y la pantalla de pago explica
   que no se ha cobrado nada y que se puede reintentar. Reintentar en `/cara` invalida el resultado
   fallido anterior.
5. La cámara se libera al salir de `/cara` (la `CameraView` se desmonta) y el pago sigue siendo el
   simulado de antes (la reserva nace pagada en modo API; sin API, pago simulado).

**Piezas nuevas:**

- `frontend/mobile/src/compra/confirmacion-facial.ts`: estado del intento en memoria (abrir, cerrar,
  consumir una sola vez) y `decidirCompra()`, que solo deja continuar con `ok` y devuelve un mensaje
  recuperable en cancelación/error. Un resultado de otra compra no vale.
- `cara.tsx`: modo confirmación (título y textos propios, vuelta automática al pagar, sin mostrar
  fotos ni guardar nada nuevo).

**Pruebas:** `frontend/mobile/src/compra/confirmacion-facial.test.mjs` cubre éxito, cancelación,
rechazo de la API con motivo, error sin motivo, resultado de otra compra y consumo único. Total del
paquete móvil: **21 pruebas en verde**; `pnpm --filter @renfe/mobile lint` (`tsc --noEmit`) sin
errores.

## Qué queda

- **Probar en un build nativo** con una cara registrada, con una cara distinta y cancelando. Aquí no
  hay Android SDK, JDK ni dispositivo: la cámara y el ONNX no se han ejecutado. Las pruebas cubren
  la lógica de decisión, no la captura.
- **Web:** el pago de la web (`PasoPago.tsx`) no pide la cara. El ticket es de móvil; si se quiere
  paridad, sería otro ticket y la web ya tiene su propio facial (Human + ArcFace) reutilizable.
- **Justificante en servidor:** si se quiere que la compra quede ligada a la verificación también en
  la API, hace falta contrato nuevo (no existe `pagos`); anotado arriba, fuera de este ticket.

## Bloqueos / preguntas para otros

- Ninguno técnico. La decisión de no tocar el contrato está justificada por el propio ticket
  («si el contrato actual no permite verificar la cara para una compra, detenerse»): sí lo permite,
  reutilizando la verificación existente, sin endpoints nuevos.

## Cambios en contratos

- Ninguno.

## Ficheros tocados

- `frontend/mobile/src/compra/confirmacion-facial.ts` (nuevo)
- `frontend/mobile/src/compra/confirmacion-facial.test.mjs` (nuevo)
- `frontend/mobile/src/app/cara.tsx`
- `frontend/mobile/src/app/pasajero.tsx`
- `frontend/mobile/src/app/transbordo.tsx`
- `frontend/mobile/package.json` (script `test`)
- `tickets/ticket-004.md`
- Vault: este handoff
