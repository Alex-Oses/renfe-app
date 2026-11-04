---
fecha: 2026-11-03
autor: Buffy (agente)
area: backend
para: ruben
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-007, chatbot, gtfs, rutas]
estado: resuelto
---

# Handoff — Ticket 007: rutas del chatbot (Tarragona–Madrid)

## Por qué falla

La búsqueda por ciudad del 2026-11-02 amplía origen y destino a **todas las estaciones de la misma
`estaciones.ciudad`**. Para rellenar las que no traen ciudad usaba la estación con ciudad **más
cercana sin límite de distancia**. Los AV/LD se importan con `ciudad: null` (`gtfs/avld.ts`), así que
una estación como Camp de Tarragona podía heredar la ciudad de otra zona (Barcelona) y la expansión
devolvía trenes Barcelona–Madrid aunque se hubiera pedido Tarragona–Madrid.

Además había tres problemas que hacían que la respuesta y las tarjetas no cuadraran:

- El resultado de `buscar_trenes` no decía **qué** se había consultado: el modelo no podía comprobar
  que las tarjetas eran de la ruta pedida.
- Las tarjetas se **acumulaban** entre reintentos del modelo: si reintentaba con otra estación o
  ciudad, se pintaban trenes de varias rutas.
- Solo existía búsqueda de directos. Sin directos el modelo no tenía transbordos ni una marca de
  «sin servicio», y podía improvisar.

## Qué se cambió

- `trenes.service.ts` (`SQL_SERVICIO`): la ciudad inferida solo se toma de una estación a **menos de
  ~5,5 km** (0.05° lat / 0.06° lon). Una estación sin ciudad ya no hereda la de otra región.
- `chatbot.service.ts`:
  - `buscar_trenes` devuelve `{ ruta, consulta, datos, total, transbordos?, totalTransbordos? }`.
    `ruta` es `directa`, `con_transbordo` o `sin_servicio`; `consulta` repite origen/destino/fecha/limit.
  - Si no hay directos, consulta `transbordos` **con la misma consulta** (sin cambiar de ciudad).
  - Las tarjetas se vacían antes de guardar las de cada `buscar_trenes`: solo quedan las del último
    trayecto consultado.
- `ENDPOINTS.md` y `RENFE_CONTEXT.md`: reglas explícitas de no sustituir origen/destino, decir
  `sin_servicio` si no hay ruta y describir los dos tramos si hay transbordo.
- `endpoints.md` (contrato): anotado el tope de ~5,5 km de la ciudad inferida.
- `chatbot.service.spec.ts`: pruebas de ruta directa, con transbordo, sin servicio y de que solo
  quedan las tarjetas de la última búsqueda.

## Cómo se comprobó

- `pnpm --filter @renfe/api test -- src/modules/chatbot/chatbot.service.spec.ts` → **16 pruebas**.
  Con el spec de trenes: **36 pruebas** en verde.
- `pnpm --filter @renfe/api lint` → 0 errores. `pnpm --filter @renfe/api build` → OK.

## Pendiente / bloqueos

- **No se pudo reproducir contra datos reales**: no hay `.env`, Supabase local responde
  `ECONNREFUSED` en 54322 y el daemon de Docker no está levantado. La consulta SQL no se ha ejecutado.
- Para cerrarlo con datos: levantar la BD (`pnpm db:start` + importar GTFS) y probar
  `04104/71500 → 60000` en `/trenes`; las tarjetas deben traer origen de Tarragona o Camp de
  Tarragona, nunca Barcelona. Repetir con Galicia–Madrid y con un par sin servicio (debe salir
  `ruta: sin_servicio`).
- La calidad de la redacción sigue dependiendo del modelo; las reglas del prompt evitan que cambie
  la ruta, pero no se ha probado con una clave real de Gemini.

## Cambios en contratos

- El resultado de la herramienta `buscar_trenes` (interno del chatbot) gana `ruta`, `consulta` y
  `transbordos`. `GET /trenes` no cambia; solo cambia el cálculo de la expansión por ciudad.

## Ficheros tocados

- `backend/api/src/modules/trenes/trenes.service.ts`
- `backend/api/src/modules/chatbot/chatbot.service.ts`
- `backend/api/src/modules/chatbot/chatbot.service.spec.ts`
- `backend/api/src/modules/chatbot/context/{ENDPOINTS,RENFE_CONTEXT}.md`
- `obsidian/02-contratos-api/endpoints.md`
- `tickets/ticket-007.md`
