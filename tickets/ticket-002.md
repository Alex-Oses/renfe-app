# Ticket 002 — Evitar listas virtualizadas anidadas en móvil

- **Prioridad:** P0
- **Área:** `frontend/mobile`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

Al abrir o usar la búsqueda en móvil aparece el aviso/error de React Native `VirtualizedLists should never be nested inside plain ScrollViews`.

## Criterios de aceptación

- Reproducir el aviso en la pantalla y flujo de búsqueda que lo origina.
- Reestructurar el contenedor para no anidar listas virtualizadas con orientación equivalente.
- Mantener desplazamiento, encabezados, resultados y accesibilidad; no desactivar la virtualización como atajo.
- Añadir una prueba/regresión adecuada y comprobar el flujo en un dispositivo o emulador.
- No deben aparecer avisos de listas anidadas durante la búsqueda.

## Verificación

Probar con muchos resultados y con pocos resultados en Android y, si está disponible, iOS.
