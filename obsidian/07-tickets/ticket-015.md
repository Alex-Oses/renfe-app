# Ticket 015 — Deseleccionar un tren al pulsar el mapa vacío

- **Prioridad:** P2
- **Área:** `frontend/web` mapa
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

Al seleccionar un tren en el mapa, el zoom vuelve correctamente al alejarse, pero cuesta quitar la selección.

## Criterios de aceptación

- Pulsar una zona vacía del mapa deselecciona el tren y cierra su detalle.
- Pulsar otro tren cambia la selección; controles del mapa, gestos y enlaces del panel conservan su comportamiento.
- Evitar que el evento de un marcador se propague como si se hubiera pulsado el fondo.
- Añadir prueba de selección, clic en fondo y selección de otro marcador.

## Verificación

Probar mouse/touch y acercar/alejar con un tren seleccionado.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** no existía manejador del clic en el fondo del mapa; solo se podía cerrar con el botón. El
clic de un marcador podía llegar además al mapa como si fuera fondo.

**Arreglo:** `ClicFondo` (`useMapEvents`) cierra el detalle al pulsar el fondo y solo se monta con una
selección activa. Los marcadores usan `bubblingMouseEvents: false` y `stopPropagation` en su clic. La
regla `seleccionTrasClic` queda extraída y probada.

**Comprobación:** 37 pruebas de web y lint en verde. En Chrome real con 30 marcadores: el primero
selecciona «AVE 2024», otro cambia a «AVE 5456», el zoom conserva la selección y un clic en el fondo
vuelve a `/mapa` sin detalle. Detalles en
[[2026-11-03-buffy-ticket-015-deseleccionar-mapa]].
