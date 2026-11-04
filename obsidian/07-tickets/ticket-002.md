# Ticket 002 — Evitar listas virtualizadas anidadas en móvil

- **Prioridad:** P0
- **Área:** `frontend/mobile`
- **Estado:** Arreglado; pendiente de validar en un dispositivo o emulador
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

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

- **Causa:** `SelectorEstacion` (`components/Selectores.tsx`) pinta un `FlatList` vertical dentro de
  `Hoja` (`components/Hoja.tsx`), que lo envolvía en un `ScrollView` vertical. Es el selector que se
  abre desde el buscador de la portada y de `/lineas`. En `(tabs)/directo.tsx` el `FlatList` y el
  `ScrollView` están en ramas excluyentes y en `chatbot.tsx` la pantalla no hace scroll, así que no
  había más anidamientos reales.
- **Arreglo:** `Hoja` acepta `scroll` (por defecto `true`); con `scroll={false}` deja de envolver a
  los hijos en el `ScrollView` y los pone en un `View` que encoge (`flexShrink: 1`, `minHeight: 0`).
  `SelectorEstacion` pasa `scroll={false}` y su contenedor también encoge, así que el `FlatList`
  conserva su virtualización, su `maxHeight` y su scroll propio.
- **Prueba de regresión:** `src/components/hoja.test.mjs` (añadida al script `test` del paquete
  móvil) comprueba que la hoja puede ceder el desplazamiento y que el selector no anida el
  `FlatList` en un `ScrollView`. Es una comprobación estática: no hay entorno de render de React
  Native en el repo.
- **Comprobado:** `pnpm --filter @renfe/mobile test` (15 pruebas) y `pnpm --filter @renfe/mobile lint`
  en verde.
- **Pendiente:** la prueba manual en Android/iOS con muchos y pocos resultados sigue sin hacerse en
  este entorno (sin SDK ni dispositivo). Detalle en [[2026-11-03-buffy-ticket-002-listas-anidadas]].
