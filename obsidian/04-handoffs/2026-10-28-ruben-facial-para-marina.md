---
fecha: 2026-10-28
autor: Rubén
area: face-service
para: Marina
rama: feat/api-retrasos
pr: 47
tags: [handoff, facial, database]
---

# Handoff — Reconocimiento facial: ADR y migración lista para aplicar

## Qué se hizo

- [[ADR-005-reconocimiento-facial]]: ArcFace de 512 (el mismo en web y app), el dispositivo calcula el
  vector y **Postgres decide** (umbral, 1:1, modelo). JWT propio de 12 h. Se descarta el servicio Python
  (`backend/face-service/`).
- Migración `backend/database/supabase/migrations/20261028120000_reconocimiento_facial.sql`:
  `embeddings_faciales` (`vector(512)`), `config_cara` (una fila con modelo y umbral) y tres funciones
  `security definer`: `registrar_cara`, `verificar_cara`, `resetear_cara`.
- Contrato detallado en [[endpoints]]: `POST /auth/cara/registrar`, `/auth/cara/verificar` y
  `/auth/cara/reset`. En [[modelo-datos]] §3.2 está el porqué de la FK.

## Qué queda

- **Aplicar la migración** cuando exista el proyecto de Supabase (`supabase db push`).
- Confirmar si el proyecto firma los JWT con el secreto compartido (**HS256**) o con claves asimétricas
  (**ES256/JWKS**). Si es ES256, el guard actual (`algorithms: ['HS256']`) rechaza **también** los tokens
  del login con contraseña: es un cambio en la API, avisadme y lo hago.
- Ajustar `config_cara.umbral` cuando se mida con caras reales.

## Bloqueos / preguntas para otros

- **Marina**: la migración **no toca ninguna tabla tuya**. No crea `perfiles`; la FK de
  `embeddings_faciales` va a `auth.users`. Se puede aplicar antes o después de tus migraciones de GTFS.
  Si ya tienes un `perfiles` con `rol`, no hay conflicto: el facial no lo usa.
- **Marina**: el `reset` comprueba el rol leyendo `app_metadata.rol` en `auth.users`, no `perfiles.rol`.
  Si el rol se queda solo en `perfiles`, hay que decirme dónde vive de verdad, porque el guard ya lee
  `app_metadata`.
- **Sin BD no hay facial.** A diferencia de `/posiciones`, que lee el feed en memoria, aquí la plantilla
  tiene que estar guardada. Si el proyecto de Supabase no existe el 3/11, el facial no entra en la demo.

## Cambios en contratos

- [[endpoints]]: tres rutas nuevas detalladas y la sección **Autenticación** reescrita (dos formas de
  entrar, un solo formato de token, claims y caducidad).
- [[modelo-datos]] §3.2: la FK pasa de `perfiles` a `auth.users`, y §3.1 recoge el índice de rol nuevo.

## Ficheros tocados

- `backend/database/supabase/migrations/20261028120000_reconocimiento_facial.sql` (nuevo)
- `obsidian/03-decisiones/ADR-005-reconocimiento-facial.md` (nuevo)
- `obsidian/02-contratos-api/endpoints.md`
- `obsidian/02-contratos-api/modelo-datos.md`
