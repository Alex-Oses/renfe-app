---
fecha: 2026-10-29
autor: Rubén
area: api
para: Alex, Marina, Kevin
rama: fix/mobile-chat-demo-local
pr: "#97"
tags: [handoff, chatbot, frontend, supabase, local]
---

# Handoff — Prueba del chatbot real en local

## Qué se hizo

- Se configuró la web local para usar `VITE_API_URL=http://localhost:3100` y
  `VITE_POSICIONES_URL=http://localhost:3100` mediante `frontend/web/.env.local`.
- La API local se arrancó en el puerto `3100`, porque el `3000` estaba ocupado por
  `AMAgent`.
- `GET /health` respondió correctamente con `estado: ok` y `baseDatos: ok`.
- `GET /estaciones?q=Madrid` devolvió estaciones reales desde Supabase Cloud.
- Se amplió el modo demo del chatbot para responder a saludos, agradecimientos,
  despedidas, conversación sencilla y consultas de trayectos simulados.
- Se añadió la estación simulada de Tarragona para poder probar el trayecto Tarragona →
  Barcelona en demo.

## Conversación observada

```text
Asistente: ¡Hola! Puedo ayudarte a encontrar trenes, estaciones y horarios.
Usuario: hola
Asistente: ¡Hola! ¿En qué puedo ayudarte hoy con tus consultas sobre estaciones,
trenes, horarios o posiciones en Renfe?
Usuario: dime un tren de tarragona a barcelona
Asistente: Para poder buscar un tren entre Tarragona y Barcelona, por favor indícame
la fecha en la que deseas viajar (en formato AAAA-MM-DD), así como la estación
específica de salida (por ejemplo, Tarragona o Camp de Tarragona) y de llegada
(como Barcelona-Sants).
Usuario: para mañana, dime todas las horas, por la mañana si puede ser
Asistente: ¡Hola! Para poder ayudarte a consultar los horarios de los trenes, por
favor indícame la estación de origen y la estación de destino (y, si lo sabes, el
feed o red, como Cercanías o AVLD). ¡Así podré buscar las opciones disponibles
para ti!
Usuario: de tarragona a barcelona
Asistente: La API está tardando demasiado en responder. Inténtalo de nuevo.
```

## Diagnóstico

- La respuesta inicial y las preguntas de aclaración proceden del chatbot real de
  Gemini, no del modo demo.
- La última petición llegó a la API local, pero superó el timeout de 8 segundos del
  cliente web. No se expusieron secretos en esta nota.
- El backend y la base de datos sí estaban disponibles; el problema observado es
  de latencia de la consulta conversacional real o del proveedor Gemini.

## Qué queda

- Repetir la consulta con la API local y revisar los logs de Nest/Gemini para medir
  dónde se consumen los más de 8 segundos.
- Decidir si el timeout de producción debe ser mayor para el chatbot, sin eliminar
  el límite de las consultas de trenes y posiciones.
- Mergear la PR #97 cuando la CI y las revisiones estén en verde.

## Bloqueos / preguntas para otros

- `frontend/web/.env.local` es local e ignorado por Git; cada entorno debe definir
  su propia `VITE_API_URL`.
- La API usa `http://localhost:3100` en esta máquina porque el puerto 3000 está
  ocupado.

## Cambios en contratos

Ninguno. Se mantiene el contrato de `POST /chatbot/mensaje` en [[endpoints]].

## Ficheros tocados

- `frontend/shared/api/cliente.ts`
- `frontend/shared/api/simulado.ts`
- `frontend/web/.env.local` (ignorado, no se sube)
- Este handoff
