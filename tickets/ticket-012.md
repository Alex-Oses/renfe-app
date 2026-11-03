# Ticket 012 — Corregir líneas que aparecen sin trenes

- **Prioridad:** P1
- **Área:** `frontend/web`, `backend/api`, `backend/gtfs-worker`
- **Estado:** Pendiente de reproducción
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
