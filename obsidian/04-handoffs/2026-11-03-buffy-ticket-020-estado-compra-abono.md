---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-020, abonos, compra, accesibilidad, estados]
estado: resuelto
---

# Handoff — Ticket 020: éxito al comprar un abono

## Qué encontré

- En la web simulada **no se reprodujo el rojo**: el texto de la confirmación salía en
  `rgb(70, 70, 70)` y el título en morado. El problema real del flujo era que el resultado se
  repartía en tres banderas independientes (`cargando`, `error`, `comprado`) y la confirmación no
  tenía un estilo semántico de éxito propio; el único mensaje con color era el de error. Eso deja
  abierta la puerta a que una superficie reuse el estado de error para un resultado correcto.
- En móvil el éxito ya pasaba `tipo="ok"`, pero el flujo seguía usando banderas sueltas y `Aviso` no
  anunciaba los cambios a tecnología asistiva.

## Qué se cambió

- `shared/api/resultado-compra.ts`: unión explícita `inicial | enviando | exito | error`, funciones
  de transición (`compraConfirmada`, `compraFallida`…) y `tonoCompra`, que decide el tono **solo por
  el estado**, nunca por el texto.
- Web: el formulario guarda ese resultado. El éxito solo se crea con el `Abono` que devuelve la
  promesa; se pinta una tarjeta verde con «✓ Pago confirmado», `role="status"` y
  `aria-live="polite"`. El error conserva `role="alert"` y `aria-live="assertive"`; mientras se
  envía, aparece «Procesando el pago…» con `role="status"`.
- Móvil: mismo estado compartido; el éxito usa `tonoCompra(resultado)` (verde), el fallo rojo y
  `Aviso` anuncia con `accessibilityLiveRegion` (`assertive` solo para error).
- CSS: éxito con fondo `#f1fbf4`, borde `#b9e3c9` y texto `#14532d` (contraste alto); error con el
  frambuesa existente.

## Cómo se comprobó

- `pnpm --filter @renfe/shared test` → **172 pruebas** (4 nuevas: éxito, texto que parece error pero
  estado confirmado, fallo sin abono e inicial/enviando).
- `pnpm --filter @renfe/shared lint`, `@renfe/web lint`, `@renfe/mobile lint` y
  `pnpm --filter @renfe/web test` → **39 pruebas** web, todo en verde.
- Chrome/CDP con sesión simulada:
  - éxito: fondo `rgb(241, 251, 244)`, borde `rgb(185, 227, 201)`, título `rgb(20, 83, 45)`,
    rol `status`, `aria-live="polite"`;
  - error: `rgb(214, 45, 97)`, rol `alert`, `aria-live="assertive"` y **sin** tarjeta de éxito;
  - en curso: «Procesando el pago…», rol `status`, `aria-live="polite"` y formulario
    `aria-busy="true"`, sin éxito hasta que termina.
- Captura: [[ticket-020-exito.png]].

## Pendiente / límites

- No pude reproducir el rojo original con la API real (no hay API/`.env` levantados); la corrección
  elimina la ambigüedad de estados y garantiza que el éxito no use el estilo de error.
- La app móvil no se ha visto en emulador/dispositivo: el cambio está validado con `tsc` y con la
  lógica compartida probada.

## Ficheros tocados

- `frontend/shared/api/resultado-compra.ts`
- `frontend/shared/api/resultado-compra.test.ts`
- `frontend/web/src/paginas/abonos/Abonos.tsx`
- `frontend/web/src/paginas/abonos/abonos.css`
- `frontend/mobile/src/app/comprar-abono.tsx`
- `frontend/mobile/src/components/Aviso.tsx`
- `tickets/ticket-020.md`
