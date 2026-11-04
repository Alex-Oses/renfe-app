# Ticket 009 — Validar destinos y transbordos realmente posibles

- **Prioridad:** P1
- **Área:** `backend/api`, `backend/gtfs-worker`, `frontend/shared`
- **Estado:** Arreglado
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

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:**

- La URL lleva `claveTramo` (`tipo|número|salida`) pero web y app buscaban la opción por `tramos[].id`,
  así que un transbordo viable no se podía abrir.
- El margen mínimo solo estaba en el SQL (15 min misma estación, 30 al cambiar, 3 h máximo) y no se
  comprobaba después ni había prueba de conexión imposible; la espera se calculaba por hora del día.

El margen está definido en `endpoints.md` (15/30 min, 3 h), así que no se ha inventado.

**Arreglo:**

- `esperaSuficiente` en la API y `transbordoViable` en shared, con los mismos márgenes, comparando
  instantes ISO; la API filtra las opciones y `buscarTransbordos` también.
- `esperaMin`/`duracionMin` se calculan con los ISO (cambio de medianoche incluido).
- `ReservaTransbordo` y `transbordo` usan `buscarOpcion` con la clave, no el `id`.
- Pruebas de 15/14, 30/29, 3 h, cambio de día, opción viable/imposible, servicio que descarta 10 min y
  conserva 15, y `buscarOpcion` con `id` distinto. Total: 27 API + 159 shared; lint y build en verde.

**Pendiente:** sin BD GTFS no se han ejecutado las consultas reales; los umbrales son los del
contrato y se cambian en las dos constantes documentadas. Detalles en
[[2026-11-03-buffy-ticket-009-transbordos-viables]].
