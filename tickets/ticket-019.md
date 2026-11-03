# Ticket 019 — Hacer responsive la animación del tren

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

La animación del tren no se adapta al tamaño de pantalla y desaparece.

## Criterios de aceptación

- Identificar el contenedor/viewport en el que desaparece y reproducir en móvil y escritorio.
- La animación permanece visible y no desborda al redimensionar u orientar la pantalla.
- Respetar `prefers-reduced-motion` y mantener un estado estático comprensible si se reduce movimiento.
- No sacrificar la legibilidad del contenido ni capturar gestos de navegación.
- Añadir verificación visual en anchos pequeño, medio y grande.
