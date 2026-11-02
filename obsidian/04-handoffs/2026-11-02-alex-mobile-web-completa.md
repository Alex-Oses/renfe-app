---
fecha: 2026-11-02
autor: Alex
area: frontend
para: equipo
rama: feat/mobile-web-completa
pr: por abrir
tags: [handoff]
---

# Handoff — la app móvil al nivel de la web

## Qué se hizo

Cuatro partes, cada una con su handoff y sus capturas:

- **Contenido informativo** ([[2026-11-02-alex-mobile-contenido]]): `/contenido/[...ruta]` pinta
  cualquiera de las 813 páginas desde `@renfe/shared/contenido`, con índice `/informacion` y acceso
  desde Inicio. Tablas como fichas por fila, FAQ desplegable, enlaces a la pantalla que toca o al
  navegador.
- **Buscador y transbordos** ([[2026-11-02-alex-mobile-buscador-transbordos]]): buscador por pasos
  (el destino se habilita al elegir origen y su hoja se abre sola), opciones con transbordo en
  resultados y pantalla `/transbordo` que compra los dos tramos (si falla el segundo, cancela el
  primero).
- **Billetes y abonos** ([[2026-11-02-alex-mobile-billetes-abonos]]): los dos tramos de un transbordo
  salen en una tarjeta con la espera y ambos localizadores, «Mis abonos» con una tarjeta por tipo y
  retraso en vivo cada 30 s.
- **Cuenta y mapa** ([[2026-11-02-alex-mobile-cuenta-mapa]]): puntos, estado del acceso facial, mapa
  con recorrido completo, paradas pasadas recalculadas con el reloj y retraso como en la web.

Además, en esta rama:

- **Sesión caducada** (`fix(mobile)` de `frontend/shared/api/cliente.ts`): cuando la API responde 401
  o la web/app cambia de API (Docker ↔ Render), se cierra la sesión y se pide volver a entrar. Era la
  causa de «token inválido o caducado» **al pagar** y de «mis billetes no se guardan»: la compra sí
  se guardaba, pero se leía con un token que ya no valía. Con tests.
- **Buscador con estaciones reales** (`fix(mobile)`): en resultados, el origen salía vacío para
  estaciones que no están en la lista simulada. Ahora el enlace lleva el nombre.
- `OpcionTransbordo` (`@renfe/shared/api/tipos`) incluye `cambioEstacion` y `transbordoSalida`.

## Qué queda

- **Probar en un móvil real** (Expo Go) todas las pantallas nuevas. Todo lo verificado es el export
  web a 390×844 con y sin datos simulados.
- El facial no se puede probar en Expo Go (no ejecuta ONNX): hace falta otro build.
- La tarjeta de transbordo **no avisa** de que hay que cambiar de estación (`cambioEstacion`).
- El selector «Tarjetas y descuentos» de la web no está en la app (lo lee `Buscador.tsx`).
- «Avísame al llegar» (seguimientos) y la pantalla de admin no están en la app.
- La compra de transbordo usa tarifa básica, sin descuentos ni extras, igual que la web.

## Comprobado

- `corepack pnpm -r lint` en verde (api, gtfs-worker, shared, mobile, web).
- `corepack pnpm -r test`: 325 tests en verde (31 worker, 125 shared, 142 api, 27 web; mobile delega
  en shared).
- `expo export -p web` compila; pantallas nuevas revisadas con Playwright y Chrome (390×844).
- Contra la API real: información, contenido, resultados Tarragona → Barcelona con trenes y precios,
  billetes, directo y cuenta.

## No comprobado

- Expo Go / iOS / Android reales.
- La compra de un transbordo con la API real (la cancelación del primer tramo solo está cubierta por
  test unitario).
- El login facial de punta a punta.

## Ficheros tocados

- `frontend/mobile/src/app/**` (contenido, informacion, transbordo, resultados, billetes, cuenta,
  directo, index, _layout)
- `frontend/mobile/src/components/{Buscador,TarjetaBillete,TarjetaAbono,RetrasoVivo}.tsx`
- `frontend/mobile/src/{billetes,sesion}.ts`
- `frontend/shared/api/{cliente,tipos}.ts`, `frontend/shared/billetes/`, `frontend/shared/estado/`,
  `frontend/shared/api/comprar-transbordo.ts`
- `frontend/web/src/{estado/sesion.tsx,estado/vigilante.tsx,paginas/Cuenta.tsx,paginas/MisBilletes.tsx,paginas/Mapa.tsx,paginas/mapa/CapasRuta.tsx}`
