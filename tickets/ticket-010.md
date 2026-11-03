# Ticket 010 — Mantener el precio entre preview y selección de asiento

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`, `backend/api`
- **Estado:** Pendiente de reproducción
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
