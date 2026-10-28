---
fecha: 2026-10-28
estado: aceptado
autor: Rubén
tags: [adr, facial, auth, seguridad]
---

# ADR-005 — Reconocimiento facial: ArcFace 512, lógica en la base de datos y JWT propio

Sustituye **solo la parte de reconocimiento facial** de [[ADR-004-web-primero-vercel-render]]. El resto
de ADR-004 (web primero, API en Render, facial sin servidor Python) no se toca.

## Contexto

- El inicio de sesión facial es **obligatorio** en la entrega.
- ADR-004 lo resolvió con Human en el navegador y la comparación en el cliente, contra una plantilla
  en `localStorage`. Funciona, pero la plantilla la puede cambiar cualquiera desde las herramientas del
  navegador y no hay ni una regla en el servidor.
- La entrega principal será una **app móvil**, así que el facial tiene que funcionar fuera del navegador.
- Requisito del equipo: **ninguna lógica de negocio en el frontend** y **nada se conecta a la base de
  datos directamente**.
- Nunca se guardan fotos: solo el vector ([[modelo-datos]] §3.2 y §9).

## Decisión

1. **Modelo ArcFace de 512 dimensiones**, el mismo en la web y en la app. Es el estándar de facto, tiene
   benchmarks publicados y umbrales documentados, y coincide con el `vector(512)` que ya está en el
   modelo de datos: **no hay que cambiar el esquema**.
2. **No se tira Human.** Se queda para detección, malla facial, antispoof y liveness. Solo se sustituye
   su paso de `description` por ArcFace. Así el alineado a 112×112 usa los puntos que Human ya calcula
   y no hay que montar un detector propio.
3. **El dispositivo calcula el vector; el servidor decide todo lo demás.** Postgres no puede ejecutar un
   modelo, así que calcular el embedding es la única pieza que no vive en la base de datos. El frontend
   no conoce el umbral, no decide nada y no puede leer la plantilla.
4. **Toda la lógica de negocio en funciones de Postgres** (`registrar_cara`, `verificar_cara`),
   `security definer`, con `execute` solo para `service_role`. También el `reset` de la plantilla es
   una función (`resetear_cara`) que comprueba el rol `admin` dentro de Postgres.
5. **La migración no toca las tablas de Marina.** Solo crea `embeddings_faciales` y `config_cara`, y la
   FK va a `auth.users` (de Supabase), no a `perfiles`. Así el facial se puede aplicar antes o después
   de su trabajo sin pisarse.
6. **JWT propio**, firmado por la API (HS256 con el secreto compartido de Supabase), igual que el del
   login con contraseña. Un solo formato de token y un solo guard.
7. **La contraseña la gestiona Supabase Auth.** La app habla con la API de Auth, nunca con Postgres.
8. **Una sola plantilla por usuario y no se puede cambiar.** El `reset` solo lo puede hacer un `admin`.
9. **Se elimina `backend/face-service/`** y `FACE_SERVICE_URL` del `.env.example`.

## Alternativas descartadas

- **Servicio Python (InsightFace + FastAPI)**: no cabe en los 512 MB del plan gratuito de Render, ya lo
  descartaba ADR-004, añade un despliegue y un `Dockerfile` más, y obliga a mandar fotos por la red.
- **`onnxruntime-node` dentro de la API**: factible, pero mete 100–200 MB de runtime en el servicio
  gratuito y arriesga el despliegue que sostiene toda la demo.
- **Human 1024 (`faceres`)**: es el más cómodo porque funciona hoy, pero no tiene benchmarks y obliga a
  `vector(1024)`. Peor: si la app acabara usando ArcFace, web y app no serían compatibles y el usuario
  registrado en una no podría entrar en la otra.
- **Servicio gestionado (Azure Face, AWS, Google)**: cuentas, tarjetas y cuotas, y una dependencia de un
  tercero en la demo. Choca con «gratis 100 %».
- **Admin API de Supabase para emitir la sesión**: obliga a `service_role` y a un ida y vuelta extra
  (`generate_link` → `verifyOtp`). Hoy el único consumidor del token es nuestra API, así que no compensa.

## Consecuencias

- **El coste del alineado se evita en su mayor parte.** Human ya da detección y puntos faciales: solo hay
  que recortar, deformar a 112×112 con los 5 puntos de referencia de ArcFace y pasar el ONNX. Estimación:
  ~1 día en la web. En la app, si reutiliza la web en un webview, cero.
- **La web deja de tener facial hasta ese cambio.** Las plantillas de `localStorage` no valen: hay que
  volver a registrarse. Y está bien, porque esas plantillas eran falsificables.
- **El vector se puede reutilizar entre modelos sin dar falsos negativos**: la columna `modelo` lo
  detecta y la verificación devuelve `modelo_distinto` en vez de decir «no eres tú».
- **Seguridad aceptada y declarada**: el vector lo calcula el cliente, así que alguien puede saltarse la
  cámara y reenviar uno capturado. Mitigación: TLS, que el vector solo sirva junto al email y que el
  facial sea **alternativa** a la contraseña, nunca el único factor.
- **El umbral es dato, no código**: una fila en `config_cara`. Se mide con ~10 intentos propios y ~10
  ajenos, y se pone entre el máximo ajeno y el mínimo propio, con margen.
- **La migración no depende del esquema de Marina**: `embeddings_faciales.usuario_id` apunta a
  `auth.users`, no a `perfiles`. El rol `admin` del `reset` se lee de `app_metadata`, que es de donde ya
  lo lee `SupabaseJwtGuard`. [[modelo-datos]] §3.2 recoge ese cambio.
- **Sin refresco de token**: el JWT facial dura 12 h y después hay que volver a mirar a la cámara. No hay
  `refresh_token` porque no lo emite Supabase Auth. Tampoco se puede revocar un token suelto.

## Pendiente

- **Alex**: OK a cambiar `description` de Human por ArcFace en la web (es su área), y decidir si la app
  reutiliza la web en webview o monta el modelo nativo.
- **Kevin**: borrar `backend/face-service/` y su `Dockerfile`, y su línea en `CODEOWNERS`.
- **Marina**: aplicar la migración en el proyecto de Supabase cuando lo cree (el facial no funciona sin
  ella) y confirmar si el proyecto firma los JWT con HS256 o con claves asimétricas.
- **Rubén**: medir el umbral con una ejecución real y ajustar `config_cara`. Añadir `admin` al tipo
  `Rol` y a `leerRol` de `SupabaseJwtGuard` (hoy solo conoce `viajero` y `revisor`): sin eso,
  `resetear_cara` rechaza a todo el mundo con `RF006`, porque nadie lleva ese rol en `app_metadata`.

## Ficheros

- `backend/database/supabase/migrations/20261028120000_reconocimiento_facial.sql`
- [[endpoints]]: `POST /auth/cara/registrar`, `POST /auth/cara/verificar` y `POST /auth/cara/reset`
- Este ADR
