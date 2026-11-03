# Ticket 009 — Validar destinos y transbordos realmente posibles

- **Prioridad:** P1
- **Área:** `backend/api`, `backend/gtfs-worker`, `frontend/shared`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

El buscador debería evitar destinos sin conexión desde el origen y transbordos imposibles o demasiado ajustados; ahora permite opciones poco recomendables con el tiempo restante.

## Criterios de aceptación

- Los resultados se basan en viajes y horarios presentes en el feed GTFS cargado; no presentar una combinación como disponible si no existe.
- Para transbordos, comprobar orden temporal, estación de conexión y un margen mínimo acordado con el responsable del producto.
- Si el margen mínimo no está definido por el dominio/contrato, dejarlo como pregunta antes de inventar un valor.
- Mostrar de forma comprensible cuándo una ruta requiere transbordo y cuándo no hay alternativa.
- Añadir pruebas para ruta directa, transbordo viable, conexión imposible y sin ruta; no romper consultas de estaciones válidas.

## Verificación

Usar datos GTFS de prueba deterministas y comprobar la misma decisión en API y cliente.
