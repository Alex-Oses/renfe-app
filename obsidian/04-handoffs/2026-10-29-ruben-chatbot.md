---
fecha: 2026-10-29
autor: Rubén
area: api
para: todos
rama: feat/api-chatbot
pr: pendiente
tags: [handoff, chatbot, api]
---

# Handoff — implementación del chatbot de consultas

## Qué se hizo

- Se reserva para Rubén la implementación del chatbot de la API para evitar trabajo duplicado.
- Se define `POST /chatbot/mensaje` como endpoint público de consultas de solo lectura.
- El agente usará Gemini `gemini-3.5-flash-lite` con herramientas internas para estaciones, trenes,
  detalles y posiciones, con contexto de Renfe y guardrails contra prompt injection y filtrado de
  secretos.

## Qué queda

- Implementar el módulo NestJS, el adaptador de Gemini y las herramientas tipadas.
- Añadir tests unitarios y e2e del contrato.
- Configurar `GEMINI_API_KEY` en los entornos de despliegue sin subir secretos.

## Bloqueos / preguntas para otros

- La clave de Anthropic debe proporcionarse mediante el gestor de secretos o la configuración del
  despliegue; no se guardará en el repositorio ni en la bóveda.
- Las consultas privadas de billetes, abonos y reservas quedan fuera hasta disponer de identidad
  autenticada en el contexto de la conversación.

## Cambios en contratos

Se actualizó [[endpoints]] con `POST /chatbot/mensaje`.

## Ficheros tocados

- `obsidian/01-estado/estado-equipo.md`
- `obsidian/02-contratos-api/endpoints.md`
- `obsidian/05-areas/backend.md`
- Este handoff
