---
fecha: 2026-11-03
autor: Rubén
area: api
para: Alex
rama: feat/api-precios-en-servidor (PR #137) + feat/api-transbordo-y-busquedas (PR #138, apilada)
pr: 137, 138
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
- **`GET /billetes` devuelve `transbordos`** (`[{ desde, hasta }]`, localizadores): la regla que hasta
  ahora solo vivía en `frontend/shared/billetes/agrupar.ts` (`sonTransbordo`) se resuelve ya en el
  servidor, así que el cliente solo ordena y pinta. Misma regla: mismo número de billetes, una
  reserva acaba donde empieza la otra, espera de 15 min a 3 h y menos de 15 min entre emisiones.

- **Comprar un transbordo sigue orquestándose en el cliente**: ya no. Segunda parte en la rama
  `feat/api-transbordo-y-busquedas` (PR #138) — ver abajo.

## Segunda parte (PR #138, rama `feat/api-transbordo-y-busquedas`)

Va **apilada sobre la PR #137**, no sobre `develop`: reutiliza las tarifas y `crearEn`. Al mergear
#137 hay que cambiar su base a `develop`.

- **`POST /reservas/transbordo`** (nuevo, con token): los dos tramos en **una** transacción; si el
  segundo falla, el rollback deja **cero** reservas. Reutiliza `crearEn` dos veces con el mismo
  `pasajeros`/`tarifa`/`descuento`/`extras` y devuelve `{ reservas, total }`. Sustituye a la
  compensación de `comprar-transbordo.ts` (comprar el tramo 1 y cancelarlo si falla el 2).
  La API **no** valida que un tramo empiece donde acaba el otro: hay transbordos con cambio de
  estación y esa regla la sigue resolviendo `GET /billetes`.
- **`GET /reservas?localizador=R-XXXXXX`** (nuevo, con token): `{ localizador, total, billetes }`, solo
  reservas propias. Sustituye al atajo de `comun.tsx:57` que leía `localStorage` (`anden-reservas`).
  Acepta el localizador con o sin `R-`. Sin `id`, `estado` ni `creada`: el estado se lee en los
  billetes y `total` es la suma de sus precios.
- **`GET /estaciones/:id`** (nuevo, público): una estación por id de GTFS. Desbloquea el enlace
  `/trenes?origen=<id>` abierto en pestaña nueva, que hoy sale sin nombre.

**Lo que falta para cerrar la migración:** que el frontend use estos endpoints. Nadie los llama
todavía (web ni móvil). Fuera del alcance de estas dos PRs.

## Qué queda

- **Alex:** que `Reserva.tsx` y `PasoPago.tsx` pidan el importe a `POST /precios/calcular` en vez de
  llamar a `calcularTotal`, y que `cuerpoReserva` de `adaptador-reservas.ts` envíe `tarifa`,
  `descuento`, `extras` y `tipo` (hoy no los manda, así que la API cobra sin ellos). Móvil: hereda.
  Sin eso el bug sigue, solo que ahora hay servidor para arreglarlo.
- **Alex:** que `unirTransbordos` use el `transbordos` de `GET /billetes` en vez de `sonTransbordo`.
- **Alex:** cambiar `comprarDosTramos` (`shared/api/comprar-transbordo.ts`) por `POST /reservas/transbordo`;
  `reservaPorLocalizador` de `comun.tsx:57` por `GET /reservas?localizador=`; y el nombre del origen
  de `/trenes?origen=<id>` por `GET /estaciones/:id`.
- **Fase 3 (aislar el simulado)**: no empezada. Se queda para después de la entrega, como pediste.
- `GET /billetes` con `reservaId`: no hecho (el agrupamiento por `localizador` funciona).

## Bloqueos / preguntas para otros

- Nada bloqueado. La web sigue calculando en cliente y comprando con compensación hasta que se
  cablee lo de arriba.

## Cambios en contratos

[[endpoints]]: `POST /precios/calcular`, `POST /reservas/transbordo`, `GET /reservas?localizador=`
y `GET /estaciones/:id` (nuevos); `POST /reservas` (campos opcionales + `desglose`) y
`GET /billetes` (`transbordos`).

## Ficheros tocados

- `backend/api/src/common/simulado/precios.ts` (+ `precios.spec.ts`), `precio-trayecto.ts`
- `backend/api/src/modules/precios/` (`dto/`, controlador, servicio, módulo)
- `backend/api/src/modules/reservas/` (DTOs, servicio, controlador, spec, módulo) y `app.module.ts`
- `backend/api/src/modules/billetes/` (`transbordos.ts` + spec, servicio, controlador, módulo)
- `backend/api/src/modules/estaciones/` (servicio y controlador: `porId`)
- `obsidian/02-contratos-api/endpoints.md`
