---
fecha: 2026-10-29
autor: Rubén
area: api
para: Alex, Marina, Kevin
rama: fix/mobile-chat-demo-local
pr: pendiente
tags: [handoff, frontend, chatbot, demo]
estado: cerrado
---

# Handoff — Chat demo y timeout local

## Qué se hizo

- El chatbot ahora responde en modo demo sin necesitar `VITE_API_URL`.
- La respuesta demo distingue preguntas sobre estaciones, trenes y horarios.
- Las peticiones del cliente compartido tienen un límite de 8 segundos para evitar que la interfaz quede esperando indefinidamente.
- La carga de posiciones en directo usa el mismo límite y muestra el error controlado si la API no responde.

## Qué queda

- Probar la PR en la web desplegada con el backend disponible para validar respuestas reales de Gemini.
- Configurar `VITE_API_URL` solo cuando se quiera abandonar el modo demo.

## Bloqueos / preguntas para otros

- En modo demo las respuestas del chat son simuladas y no consultan Gemini.
- Los datos de trenes y posiciones son simulados si no se configura una API local.

## Cambios en contratos

Ninguno. Se mantiene el contrato existente de [[endpoints]].

## Ficheros tocados

- `frontend/shared/api/cliente.ts`
- `obsidian/01-estado/estado-equipo.md`
- Este handoff
