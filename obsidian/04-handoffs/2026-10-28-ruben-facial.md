---
fecha: 2026-10-28
autor: Rubén
area: api
para: Marina, Alex
rama: feat/api-retrasos
pr: 47
tags: [handoff, facial, database]
---

# Handoff — Reconocimiento facial: ADR, migración y endpoints listos

## Qué se hizo

- [[ADR-007-reconocimiento-facial]]: ArcFace de 512 (el mismo en web y app), el dispositivo calcula el
  vector y **Postgres decide** (umbral, 1:1, modelo). JWT propio de 12 h. Se descarta el servicio Python
  (`backend/face-service/`). Manda sobre el D7 de [[ADR-005-app-movil-expo]].
- Migración `backend/database/supabase/migrations/20261028120300_reconocimiento_facial.sql`:
  `config_cara` (una fila con modelo y umbral), tres funciones `security definer`
  (`registrar_cara`, `verificar_cara`, `resetear_cara`) y el valor `admin` en `perfiles.rol`.
  **`embeddings_faciales` no la creo yo**: es la tuya de `20261028120100_identidad.sql`, con la FK a
  `perfiles`. Mi fichero va después del tuyo a propósito.
- Contrato detallado en [[endpoints]]: `POST /auth/cara/registrar`, `/auth/cara/verificar` y
  `/auth/cara/reset`. En [[modelo-datos]] §3.2 está el porqué de la FK.
- **Código en `backend/api/src/modules/auth/`**: las tres rutas implementadas con Swagger, el mapeo
  `SQLSTATE → HTTP` y 12 tests (`cara.service.spec.ts`). El rol `admin` ya existe en `Rol` y en el guard.

## Qué queda

- **Aplicar la migración** cuando exista el proyecto de Supabase (`supabase db push`).
- Confirmar si el proyecto firma los JWT con el secreto compartido (**HS256**) o con claves asimétricas
  (**ES256/JWKS**). Si es ES256, el guard actual (`algorithms: ['HS256']`) rechaza **también** los tokens
  del login con contraseña: es un cambio en la API, avisadme y lo hago.
- Ajustar `config_cara.umbral` cuando se mida con caras reales.

## Bloqueos / preguntas para otros

- **Marina**: tu `20261028120100_identidad.sql` crea `perfiles` y `embeddings_faciales`, y la mía
  (`20261028120300_reconocimiento_facial.sql`) **depende de las dos**. Orden de merge: la tuya primero.
- **Marina**: mi migración hace `alter table perfiles drop constraint if exists perfiles_rol_check` y lo
  vuelve a crear con `('viajero', 'revisor', 'admin')`. `resetear_cara` necesita un `admin` y tu CHECK no
  lo admite. **No he tocado tu fichero.** Si prefieres meterlo tú, borro esas dos líneas y ya está.
- **Marina**: el rol se lee de `perfiles.rol` (no de `app_metadata`), siguiendo el contrato v2 que ya está
  en `develop`. Consecuencia: `SupabaseJwtGuard` sigue leyendo el claim del token, así que cuando la API
  cree un usuario tiene que escribir `perfiles.rol` **y** `app_metadata.rol` en la misma llamada, o los
  dos se separan. Eso lo hago yo en `POST /auth/registro` cuando exista.
- **Marina**: tu `perfiles` no la crea ningún trigger (lo dice tu comentario): la crea `POST /auth/registro`,
  que **todavía no existe**. Mientras no exista, `registrar_cara` falla por FK → `404 usuario no existe`.
  Es coherente, pero el facial no se puede probar de punta a punta hasta que haya registro.
- **Marina**: **tu rama `feat/db-migracion-catalogo-gtfs` no tiene PR abierto**. Sin ese PR no hay nada
  que revisar ni mergear, y sin migraciones aplicadas `/estaciones`, `/trenes` y el facial siguen en 503.
- **Sin BD no hay facial.** A diferencia de `/posiciones`, que lee el feed en memoria, aquí la plantilla
  tiene que estar guardada. Si el proyecto de Supabase no existe el 3/11, el facial no entra en la demo.

### Para Alex

- El facial de la web **deja de valer tal cual**: las plantillas de `localStorage`
  (`simulado-cuenta.ts`) son falsificables y no se migran. Hay que registrarse otra vez contra la API.
- Lo que cambia en `CamaraFacial.tsx`: se queda Human para detección, malla, antispoof y liveness, y
  **solo se sustituye su paso de `description` por ArcFace**. Los 5 puntos para alinear a 112×112 ya los
  da Human, así que no hay que montar un detector propio.
- Falta **elegir el fichero ONNX** de ArcFace 512 (el de referencia pesa demasiado para el navegador).
  Hasta que se elija, el facial no se puede implementar. Está en el ADR como pendiente.
- El contrato de las tres rutas está en [[endpoints]]; la respuesta de `/auth/cara/verificar` es
  `{ token, usuario }`, así que `Usuario` en `tipos.ts` necesita el campo `rol`.
- Tu D7 actualizado (#70) ya deja que el facial viva **dentro de la API**, así que en eso estamos de
  acuerdo. Lo único que queda distinto: tu D7 dice que la app **envía la imagen**; el ADR-007 dice que
  el dispositivo envía **solo los 512 números** (la foto no sale de él). Si te vale, cambia esa frase de
  D7 y ya no hay nada que discutir.

## Cambios en contratos

- [[endpoints]]: tres rutas nuevas detalladas y la sección **Autenticación** reescrita (dos formas de
  entrar, un solo formato de token, claims y caducidad).
- [[modelo-datos]] §3.2: `embeddings_faciales` es la tabla de Marina (FK a `perfiles`) y mi migración
  va detrás; §3.1 admite `admin` en `rol`.

## Ficheros tocados

- `backend/database/supabase/migrations/20261028120300_reconocimiento_facial.sql` (nuevo; el
  `20261028120000_reconocimiento_facial.sql` se borró porque duplicaba la versión de Marina)
- `backend/api/src/modules/auth/` (nuevo: `cara.controller.ts`, `cara.service.ts`, `auth.module.ts`,
  `dto/` y `cara.service.spec.ts`)
- `backend/api/src/common/auth/` (rol `admin` en `auth.types.ts` y en el guard)
- `obsidian/03-decisiones/ADR-007-reconocimiento-facial.md` (nuevo)
- `obsidian/02-contratos-api/endpoints.md`
- `obsidian/02-contratos-api/modelo-datos.md`
- `docs/arquitectura.md` (se quita `face-service` de la tabla y del flujo 5.4)
- `backend/api/README.md` (sección de login facial y mapeo de errores)
- `obsidian/05-areas/backend.md`
