# Ticket 015 — Deseleccionar un tren al pulsar el mapa vacío

- **Prioridad:** P2
- **Área:** `frontend/web` mapa
- **Estado:** Pendiente de reproducción
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
