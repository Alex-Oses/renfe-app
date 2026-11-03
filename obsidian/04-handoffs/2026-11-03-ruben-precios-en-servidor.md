---
fecha: 2026-11-03
autor: Rubén
area: api
para: Alex
rama: feat/api-precios-en-servidor
pr:
tags: [handoff, precios, api, migracion]
---

# Handoff — Los precios de la reserva se calculan en el servidor

## Qué se hizo

Primera parte de [[plan-migracion-logica-frontend]] (la de negocio, Fases 0 y 1): el importe de un
billete ya no lo decide el frontend.

- **`POST /precios/calcular`** (nuevo, público): devuelve `precioAsiento` y el `desglose`
  (`billetes`, `extras`, `total`) de una selección, con tarifa, descuento, extras y tipo de viajero.
  Contrato en [[endpoints]].
- **`POST /reservas`** acepta `tarifa`, `descuento`, `extras[]` y `pasajeros[].tipo`, aplica las
  tablas **en el servidor** y devuelve `desglose`. Sin esos campos se comporta igual que antes.
  Arregla el bug de que la web enseñaba un importe y la API cobraba otro.
- Tablas de tarifas, descuentos y extras portadas a `backend/api/src/common/simulado/precios.ts`
  (espejo de `frontend/shared/api/simulado-precios.ts`) con sus tests.
- `common/simulado/precio-trayecto.ts`: el precio base de la butaca de un trayecto, con la misma
  clave determinista que usa la reserva, para que previsualización y cobro coincidan.

## Qué queda

- **Alex:** que `Reserva.tsx` y `PasoPago.tsx` pidan el importe a `POST /precios/calcular` en vez de
  llamar a `calcularTotal`, y que `cuerpoReserva` de `adaptador-reservas.ts` envíe `tarifa`,
  `descuento`, `extras` y `tipo` (hoy no los manda, así que la API cobra sin ellos). Móvil: hereda.
  Sin eso el bug sigue, solo que ahora hay servidor para arreglarlo.
- **Fase 2 (transbordos en la API)** y **Fase 3 (aislar el simulado)**: no empezadas. La 3 se queda
  para después de la entrega, como pediste.
- `GET /billetes` con `reservaId`: no hecho (el agrupamiento por `localizador` funciona).

## Bloqueos / preguntas para otros

- Nada bloqueado. La web sigue calculando en cliente hasta que se cablee lo de arriba.

## Cambios en contratos

[[endpoints]]: `POST /precios/calcular` (nuevo) y `POST /reservas` (campos opcionales + `desglose`).

## Ficheros tocados

- `backend/api/src/common/simulado/precios.ts` (+ `precios.spec.ts`), `precio-trayecto.ts`
- `backend/api/src/modules/precios/` (`dto/`, controlador, servicio, módulo)
- `backend/api/src/modules/reservas/` (DTO, servicio, spec) y `app.module.ts`
- `obsidian/02-contratos-api/endpoints.md`
