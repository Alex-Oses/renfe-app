---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: todos
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-003, web, revisor, react]
estado: abierto
---

# Handoff — Ticket 003: claves React duplicadas en el historial del revisor

## Qué se hizo

**Causa.** En el **Modo revisor de la web** (`frontend/web/src/paginas/Revisor.tsx`), la lista
«Últimas lecturas» usaba `key={h.validadoEn}`. Ese campo **no es único**: la API lo genera con
`instanteAIso()` (`backend/api/src/common/gtfs/tiempo.ts`), que formatea **hasta los segundos, sin
milisegundos**. Dos lecturas en el mismo segundo —pulsar «Comprobar» dos veces o escanear dos
códigos seguidos— producen el mismo `validadoEn` y React avisa de dos hijos con la misma clave.

**Arreglo.** Cada lectura del historial lleva ahora su propio identificador estable:

- `frontend/web/src/paginas/revisor/historial.ts` (nuevo): tipo `Lectura = ResultadoValidacion &
  { lecturaId: number }` y `anadirLectura()`, que antepone la lectura con su id y recorta a las 20
  últimas (antes el `slice(0, 20)` estaba en el componente).
- `Revisor.tsx` guarda un contador (`useRef`) y usa `key={h.lecturaId}`. No se oculta ninguna
  lectura: dos validaciones del mismo segundo siguen apareciendo, cada una con su clave.
- No se usa el índice del array como clave.

**Barrido del resto de listas.** Revisé las claves del resto de pantallas web y móvil (inicio,
contenido, resultados, transbordos, billetes, mapa, tarifas, extras, navegación, chatbot). Las que
se apoyan en datos comprobables son únicas: estaciones (ids), trenes (`feed:tripId:fecha`),
asientos (`coche-etiqueta`), reservas/localizadores, FAQ y pasos de contenido, columnas de tablas,
rutas de página y menús. Los transbordos se deduplican en la API y `agrupar()`/`unirTransbordos()`
producen un viaje por reserva. No encontré otra colisión reproducible.

**Comprobado:** `pnpm --filter @renfe/web test -- src/paginas/revisor/historial.test.ts` (2 pruebas
nuevas en verde) y `pnpm --filter @renfe/web lint` (`tsc --noEmit`) sin errores.

## Qué queda

- **Reproducir en el navegador** con la API real: entrar como revisor y validar dos códigos en el
  mismo segundo; el aviso de claves duplicadas ya no debe salir. En este entorno no hay API ni
  navegador automatizado, así que la comprobación es la prueba unitaria.
- El historial es solo de la web; el revisor móvil no guarda historial y no necesita el cambio.

## Bloqueos / preguntas para otros

- Ninguno técnico. Si se quiere conservar la hora con milisegundos en la API, sería otro ticket:
  aquí la clave correcta es la lectura, no el instante.

## Cambios en contratos

- Ninguno.

## Ficheros tocados

- `frontend/web/src/paginas/revisor/historial.ts` (nuevo)
- `frontend/web/src/paginas/revisor/historial.test.ts` (nuevo)
- `frontend/web/src/paginas/Revisor.tsx`
- `tickets/ticket-003.md`
- Vault: este handoff
