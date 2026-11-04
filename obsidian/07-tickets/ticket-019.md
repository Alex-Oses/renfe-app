# Ticket 019 — Hacer responsive la animación del tren

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

La animación del tren no se adapta al tamaño de pantalla y desaparece.

## Criterios de aceptación

- Identificar el contenedor/viewport en el que desaparece y reproducir en móvil y escritorio.
- La animación permanece visible y no desborda al redimensionar u orientar la pantalla.
- Respetar `prefers-reduced-motion` y mantener un estado estático comprensible si se reduce movimiento.
- No sacrificar la legibilidad del contenido ni capturar gestos de navegación.
- Añadir verificación visual en anchos pequeño, medio y grande.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el ancho mínimo de 820 px dejaba el tren casi fuera en móvil; las reglas de poca altura y
reduced-motion lo ocultaban; en la app móvil la maqueta fija de 760 px se recortaba.

**Arreglo:** ancho web relativo (`clamp(360px, 115vw, 1200px)`), escena estática en poca altura y
reduced-motion (sin estela), y ancho móvil calculado con `useWindowDimensions` (500–760 px).

**Comprobación:** lints web/móvil en verde; Chrome/CDP a 390, 768 y 1440 px, reduced-motion,
rotación 390×844→844×390 y resize, sin overflow. Capturas en
[[2026-11-03-buffy-ticket-019-tren-responsive]]. La app móvil no se pudo ver en emulador.
