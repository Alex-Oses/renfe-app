---
fecha: 2026-11-03
autor: Rubén
area: api
para: Alex
rama: feat/mobile-conexion-api-precios
pr: por abrir
tags: [handoff, frontend, api, integracion]
---

# Handoff — Integración de la API con el frontend de Alex

## Qué se hizo

He integrado en `feat/mobile-conexion-api-precios` el estado actual de `origin/develop`,
que ya incluye la PR #139. La integración conserva la conexión del frontend con la API:

- `POST /precios/calcular` es la fuente del importe mostrado cuando hay API.
- `POST /reservas` recibe tarifa, descuento, extras y tipo de pasajero.
- `POST /reservas/transbordo` sustituye la compensación de comprar y cancelar desde el cliente.
- `GET /reservas?localizador=` y `GET /estaciones/:id` se usan para esas consultas.
- `GET /billetes` usa las relaciones `transbordos` devueltas por el servidor.
- Sin URL de API se mantiene el modo simulado.

También se han conservado los cambios no conflictivos de #139, incluidos los extras de reserva,
la ampliación del contrato y las mejoras de la aplicación móvil. Los conflictos en las pantallas
de reserva se resolvieron priorizando la conexión atómica y el cálculo de precios del servidor.

## Por qué

La lógica de precios, descuentos, extras, reservas y transbordos debe tener una única autoridad:
la API. `frontend/shared/api` solo construye peticiones, adapta respuestas y mantiene el fallback
simulado; no debe decidir el importe real que se cobra.

Esto evita que la web y la app calculen importes distintos o que una compra de transbordo deje
un tramo reservado si falla el segundo.

## Qué necesitas cambiar

- No vuelvas a introducir `calcularTotal` para el importe real cuando exista API.
- No restaures la compensación cliente de `comprarDosTramos`; debe delegar en
  `POST /reservas/transbordo`.
- Mantén `pasajeros[].tipo`, `tarifa`, `descuento` y `extras[]` en el cuerpo de reserva.
- Si trabajas sobre esta rama, revisa los conflictos de tu copia contra la versión integrada
  antes de abrir otra PR.
- Las PR #137 y #138 siguen abiertas y son necesarias para que el despliegue exponga todas las
  rutas nuevas; #139 ya está mergeada en `develop`.

## Qué queda

- Abrir la PR de esta rama contra `develop` cuando se haya revisado la integración.
- Repetir la validación manual contra un despliegue que incluya #137 y #138.
- Probar en móvil real el flujo de compra y el modo sin API.

## Bloqueos / preguntas para otros

- La API desplegada puede seguir devolviendo 404 en las rutas de #137/#138 hasta que esas PR se
  integren en la rama desplegada.
- La carpeta local `.obsidian/` no forma parte de este trabajo y se deja intacta.

## Cambios en contratos

Se integraron los cambios de contrato que ya venían en `origin/develop`, incluyendo extras de
reserva. No se ha inventado ningún endpoint adicional.

## Ficheros tocados

- `frontend/shared/api/`
- `frontend/shared/billetes/`
- `frontend/web/src/paginas/reserva/`
- `frontend/mobile/src/app/`
- `backend/api/` y `backend/database/` procedentes de #139
- `obsidian/02-contratos-api/`
