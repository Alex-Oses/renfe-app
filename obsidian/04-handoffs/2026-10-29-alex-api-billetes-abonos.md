---
fecha: 2026-10-29
autor: Alex (con Claude y OpenCode)
area: api, database
para: Rubén, Marina, Kevin
rama: feat/api-auth-billetes-abonos (encima de feat/db-billetes-abonos)
pr: (pendiente)
tags: [handoff, api, base-datos, billetes, abonos]
---

# Handoff — Migración y API de cuenta, reservas, billetes y abonos

## Qué se hizo
- **Marina:** migración `20261029120000_billetes_y_abonos.sql` (rama `feat/db-billetes-abonos`): `reservas`, `asientos`, `abonos`, `billetes`, `validaciones`, con RLS (cada usuario ve lo suyo, escritura solo `service_role`). Tablas en [[modelo-datos]].
- **Rubén:** rutas nuevas en la API: `POST /auth/registro`, `POST /auth/login`, `POST /reservas`, `GET /billetes`, `GET /billetes/:id/qr`, `POST /billetes/validar` (revisor/admin), `GET/POST /abonos`, `GET /abonos/:id`. Marcadas en [[endpoints]]. Lint, 113 tests y build en verde.

## Qué queda
- Aplicar la migración en Supabase Cloud y probar todo contra la BD real (no se ha ejecutado contra Postgres de verdad; solo en PGlite).
- **Kevin:** variable nueva `QR_SIGNING_SECRET` en Render (está en `.env.example` sin valor).

## Bloqueos / preguntas
- **Rubén:** el QR se firma con HMAC-SHA256, no con Ed25519 como decía el contrato (anotado en [[endpoints]]). Si prefieres Ed25519, se cambia en `backend/api/src/common/qr/firma.ts`.
- **Rubén:** los abonos nacen `activo` porque aún no hay Stripe ni webhook.
- **Marina:** revisa las decisiones de la migración (origen/destino en `reservas`, `qr` guardado en `billetes`, `usuario_id` con `on delete set null`).

## Prueba local (29/10, sin Docker)
Las 5 migraciones aplicadas en orden en PGlite (Postgres 17 en WASM) y la API real (`node dist/main.js`) conectada por el protocolo de Postgres, con un viaje Madrid-Zaragoza-Barcelona de prueba:
- `/estaciones`, `/trenes` y `/trenes/:feed/:tripId` devuelven datos y paradas.
- `POST /reservas` crea la reserva pagada con el billete y el QR; `GET /billetes` y `/billetes/:id/qr` OK.
- `/billetes/validar`: `valido` → `ya_validado` el mismo día, `otro_dia` si es otro día, `falso` si el QR está tocado, 403 si no eres revisor.
- `POST/GET /abonos` OK; el abono de otro usuario da 404.
- Facial: registro con un vector de 512 y `verificar` da token con la misma cara y 401 con otra.
- **Sin probar:** `/auth/registro` y `/auth/login` (necesitan Supabase Auth de verdad).
- **Rubén:** `/trenes` devuelve `numero: null` aunque `viajes.numero` tenga valor: `numeroDe()` lo saca de `rutas.nombre_corto` (`trenes.service.ts:123`). Los billetes sí lo llevan.
