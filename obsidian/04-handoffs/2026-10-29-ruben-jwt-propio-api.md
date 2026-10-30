---
fecha: 2026-10-29
autor: Rubén
area: api
para: Alex, Marina, Kevin
rama: feat/api-chatbot
pr: pendiente
tags: [handoff, api, auth, jwt]
estado: abierto
---

# Handoff — JWT propio de la API

## Qué se hizo

- La API dejó de aceptar tokens JWT emitidos por Supabase directamente.
- `JWT_SECRET` es ahora el secreto propio de la API y el guard valida únicamente tokens HS256
  firmados por ella.
- El login con contraseña usa Supabase Auth internamente para validar credenciales, pero devuelve
  un JWT propio de la API.
- El login facial continúa devolviendo un JWT propio con 12 horas de caducidad.
- El contrato documenta `refreshToken: null`; ningún token de Supabase se entrega al cliente.
- Las claves QR siguen separadas: `QR_SIGNING_SECRET` solo es necesaria para emitir o validar QR.

## Qué queda

- Configurar `JWT_SECRET` en Render y en el futuro despliegue Docker.
- Configurar `QR_SIGNING_SECRET` si se van a probar billetes o abonos.
- Actualizar los clientes si esperaban renovar sesiones con un `refresh_token` de Supabase.

## Bloqueos / preguntas para otros

- No publicar `JWT_SECRET`, `QR_SIGNING_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` ni `DATABASE_URL` en
  Git, la bóveda o el frontend.

## Cambios en contratos

Actualizado [[endpoints]]: el token de `/auth/registro` y `/auth/login` es propio, HS256, dura 12
horas y no incluye refresh token de Supabase.

## Ficheros tocados

- `backend/api/src/common/auth/supabase-jwt.guard.ts`
- `backend/api/src/modules/auth/auth.service.ts`
- `backend/api/src/modules/auth/cara.service.ts`
- `backend/api/src/config/entorno.ts`
- `.env.example`
- `backend/api/README.md`
- `docs/levantar-en-local.md`
- `obsidian/02-contratos-api/endpoints.md`
- Este handoff
