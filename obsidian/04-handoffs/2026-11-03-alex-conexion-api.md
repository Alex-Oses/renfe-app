---
fecha: 2026-11-03
autor: Alex
area: frontend
para: todos
rama: feat/mobile-conexion-api-precios
pr: por abrir
tags: [handoff, frontend, api, reservas, precios]
---

# Handoff — Conexión del frontend con precios y reservas de la API

## Qué se hizo

- `@renfe/shared` envía tarifa, descuento, extras y tipo de pasajero en `POST /reservas`.
- Web y móvil consultan `POST /precios/calcular`; la web usa su desglose para mostrar el importe que se cobra.
- La compra de transbordos usa `POST /reservas/transbordo` en una única transacción.
- `GET /billetes` usa la relación `transbordos` del servidor; `GET /reservas?localizador=` sustituye el atajo de la web.
- Los enlaces directos a `/trenes?origen=<id>` resuelven el nombre con `GET /estaciones/:id`.
- Sin URL de API se conserva el modo simulado, incluido el cálculo local de demostración.

## Qué queda

- Abrir la PR contra `develop` cuando las PR #137 y #138 estén disponibles en la base integrada.
- Repetir manualmente la compra, consulta y cancelación contra la API con las rutas nuevas.
- Probar el transbordo real y comprobar que el segundo fallo no deja reservas.

## Bloqueos / preguntas para otros

- La API desplegada responde `/health`, pero todavía devuelve 404 en `/estaciones/:id`; las rutas nuevas dependen de las PR #137 y #138, aún abiertas y sin mergear.
- La carpeta local `.obsidian/` queda sin seguimiento y fuera del commit por no pertenecer a esta tarea.

## Cambios en contratos

Ninguno en el vault: se consumen los shapes de las PR abiertas de backend.

## Ficheros tocados

- `frontend/shared/api/cliente.ts`
- `frontend/shared/api/adaptador-reservas.ts`
- `frontend/shared/api/tipos.ts`
- `frontend/shared/api/comprar-transbordo.ts`
- `frontend/shared/api/simulado-reservas.ts`
- `frontend/shared/billetes/agrupar.ts`
- `frontend/web/src/componentes/Buscador.tsx`
- `frontend/web/src/componentes/herramientas/comun.tsx`
- `frontend/web/src/paginas/reserva/`
- `frontend/mobile/src/app/pasajero.tsx`
- `frontend/mobile/src/app/transbordo.tsx`

## Validación

- `pnpm.cmd lint`: verde.
- `pnpm.cmd test`: verde (backend, worker, shared, web y móvil).
- `pnpm.cmd build`: verde.
- API desplegada: `/health` 200; `/estaciones/60000` 404 porque aún no incorpora las PR nuevas.
