---
fecha: 2026-11-03
autor: Alex
area: frontend
para: todos
rama: fix/mobile-descuento-ninos-transbordos
pr: "#139"
tags: [handoff]
---

# Handoff — Descuento de niños, transbordos y paridad web/móvil

## Qué se hizo

- **Descuento de niños**: la API guardaba cada billete a precio completo porque no sabía qué viajero era niño. `POST /reservas` acepta ahora `pasajeros[].tipo`, `tarifa` y `descuento`, y cobra cada billete con las mismas reglas que la web (niño 40 %, la tarjeta no se acumula y gana el mayor, factor de tarifa). La web y la app los mandan.
- **Transbordos**: el enlace pasa niños, bebés y descuento; la compra cobra con `calcularTotal`; la opción elegida se identifica por tipo, número y salida de cada tren (el `tripId` del mismo servicio cambia entre búsquedas y daba «ya no está disponible»). Se avisa del cambio de estación.
- **Mis billetes**: si se compra dos veces el mismo viaje con transbordo, cada segundo tren se une a su compra (antes se cruzaban).
- **App móvil**: con la API real no podía comprar (`confirmarPagoSimulado` lanza error). Nuevo `comprarReserva` en `@renfe/shared/api/cliente`. Paridad con la web: portada animada, pie, 20 herramientas, admin y descuento guardado.
- `pnpm tunel:mobile`: Expo Go por túnel de Expo para escanear el QR desde cualquier red; si `EXPO_PUBLIC_API_URL` es local, usa el Funnel.
- Probado de punta a punta con la API en Docker: transbordo Tarragona → Huelva, adulto con Joven + niño + bebé, 225,03 € al pagar, en BD y en Mis billetes.

## Qué queda

- Probar la app en móvil real y el QR fuera de la red.
- Los extras (maleta, mascota…) solo los suma el front; la API no los guarda.
- Las reservas anteriores a este cambio siguen a precio completo.

## Bloqueos / preguntas para otros

- **Rubén**: este PR toca `backend/api` (DTO de reservas, `common/simulado/precio.ts` y el servicio). Revísalo, por favor.
- Si `arrancar.cmd` falla con «QR_SIGNING_PRIVATE_KEY no es una clave Ed25519», borra el valor de `.env` y vuelve a lanzarlo: el script solo la genera si está vacía.

## Cambios en contratos

[[endpoints]]: `POST /reservas` con precio por viajero (`tipo`, `tarifa`, `descuento`).

## Ficheros tocados

- `backend/api/src/common/simulado/precio.ts` (+ spec), `backend/api/src/modules/reservas/` (DTO y servicio)
- `frontend/shared/api/` (adaptador-reservas, cliente, comprar-transbordo, tipos), `frontend/shared/billetes/agrupar.ts`
- `frontend/web/src/paginas/` (Resultados, reserva/PasoPago, reserva/ReservaTransbordo)
- `frontend/mobile/` (pantallas, componentes, `src/herramientas/`, `scripts/tunel.mjs`)
