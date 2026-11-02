---
fecha: 2026-11-02
autor: Alex
area: frontend
para: todos
rama: fix/mobile-estaciones-recordadas
pr: 124
tags: [handoff, web, buscador, sessionStorage]
---

# Handoff — «Desde» vacío al recargar `/trenes`

## Qué se hizo

Cierra el fallo que quedó anotado en [[2026-11-02-alex-auditoria-desbordes]]: al
recargar `/trenes` los campos «Desde» y «Hasta» del buscador salían vacíos.

La causa era `frontend/shared/api/estaciones-memoria.ts`: la lista de estaciones
vistas vivía en un `Map` del módulo. Los resultados se pintan bien porque van por
id, pero al buscar por nombre (`nombreDe()`) el `Map` ya se había vaciado con el
F5 y el buscador no sabía cómo se llamaba el id de la URL.

Ahora la memoria se guarda en `sessionStorage` con la clave `renfe.estaciones`:

- Máximo 200 estaciones (~1 150 en el catálogo): sobra para una sesión y no llena
  el almacenamiento.
- Si el almacenamiento está bloqueado o el JSON está roto, se empieza vacío y la
  memoria en RAM sigue funcionando (Safari en navegación privada lanza al tocarlo).
- La app no tiene `sessionStorage`, así que allí `almacen()` devuelve `undefined`
  y todo sigue igual que antes.
- Se carga de forma perezosa (`cargar()` una sola vez): no toca el almacenamiento
  hasta que alguien pregunta por una estación.

Medido con Playwright y Chrome real a 390x844, buscando Tarragona → Barcelona
desde la portada y recargando:

| momento | «Desde» | «Hasta» |
|---|---|---|
| antes del cambio, tras F5 | *(vacío)* | `Barcelona-Sants` |
| ahora, antes de recargar | `CAMP DE TARRAGONA` | `Barcelona Arc de Triomf` |
| ahora, tras F5 | `CAMP DE TARRAGONA` | `Barcelona Arc de Triomf` |

`@renfe/shared` 127 tests (2 nuevos) y `@renfe/web` 27 tests en verde; `lint` (tsc)
limpio en los dos paquetes.

## Qué queda

- **Enlace directo sin memoria.** Abrir `/trenes?origen=<id>` en una pestaña nueva
  (o en otro navegador) sigue dejando «Desde» vacío: `sessionStorage` está vacío y
  `GET /estaciones?q=` busca por **nombre**, no por id. Se arregla con un
  `GET /estaciones/:id` (contrato + imagen Docker nueva para el Funnel) o metiendo
  `origen`/`destino` con nombre en la URL. No entra aquí para no tocar la API dos
  días antes de la congelación; para la demo, buscar desde la portada sí funciona.
- **La web de Vercel sigue en `main`.** Este PR va a `develop`; para que se vea en
  `renfe-app-beta.vercel.app` tiene que entrar en el release (#122) y alguien tiene
  que darle a *Promote to Production*.
- Nada probado en móvil real ([[2026-11-02-alex-mobile-web-completa]]).

## Bloqueos / preguntas para otros

- Rubén: sigue abierto lo del precio mostrado ≠ precio cobrado
  ([[plan-migracion-logica-frontend]]). Contrato primero.
- Si alguien quiere enlaces compartibles a resultados, hace falta el
  `GET /estaciones/:id` de arriba: es una línea de SQL en `estaciones.service.ts`
  (`or e.id = $1`) más el endpoint.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `frontend/shared/api/estaciones-memoria.ts`: persistencia en `sessionStorage`,
  carga perezosa y guardas para la app y para almacenamiento bloqueado.
- `frontend/shared/api/estaciones-memoria.test.ts`: dos tests nuevos (módulo nuevo
  con el mismo almacenamiento = caso F5, y almacenamiento que lanza).
