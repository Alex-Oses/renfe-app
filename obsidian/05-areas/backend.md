---
responsable: Rubén
tags: [area]
---

# 🧩 Área Backend (API)

**Código:** `backend/api` · **Estado (29/10):** 9 módulos implementados y probados contra Postgres
(Supabase Cloud). Falta desplegar con `DATABASE_URL` en Render.

Plan completo, diagramas y caminos de petición: [`docs/arquitectura.md`](../../docs/arquitectura.md)
Contrato de cada ruta: [[endpoints]]. Esquema: [[modelo-datos]].

La API emite JWT propios firmados con `JWT_SECRET` (HS256, 12 horas) tanto para el login con contraseña
como para el login facial. Supabase Auth se usa internamente para validar credenciales y `DATABASE_URL`
permanece solo en el backend. **Ningún token de Supabase llega al cliente** (`refreshToken: null`).

## Módulos

| Módulo | Responsable | Estado |
|---|---|---|
| health (`GET /health`) | Rubén | ✅ |
| estaciones (`GET /estaciones`) | Rubén | ✅ probado contra Supabase |
| trenes (`GET /trenes`, detalle, `/posicion`) | Rubén | ✅ probado contra Supabase |
| posiciones (`GET /posiciones`) | Rubén | ✅ probado contra Renfe; no usa BD |
| auth (`/auth/registro`, `/auth/login`, `/auth/cara/*`) | Rubén | ✅ |
| reservas (`POST /reservas`) | Rubén | ✅ pago simulado |
| billetes (`GET /billetes`, `/qr`, `POST /billetes/validar`) | Rubén | ✅ QR HMAC-SHA256 |
| abonos (`GET/POST /abonos`, `GET /abonos/:id`) | Rubén | ✅ |
| chatbot (`POST /chatbot/mensaje`) | Rubén | ✅ Gemini `gemini-3.5-flash-lite` + guardrails |
| pagos (Stripe) | — | ⛔ fuera de alcance: no hay pasarela |
| incidencias (`GET /incidencias`) | Rubén | ⛔ propuesto, sin implementar |
| admin (`GET /admin/resumen`) | Rubén | ⛔ propuesto, sin implementar |

## Datos reales que consume

Lo estático entra por `backend/gtfs-worker` a Postgres y la API solo lee. **La excepción es GTFS-RT**:
`/posiciones` descarga los 4 JSON de Renfe y los guarda en memoria, sin worker y sin BD (decisión del
27/10, ver §9 de la arquitectura).

| Dato | Fuente | Volumen medido |
|---|---|---|
| Estaciones, rutas y horarios | GTFS Cercanías (15,1 MB) + GTFS AVE/LD/MD (0,8 MB) | **Cargado hoy: solo `avld`** (1 035 estaciones · 8 908 viajes · 71 781 horarios) |
| Posiciones, retrasos e incidencias | GTFS-RT Cercanías + AVE/LD (JSON, cada 30 s) | ~500 posiciones, retraso real cruzado por `tripId` |

## Reglas técnicas

- La API **no llama a Renfe para datos estáticos**: si hace falta un dato nuevo del GTFS, lo importa
  el worker. GTFS-RT es la excepción (`/posiciones`), y solo en memoria.
- `feed` (`cercanias` | `avld`) en toda tabla, DTO y clave que venga de GTFS.
- Horas GTFS como segundos enteros: pueden pasar de 24:00.
- Búsqueda con índice `(stop_id, departure_seconds)`, objetivo < 150 ms.
- Precios, asientos y pagos son simulados; no hay tarjeta ni Stripe.
- Todo cambio de endpoint, tabla o evento se escribe antes en [[endpoints]] o [[modelo-datos]].

## Decisiones cerradas

- Una estación lógica + `estacion_feeds` (Atocha no se duplica en la UI).
- Nombres de tabla **sin prefijo**: `estaciones`, `viajes`, `horarios`… (`gtfs_*` era una abreviatura
  de [[sprint-actual]]).
- Tiempo real: snapshot en memoria + `GET /posiciones`. Sin worker ni Realtime.
- Facial: el vector lo calcula el dispositivo y decide Postgres ([[ADR-007-reconocimiento-facial]]).

## Pendiente

- `DATABASE_URL` (session pooler) en Render: hasta entonces `/estaciones` y `/trenes` dan 503.
- **Facial 1024 vs 512:** la web calcula 1024 (Human) y el contrato/BD piden 512 ArcFace.
- `/incidencias`: degradado sin BD (`alerts.json` no trae `headerText` ni `cause`).
- Cercanías en la BD: el código soporta el feed, pero no está cargado.
- QR: pasar de HMAC-SHA256 a Ed25519 cuando existan las claves (`common/qr/firma.ts`).

## Historial

- 2026-10-29 — JWT propio de la API, chatbot con Gemini, `/reservas`, `/billetes`, `/abonos` y
  `/billetes/validar` implementados. Handoffs: [[2026-10-29-ruben-jwt-propio-api]],
  [[2026-10-29-ruben-chatbot]], [[2026-10-29-ruben-chat-frontend]].
- 2026-10-27 — `/posiciones` con retrasos reales, `paradaActual` y `GET /trenes/:feed/:tripId/posicion`
  (PR #47). Handoffs: [[2026-10-27-ruben-gtfsrt-para-alex]], [[2026-10-27-ruben-campos-mapa-para-alex]],
  [[2026-10-27-ruben-gtfs-estatico-para-marina]].
- 2026-10-26 — Plan de arquitectura y verificación de fuentes de Renfe: [[2026-10-26-ruben-arquitectura-api-renfe]]
