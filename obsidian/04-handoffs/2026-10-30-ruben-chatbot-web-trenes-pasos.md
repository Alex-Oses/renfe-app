---
fecha: 2026-10-30
autor: Rubén
area: api
para: Alex, Kevin
rama: fix/mobile-chat-demo-local
pr: "#97"
tags: [handoff, chatbot, frontend, api]
estado: cerrado
---

# Handoff — Chatbot con contexto, memoria, pasos en vivo y tarjetas de trenes

## Qué se hizo

- **Contexto en un `.md`**: `backend/api/src/modules/chatbot/context/ENDPOINTS.md` describe qué
  puede hacer el bot y qué endpoints tiene (y cuáles son privados y no debe usar). Se carga en el
  `systemInstruction`, junto con la fecha de hoy y mañana en hora de Madrid para que no invente años.
- **Memoria de conversación** en el proceso (`Map` por `conversationId`, 4 últimos intercambios,
  TTL 30 min). El `conversationId` lo genera la API en el primer turno y lo devuelve en la respuesta.
- **Pasos en vivo por SSE**: `POST /chatbot/mensaje/flujo` emite `paso` (`analizando`,
  `consultando` + herramienta, `razonando`), `fin` y `error`. `POST /chatbot/mensaje` (JSON) se
  mantiene para la app móvil.
- **Web** (`frontend/web/src/componentes/Chatbot.tsx`): Markdown mínimo propio (párrafos, listas,
  negrita), pasos con **línea vertical** de punto a punto, botón **Nueva** para resetear la
  conversación y tarjetas de tren con enlace directo a la reserva.
- **Lista de trenes**: la API devuelve como máximo **8** viajes (`MAX_TRENES`); la web muestra **1**
  y despliega el resto con **Mostrar más (N)** / **Mostrar menos**. Cuando hay tarjetas, el texto
  del modelo se pinta solo en párrafos (las listas se ocultan para no duplicar).
- **Prompt**: el bot ya no enumera los trenes; resume en una o dos frases cuántos hay, primera y
  última salida y precio más bajo.
- **Cliente shared**: `enviarMensajeChatbotFlujo` con `fetch` + `TextDecoderStream` (sin el límite
  de 8 s del cliente anterior) y lector SSE en `frontend/shared/api/flujo-chatbot.ts`.

## Verificado

- Playwright contra la API local (`:3100`) y la web (`:5173`): pasos reales encadenados, 1 tarjeta →
  `Mostrar más (7)` → 8 tarjetas → vuelta a 1, sin asteriscos en el DOM, segundo turno con memoria
  («y el más barato?» recuerda trayecto y fecha).
- `@renfe/api`: lint limpio, **137 tests** (uno nuevo del tope de 8). `@renfe/shared`: **101**.
  `@renfe/web`: **38** y build en verde.

## Qué queda

- Probar el chat en la **app Expo**: usa el endpoint JSON y su propia memoria en el cliente, así que
  no recibe pasos ni el tope de 8 igual.
- El timeout del cliente web ya no es de 8 s, pero la latencia de Gemini sigue siendo el punto débil
  de la demo (una consulta tardó más de 8 s en la prueba anterior).

## Bloqueos / preguntas para otros

- **Kevin**: `render.yaml` de `develop` no declara `JWT_SECRET` (solo `SUPABASE_JWT_SECRET`), así que
  en Render toda ruta autenticada daría 401. Sigue pendiente en `chore/infra-jwt-render`.
- Los endpoints privados (`/reservas`, `/billetes`, `/abonos`, `/auth/*`) **no** son herramientas del
  bot: se documentan para que responda «eso lo ves en tu cuenta».

## Cambios en contratos

[[endpoints]]: `POST /chatbot/mensaje` devuelve `conversationId`, `herramientas` y `trenes` (hasta 8);
nuevo `POST /chatbot/mensaje/flujo` (SSE) con eventos `paso`, `fin` y `error`.

## Ficheros tocados

- `backend/api/src/modules/chatbot/chatbot.service.ts`, `chatbot.controller.ts`,
  `gemini.provider.ts`, `chatbot.service.spec.ts`, `context/ENDPOINTS.md`
- `frontend/shared/api/cliente.ts`, `tipos.ts`, `flujo-chatbot.ts` (+ test)
- `frontend/web/src/componentes/Chatbot.tsx`, `componentes/chatbot/markdown.ts` (+ test),
  `estilos/base.css`
- `obsidian/02-contratos-api/endpoints.md`
- Este handoff

## Nota de alcance

La rama `fix/mobile-chat-demo-local` (PR #97) mezcla el chat demo de la app móvil con este trabajo de
API + web porque el cliente compartido (`frontend/shared/api/cliente.ts`) ya estaba tocado allí.
Separarlo exigía reescribir la rama; se deja anotado para que quien revise lo sepa.
