# Ticket 018 — Mostrar imágenes en Experiencias

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`, contenido compartido
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

La sección “Experiencias” aparece sin imágenes.

## Criterios de aceptación

- Determinar si faltan recursos, rutas, carga remota o estilos; no sustituir el diagnóstico con imágenes inventadas.
- Mostrar imágenes del catálogo aprobado con rutas correctas, dimensiones adecuadas y texto alternativo.
- Si un recurso no está disponible, mostrar un fallback visual coherente sin icono roto.
- Respetar licencias/origen de los recursos y no añadir imágenes con derechos desconocidos.
- Añadir prueba de render/carga o fallback.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** las páginas y tarjetas de Experiencias no tienen `imagen`/`autor`; `fotoDeRuta` solo
reconocía ciudades y rutas, y ningún slug de Experiencias coincidía, así que `Foto` recibía
`undefined` y mostraba el relleno.

**Arreglo:** `fotosExperiencias` usa solo archivos existentes del catálogo de Commons. Se elige por
ciudad presente en el slug, luego por categoría y, como respaldo, Madrid; nunca se inventa un recurso.
Se mantienen `srcset`, alt, crédito y fallback de `Foto`.

**Comprobación:** 168 pruebas shared y lints en verde. En Chrome, 31/31 tarjetas con imagen; al
disparar `error` en la primera aparece el relleno `.foto--relleno`. Detalles en
[[2026-11-03-buffy-ticket-018-imagenes-experiencias]].
