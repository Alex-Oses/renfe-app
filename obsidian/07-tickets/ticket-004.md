# Ticket 004 — Pedir confirmación facial antes de completar el pago

- **Prioridad:** P0 — obligatorio
- **Área:** `frontend/mobile`, `frontend/shared`, `backend/api` si lo exige el contrato
- **Estado:** Arreglado; pendiente de probar en un build nativo con cámara
- **Dependencias:** Ninguna

## Objetivo

Antes de confirmar una compra, solicitar una verificación facial con el flujo existente del proyecto. Los pagos y reservas siguen siendo simulados: este ticket no integra pagos reales.

## Criterios de aceptación

- La verificación facial ocurre explícitamente antes de confirmar la compra y se asocia a ese intento de pago.
- Solo se continúa cuando la verificación tiene éxito; cancelar, denegar permisos, no tener cara registrada o fallar impide confirmar y muestra una explicación recuperable.
- Reutilizar la arquitectura y contratos de reconocimiento facial existentes; no crear un servicio facial Python ni duplicar el flujo de login sin necesidad.
- No guardar ni transmitir fotografías. Mantener el tratamiento de embeddings y la decisión de autenticación descritos en ADR-007.
- La cámara y el modelo se usan solo tras una acción clara del usuario y se libera la cámara al terminar.
- Añadir pruebas para éxito, rechazo, cancelación y error; conservar la simulación actual del pago después de la verificación.

## Decisiones necesarias

Si el contrato actual no permite verificar la cara para una compra, detenerse y proponer el cambio de contrato antes de modificar endpoints o base de datos.

## Verificación

Probar con un rostro registrado y con fallo/cancelación en el build nativo; Expo Go no valida los módulos faciales.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

- **Contrato:** no hacía falta cambiarlo. Se reutiliza `POST /auth/cara/verificar` (login facial, ya
  existente) como puerta de la compra y se liga el resultado a un **intento** generado en la app
  (`frontend/mobile/src/compra/confirmacion-facial.ts`). No hay endpoints, tablas ni contrato nuevos.
- **Flujo:** en `pasajero.tsx` y `transbordo.tsx`, «Pagar» exige sesión, crea el intento y abre `/cara`
  con ese intento y el email de la sesión. `cara.tsx` reutiliza el pipeline nativo y `verificarCara`;
  solo con éxito vuelve al pago y se envía la reserva. Cancelar (botón o gesto), cámara denegada, cara
  no registrada o error cierran el intento sin comprar y con un mensaje recuperable; reintentar
  invalida el fallo anterior. La cámara se libera al desmontar la pantalla.
- **Sin fotos:** solo viaja el embedding; no se guarda ni se transmite imagen (ADR-007).
- **Pago simulado:** se conserva el camino anterior (`comprarReserva`, que en modo API devuelve la
  reserva ya pagada y sin API hace intento + confirmación simulados).
- **Pruebas:** `confirmacion-facial.test.mjs` cubre éxito, cancelación, rechazo con motivo, error sin
  motivo, resultado de otra compra y consumo único. `pnpm --filter @renfe/mobile test` (21 pruebas) y
  `pnpm --filter @renfe/mobile lint` en verde.
- **Pendiente:** probarlo en un build nativo con cámara (aquí no hay Android SDK ni dispositivo). La
  web no pide la cara al pagar; queda fuera del alcance de este ticket. Detalle en
  [[2026-11-03-buffy-ticket-004-facial-antes-de-pagar]].
