---
fecha: 2026-10-29
autor: Rubén
area: api
para: Alex, Marina, Kevin
rama: feat/mobile-chat-ia
pr: pendiente
tags: [handoff, frontend, chatbot]
estado: cerrado
---

# Handoff — Acceso flotante al chatbot

## Qué se hizo

- Se añadió un botón flotante pequeño de ayuda en la web, con estética de cristal y colores de Renfe.
- Al abrirlo muestra un panel responsive con saludo, historial de mensajes, estado de escritura, errores y campo para enviar consultas.
- El componente conserva el `conversationId` devuelto por la API para continuar la conversación.
- Se conectó con `POST /chatbot/mensaje` mediante el cliente compartido y se añadieron sus tipos.

## Qué queda

- Revisar visualmente el parecido exacto con el repositorio de Mira cuando Alex facilite esa referencia.
- Integrar esta rama después de la PR #93, que incorpora el endpoint del chatbot en backend.

## Bloqueos / preguntas para otros

- En modo demo, sin `VITE_API_URL`, el botón muestra el error estándar de chat no disponible.
- La referencia visual de Mira no está presente en este repositorio.

## Cambios en contratos

Ninguno. El componente usa el contrato existente de [[endpoints]] para `/chatbot/mensaje`.

## Ficheros tocados

- `frontend/shared/api/cliente.ts`
- `frontend/shared/api/tipos.ts`
- `frontend/web/src/componentes/Chatbot.tsx`
- `frontend/web/src/estilos/base.css`
- `frontend/web/src/main.tsx`
- Este handoff
