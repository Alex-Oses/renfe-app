---
fecha: 2026-11-03
autor: Buffy (agente)
area: backend
para: ruben
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-006, chatbot, docker, gemini, infra]
estado: resuelto
---

# Handoff — Ticket 006: chatbot en Docker

## Por qué falla

1. **La configuración no llega porque no existe en el `.env` local.** El compose pasa el `.env`
   entero al contenedor (`env_file: .env`), pero en esta máquina faltan `GEMINI_API_KEY` y
   `GEMINI_MODEL` (y también `POSTGRES_PASSWORD`, `JWT_SECRET` y `CORS_ORIGINS`). Con el `.env`
   actual ni siquiera se resuelve el compose:
   `docker compose config` → «required variable POSTGRES_PASSWORD is missing a value». Sin clave, el
   chatbot responde `503` **a propósito**; no era un fallo de red ni del proveedor.
2. **El modo sin clave no se veía en el arranque**, así que en `docker compose logs api` no había
   ninguna pista de por qué el chat no respondía.
3. **Los errores del proveedor eran opacos.** Un modelo inexistente, una clave rechazada o una cuota
   agotada devolvían el mismo «ha rechazado la petición», sin HTTP ni mensaje en el log.
4. **`GEMINI_MODEL=` vacía rompía la URL.** Se usaba `??`, así que una cadena vacía no caía al modelo
   por defecto: la petición iba a `/models/:generateContent` y Gemini devolvía 404.

## Qué se cambió

- `gemini.provider.ts`: `||` para el modelo por defecto; `Logger` con el **HTTP y el mensaje del
  proveedor** (recortado a 300 caracteres y con la clave sustituida por `***`); mensajes de cliente
  distintos para 400/403 (clave o modelo), 404 (modelo), 429 (cuota) y red; aviso único al usar el
  proveedor sin clave.
- `main.ts`: al arrancar avisa en el log si `GEMINI_API_KEY` está vacía (visible en
  `docker compose logs api`).
- `chatbot.controller.ts`: el `catch` del SSE registra el error; antes solo emitía un evento genérico.
- `.env.example` y `deploy/README.md`: documentado que la clave es opcional (503 sin ella), cómo
  comprobar las variables dentro del contenedor **sin imprimir la clave** y que el compose no necesita
  duplicarlas en `environment:`.
- `gemini.provider.spec.ts`: 8 pruebas nuevas que no llaman al proveedor (sin clave, modelo vacío,
  404, 403, 429, red, respuesta inválida y carga de prompts).

## Cómo se comprobó

- `pnpm --filter @renfe/api test -- src/modules/chatbot/gemini.provider.spec.ts
  src/modules/chatbot/chatbot.service.spec.ts` → **21 pruebas en verde**.
- `pnpm --filter @renfe/api lint` → 0 avisos y 0 errores.
- `pnpm --filter @renfe/api build` → OK; los tres `.md` del chatbot se copian a `dist/`.
- Prueba real del build sin clave (puerto 3311): `POST /chatbot/mensaje` → **503**
  `{"message":"El chatbot no está configurado",...}` y en el log
  `WARN [Arranque] GEMINI_API_KEY vacía: /chatbot responderá 503 (el resto de la API funciona)`.

## Pendiente / bloqueos

- **No se pudo levantar el compose:** el daemon de Docker no está corriendo en esta máquina
  (`dockerDesktopLinuxEngine` no existe), el mismo bloqueo que ya recoge `deploy/README.md`. Por eso
  la prueba en contenedor queda pendiente; los comandos están en `deploy/README.md` § Chatbot.
- Para probarlo en el servidor: rellenar `POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS` y
  `GEMINI_API_KEY` en `.env`, `docker compose up -d --build db api`, y comprobar
  `docker compose exec api printenv GEMINI_MODEL` + `docker compose logs api | grep -i chatbot`.
- No se ha llamado al proveedor real (no hay clave y sería de pago): las pruebas usan `fetch`
  simulado.

## Cambios en contratos

- Ninguno: mismas rutas y mismos `503`; solo cambian los textos de error y los logs.

## Ficheros tocados

- `backend/api/src/modules/chatbot/gemini.provider.ts`
- `backend/api/src/modules/chatbot/gemini.provider.spec.ts` (nuevo)
- `backend/api/src/modules/chatbot/chatbot.controller.ts`
- `backend/api/src/main.ts`
- `.env.example`
- `deploy/README.md`
- `tickets/ticket-006.md`
