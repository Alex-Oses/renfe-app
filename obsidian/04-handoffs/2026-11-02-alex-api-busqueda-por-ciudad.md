---
fecha: 2026-11-02
autor: Alex
area: backend
para: Rubén, Marina
rama: fix/api-busqueda-por-ciudad-y-transbordos
pr: por abrir
tags: [handoff]
---

# Handoff — búsqueda por ciudad y transbordos con cambio de estación

## El problema que arregla

Buscar «Tarragona → Barcelona» devolvía **0 viajes** si la estación elegida no era la exacta:
`04104` CAMP DE TARRAGONA → `71802` PASSEIG DE GRÀCIA daba 0, y `71500` TARRAGONA → `79009` EL CLOT
también. La API solo cruzaba la misma pareja de estaciones, y los transbordos solo cambiaban en la
misma estación.

## Qué se hizo

- `GET /trenes` amplía origen y destino a **todas las estaciones de su ciudad** (`estaciones.ciudad`).
  Las Cercanías sin ciudad toman la de la estación con ciudad más cercana y entran si están a menos
  de ~3,5 km de la pedida (por eso aparece `cercanias:*`).
- Si origen y destino son de la **misma ciudad** no se amplía: se buscan las pedidas. Sin esto,
  «Sants → Passeig de Gràcia» devolvía 8 276 viajes de toda Barcelona, incluso en sentido contrario.
- Cada tren devuelve su estación **real**; `origen`/`destino` pueden no ser los pedidos.
- Sin duplicados entre feeds: el mismo tren en `avld` y `cercanias` (mismas estaciones, salida y
  llegada) se devuelve una vez, el de `avld`.
- `GET /trenes/transbordos` acepta el cambio en otra estación de la misma ciudad (mín. 30 min) y lo
  marca con `cambioEstacion` + `transbordoSalida`. En la misma estación sigue siendo 15 min.
- Solo se devuelven las mejores opciones: sin duplicados y sin dominadas (otra sale igual o más
  tarde y llega igual o antes).

## La expansión va aparte, y por qué

Primero se resolvía dentro del SQL de búsqueda, con una CTE que se usaba en dos sitios. Postgres no
sabía estimar la CTE y **escaneaba los 2,2 M de `horarios`** en cada búsqueda: 5 s por petición.
Ahora `SQL_SERVICIO` devuelve los dos arrays de estaciones en una consulta de ~1 ms, se cachea en
memoria en el servicio y la búsqueda usa `= any($1::text[])`.

Medido contra la base local completa (AV/LD + Cercanías), caliente: **30–90 ms** por búsqueda.

## Qué queda

- **Transbordos lentos**: cuando no hay directos, la consulta tarda 3–6 s (cruza todos los viajes que
  llegan a la ciudad de destino). La web solo la llama si `GET /trenes` no devuelve nada. Se puede
  optimizar después de la entrega o limitar por corredor geográfico.
- La app y la web **no muestran** todavía `cambioEstacion`/`transbordoSalida` en la tarjeta: el campo
  ya está en `OpcionTransbordo` (`@renfe/shared/api/tipos`), falta pintar el aviso.
- La expansión por cercanía mete estaciones de la periferia (p. ej. Altafulla en TARRAGONA, que los
  datos dan como misma ciudad). Si molesta, hay que limpiar `estaciones.ciudad` en el catálogo.

## Comprobado

- `@renfe/api`: 146 tests en verde, lint en verde.
- Contra la base local, 2026-11-03: `04104→71802`, `71500→79009`, `04104→79400` devuelven 42 trenes
  (216 en total); `71801→71802` (misma ciudad) devuelve solo Sants → Passeig; estación inexistente, 404.
- Transbordos con `cambioEstacion: true` verificados en la respuesta.

## No comprobado

- En el Supabase Cloud: la expansión depende de `estaciones.ciudad`, y allí el catálogo es el de AV/LD
  (sin Cercanías). Debería funcionar igual, pero no se ha medido.
- No se ha probado la compra de punta a punta de un transbordo con cambio de estación.

## Ficheros tocados

- `backend/api/src/modules/trenes/trenes.service.ts`, `trenes.service.spec.ts`
- `obsidian/02-contratos-api/endpoints.md` (ampliación por ciudad, misma ciudad, cambio de estación)
