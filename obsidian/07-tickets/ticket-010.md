# Ticket 010 — Mantener el precio entre preview y selección de asiento

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`, `backend/api`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

El precio mostrado en la vista previa y el mostrado al seleccionar asiento son distintos.

## Criterios de aceptación

- Reproducir con el mismo trayecto, pasajeros, tarifa, descuentos y extras; registrar ambos cálculos.
- Usar el cálculo de precios existente en servidor como fuente de verdad donde aplique, y evitar fórmulas divergentes en cada pantalla.
- Mantener el importe y desglose consistentes al navegar; recalcular solo cuando cambie una entrada relevante.
- Si el precio cambia por datos válidos, mostrar el nuevo desglose y solicitar confirmación antes de continuar.
- Añadir pruebas de consistencia para trayecto simple y transbordo con descuento.

## Verificación

Comparar preview, selección de asiento y resumen final con las mismas entradas y total del endpoint.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el mapa de asientos de la web enseñaba el precio **base** del asiento, no el ajustado por
la tarifa/descuento que sí aplicaba el resumen. El transbordo enseñaba `opcion.precio * n` (suma base)
y la compra **no enviaba** la tarifa/descuento: la app recibía `descuento` y lo ignoraba, la web no lo
leía, y el servidor cobraba básico. La vista previa de las tarjetas tampoco aplicaba el descuento.

**Arreglo:**

- `precioOpcion` en shared suma un billete por tramo y viajero con `precioViajero`, igual que la API.
- `PasoAsientos` recibe tarifa/descuento y muestra el precio por adulto ya ajustado («desde»).
- Web y app de transbordo leen tarifa/descuento/ninos, muestran `precioOpcion` y los envían al
  comprar; antes el descuento se perdía.
- Las tarjetas de resultados aplican el descuento a la vista previa.
- Pruebas de `precioOpcion` con tarifa y con descuento + niño (transbordo con descuento). Total: 161
  shared; typecheck de shared, web y mobile en verde.

**Pendiente:** sin navegador/dispositivo solo se ha comprobado con typecheck y pruebas de las
fórmulas; la API ya era la fuente de verdad. Detalles en
[[2026-11-03-buffy-ticket-010-precio-coherente]].
