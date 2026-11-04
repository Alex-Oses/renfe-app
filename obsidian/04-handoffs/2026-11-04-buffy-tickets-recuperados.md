---
fecha: 2026-11-04
autor: Buffy (agente de Rubén)
area: frontend | api
para: Alex, Rubén
rama: fix/mobile-tickets-arreglos
pr: 150
tags: [handoff, tickets, recuperacion, web, mobile, api]
estado: resuelto
---

# Handoff — Tickets 001–022 recuperados y adaptados a `develop`

## Qué se hizo

Los arreglos de los tickets se habían quedado fuera de `develop`: al resolver los conflictos de la
#143 se sustituyó el árbol por la versión de `develop` y la PR solo llevó el arreglo del build. Esta
rama recupera el trabajo desde `backup/pre-merge-143` y lo **adapta** al código nuevo de `develop`
(#140–#147), sin revertir nada suyo.

Criterio aplicado: si el fichero lo reescribió `develop` después (pago con cara #144, `desgloseApi`
#141, `comprarDosTramos([ida, sigue], datos)`, mapa #142), se conserva su versión y se reaplica
encima solo el arreglo del ticket.

| Ticket | Estado | Dónde |
|---|---|---|
| 001 reserva pagada | ✅ | `cliente.ts` (`comprarReserva`/`crearReserva`) ya en `develop`, verificado |
| 002 listas anidadas | ✅ | `components/hoja.test.mjs`, ahora incluido en `pnpm test` |
| 003 claves duplicadas | ✅ | `revisor/historial.ts` + `Revisor.tsx` (`lecturaId`) |
| 004 cara antes de pagar | ✅ | se mantiene la implementación de `develop` (#144) |
| 005 APK | fuera | Alex con EAS (#147); no se compila aquí |
| 006/007 chatbot | ✅ | `gemini.provider.ts`, `chatbot.service.ts`, `main.ts` y su spec |
| 008 trenes ya salidos | ✅ | API `reservas.service`; `crearReserva` compartido; `Resultados`, `resultados`, `Reserva`, `pasajero` y los dos transbordos |
| 009 transbordos posibles | ✅ | `trenes/transbordos.ts` (API) + filtro en `buscarTransbordos` |
| 011 tarifa | ✅ | `tarifas.ts` en `Reserva` y `ReservaTransbordo` (web) y `pasajero`/`transbordo` (app); el transbordo ya la envía |
| 012/013/014 líneas | ✅ | `lineas/estado.ts`, `TarjetaLinea.tsx`, `lineas.css` |
| 015 deseleccionar tren | ✅ | `mapa/seleccion.ts`, `CapaTrenes.tsx`, `Mapa.tsx` |
| 016 tarjeta clicable | ✅ | `billetes/enlace.ts`, `MisBilletes.tsx`, `TarjetaBillete.tsx` |
| 017/021 pie e iconos | ✅ | `Pie.tsx` (web y app), `ayuda.ts`, `mas-renfe.ts` |
| 018/019/020/022 | ✅ | ya en `develop` (#140, #141, #144) |

## Qué queda

- Revisión humana: 3 aprobaciones y merge (squash) de la PR #150.
- Prueba manual en navegador y dispositivo de los flujos tocados (aquí solo hay typecheck y pruebas).
- El APK sigue siendo cosa de Alex con EAS.

## Bloqueos / preguntas para otros

- Ninguno de código. La base de datos local no está disponible, así que la reserva real no se ha
  ejecutado: la lógica de salidas se prueba con el cliente de BD simulado.

## Cambios en contratos

- Ninguno nuevo: `POST /reservas` puede responder `400` «Ese tren ya ha salido» (mismo endpoint).
- Los márgenes de transbordo (15 min, 30 al cambiar de estación, 3 h) siguen siendo los de
  [[endpoints]] y ahora se validan también en el cliente.

## Ficheros tocados

- API: `modules/trenes/{transbordos,trenes.service}.ts` + specs, `modules/reservas/reservas.service.ts`,
  `modules/chatbot/{chatbot.service,gemini.provider}.ts` + `gemini.provider.spec.ts`,
  `chatbot/context/*`, `common/correo/correo.service.ts`, `main.ts`.
- Shared: `api/{cliente,salidas,tarifas,transbordos,resultado-compra}.ts` + pruebas,
  `contenido/{ayuda,imagenes,mas-renfe}.ts`, `README.md`.
- Web: `paginas/{Resultados,MisBilletes,Revisor,Mapa}.tsx`, `paginas/lineas/*`,
  `paginas/mapa/{seleccion,CapaTrenes}.ts(x)`, `paginas/billetes/enlace.ts`,
  `paginas/revisor/historial.ts`, `paginas/reserva/{Reserva,ReservaTransbordo}.tsx`,
  `componentes/Pie.tsx`, `README.md`.
- Móvil: `app/{resultados,pasajero,transbordo,comprar-abono}.tsx`, `components/{Pie,TarjetaBillete}.tsx`,
  `components/hoja.test.mjs`, `package.json` (script de test).
