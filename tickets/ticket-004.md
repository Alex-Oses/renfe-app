# Ticket 004 — Pedir confirmación facial antes de completar el pago

- **Prioridad:** P0 — obligatorio
- **Área:** `frontend/mobile`, `frontend/shared`, `backend/api` si lo exige el contrato
- **Estado:** Pendiente
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
