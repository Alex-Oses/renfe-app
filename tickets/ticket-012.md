# Ticket 012 — Corregir líneas que aparecen sin trenes

- **Prioridad:** P1
- **Área:** `frontend/web`, `backend/api`, `backend/gtfs-worker`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

En `/lineas`, una línea muestra “no hay trenes” aunque el usuario informa de que sí existen.

## Criterios de aceptación

- Reproducir con la línea concreta, fecha y fuente de datos; identificar si falla la consulta, filtro, zona horaria o estado vacío.
- Los trenes mostrados pertenecen a la línea y al periodo seleccionado; el mensaje vacío aparece solo cuando la consulta confirmada no devuelve resultados.
- Los errores de API/feed no se presentan como una lista vacía normal: mostrar estado de error y opción de reintentar.
- Añadir pruebas para línea con trenes, línea sin viajes y fallo de carga.

## Verificación

Comprobar la vista con datos GTFS deterministas y contra el entorno de desarrollo disponible.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**No se pudo reproducir la línea concreta** (sin `.env` ni BD/GTFS local), pero había dos causas que
producen el síntoma:

1. La tarjeta consultaba con la fecha **local del dispositivo** (`hoyISO`), no con la fecha de servicio
de Madrid. Con el reloj en otra zona (Canarias, viaje, reloj mal puesto), cerca de medianoche se pide el
día anterior; sus trenes ya salieron y aparece «No quedan trenes hoy».
2. Cualquier rechazo de `buscarTrenes` se convertía en `[]`: un fallo de API/feed se pintaba como una
línea sin trenes, sin reintento.

**Arreglo:**

- La consulta usa `hoyEnMadrid()` (`Europe/Madrid`).
- Error separado del vacío, con `role="alert"` y botón **Reintentar** que relanza la petición.
- `estadoDeLinea`/`proximosTrenes` extraídos a `paginas/lineas/estado.ts`, con 5 pruebas: línea con
trenes, sin viajes futuros, fallo de carga y comparación de un ISO en UTC.
- Revisado el backend: el controlador y el DTO exigen `AAAA-MM-DD` y el SQL aplica calendarios y
excepciones con esa fecha; no se ha encontrado defecto allí.

**Comprobación:** 5 pruebas de web en verde y `pnpm --filter @renfe/web lint` en verde. Falta validar
con la línea, fecha y feed reales cuando haya entorno con datos. Detalles en
[[2026-11-03-buffy-ticket-012-lineas-sin-trenes]].
