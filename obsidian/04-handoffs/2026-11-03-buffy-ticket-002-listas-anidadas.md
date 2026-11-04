---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-002, mobile, listas, scroll]
estado: abierto
---

# Handoff — Ticket 002: lista virtualizada dentro del ScrollView de la hoja

## Qué se hizo

**Causa.** El aviso `VirtualizedLists should never be nested inside plain ScrollViews` salía al abrir
el selector de estaciones del buscador: `SelectorEstacion` (`components/Selectores.tsx`) pinta un
`FlatList` vertical y `Hoja` (`components/Hoja.tsx`) lo envolvía en un `ScrollView` vertical. Dos
listas desplazables en la misma orientación.

**Comprobado que los demás no lo hacen:** en `(tabs)/directo.tsx` el `FlatList` y el `ScrollView`
viven en ramas excluyentes (`seleccion ? detalle : lista`), y `chatbot.tsx` usa
`Pantalla scroll={false}`. El único anidamiento real era el selector.

**Arreglo (sin quitar la virtualización):**

- `Hoja` acepta `scroll` (por defecto `true`). Con `scroll={false}` no envuelve a los hijos en el
  `ScrollView`: los deja en un `View` con `flexShrink: 1` y `minHeight: 0`, para que la lista mida y
  encoja dentro del `maxHeight` de la hoja.
- `SelectorEstacion` pasa `scroll={false}` y su contenedor también encoge (`flexShrink: 1`). El
  `FlatList` conserva su `maxHeight: 420`, su virtualización y su `keyboardShouldPersistTaps`.
- El resto de hojas (fecha, viajeros, descuento) siguen con el `ScrollView` de siempre.

**Prueba de regresión:** `frontend/mobile/src/components/hoja.test.mjs`, añadida al script `test` del
paquete móvil. Comprueba que la hoja puede ceder el desplazamiento y que `SelectorEstacion` no anida
su `FlatList` en un `ScrollView`. **Es una comprobación estática del contrato entre componentes**, no
un render: el repo no tiene entorno de test de React Native y no se han añadido dependencias.

**Comprobado:** `pnpm --filter @renfe/mobile test` → 15 pruebas en verde;
`pnpm --filter @renfe/mobile lint` (`tsc --noEmit`) sin errores.

## Qué queda

- **Validar en dispositivo o emulador**: abrir el buscador, el selector de estación, buscar con
  muchos resultados y con pocos, y desplazar la lista. Este entorno no tiene SDK de Android ni
  dispositivo conectado, así que no se ha ejecutado la pantalla.
- Si en el ensayo la hoja queda corta con el teclado abierto, ajustar `maximo` o el `maxHeight` del
  `FlatList`; el comportamiento de scroll ya no depende del contenedor.

## Bloqueos / preguntas para otros

- Ninguno técnico.

## Cambios en contratos

- Ninguno.

## Ficheros tocados

- `frontend/mobile/src/components/Hoja.tsx`
- `frontend/mobile/src/components/Selectores.tsx`
- `frontend/mobile/src/components/hoja.test.mjs` (nuevo)
- `frontend/mobile/package.json` (script `test`)
- `tickets/ticket-002.md`
- Vault: este handoff
