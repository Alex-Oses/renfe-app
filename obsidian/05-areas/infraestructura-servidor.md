---
responsable: Rubén
estado: bloqueado-por-red
actualizado: 2026-10-29
tags: [infra, docker, supabase, despliegue]
---

# Infraestructura del servidor asignado

## Veredicto

El destino final obligatorio es la base de datos y la API dockerizadas en el servidor asignado. La
API NestJS y el stack completo de Supabase se pueden ejecutar allí, con ajustes en los Dockerfile,
Compose y puertos. El acceso web desde fuera todavía no está disponible: el bloqueo actual es que el
administrador debe confirmar la apertura de puertos y autorizar nginx/TLS y DNS.

**29/10:** los ficheros del despliegue ya están escritos y `docker compose config` valida. **No se ha
construido ninguna imagen ni se ha levantado nada**: en el portátil de desarrollo no hay daemon de
Docker. Decisión en [[ADR-009-supabase-self-hosted-en-servidor]] y runbook en
[`deploy/README.md`](../../deploy/README.md).

Supabase Cloud y Render son entornos transitorios. Se mantienen para desarrollo, staging y plan B
hasta validar el servidor de extremo a extremo; después se retiran como destinos operativos.

## Estado comprobado

| Área | Resultado |
|---|---|
| Docker | Accesible para el usuario actual, sin elevar privilegios |
| API | Dockerizable con ajustes menores |
| Supabase | Necesario el stack completo, no PostgreSQL puro |
| Worker GTFS | El Dockerfile no coincide con la entrada real; debe modelarse como job/cron |
| Puertos | El host tiene ocupado el 3000 y los puertos por defecto de Supabase |
| Persistencia | Hay volumen Docker bajo `/` y unos 90 GB libres; no usar `/mnt` temporal |
| Acceso externo | No disponible hoy: 80/443 responden con timeout desde fuera |
| Salida a Renfe | Funciona por HTTPS |

## Dependencias de Supabase

Las migraciones requieren:

- `auth.users` y `auth.uid()`.
- Roles `anon`, `authenticated` y `service_role`.
- `pgvector`.
- PostgreSQL 17 según `backend/database/supabase/config.toml`.
- Auth y, si entra en alcance, Realtime.

Por tanto, el despliegue natural es **Supabase self-hosted** mediante Docker. Como alternativa mínima,
`deploy/postgres/00-compat-supabase.sql` crea esos cuatro elementos sobre un `pgvector` pelado, y las
migraciones se aplican sin tocar una línea. Lo que **no** da el sustituto es Supabase Auth: sin él no
hay login por contraseña hasta que existan `POST /auth/registro` y `POST /auth/login`.

## Cambios necesarios antes de desplegar

| # | Cambio | Estado |
|---|---|---|
| 1 | Definir cómo se ejecuta el stack de Supabase | ✅ destino decidido: self-hosted en Docker; la variante Postgres + `pgvector` queda solo como contingencia documentada en [[ADR-009-supabase-self-hosted-en-servidor]] |
| 2 | Contexto de build de la API con el `pnpm-lock.yaml` de la raíz | ✅ `backend/api/Dockerfile`, contexto `.` |
| 3 | Puerto publicado de la API (el 3000 del host está ocupado) | ✅ `API_PUBLICO`, por defecto `3010`, solo en `127.0.0.1` |
| 4 | Dockerfile del worker: `tsc --noEmit` no genera `dist/` | ✅ corre con `tsx`; el worker es un job |
| 5 | Worker como job/cron, no servicio residente | ✅ perfil `tools`: `docker compose run --rm gtfs-worker` |
| 6 | Remapear los puertos de Supabase ocupados | ⬜ pendiente de saber quién los ocupa |
| 7 | Volúmenes, healthchecks, reinicio, `.dockerignore` | ✅ hecho, salvo **usuario no root** y rotación de logs |
| 8 | Backups y probar una restauración | ⬜ hay `pg_dump` documentado, no hay cron ni restauración probada |
| 9 | Construir las imágenes en el servidor | ⬜ sin daemon de Docker en el portátil: el primer `up --build` real es en el servidor |

## El puerto: qué hace falta de verdad

Solo hace falta **un puerto de entrada**, y solo para la última milla (navegador → API). La API → BD
es tráfico interno de Docker y no necesita nada.

- **No hace falta el 80.** El certificado se saca con el reto DNS-01 de Let's Encrypt (un registro
  TXT). El 80 solo lo pide HTTP-01.
- Si no se puede abrir **ningún** puerto de entrada: **Cloudflare Tunnel**, que solo necesita salida
  al 443 y no toca el firewall.
- **Postgres no se expone nunca.** Si algún día se abre algo, se abre nginx, no el 5432.

## Bloqueos externos

El administrador debe confirmar:

- Apertura de 80/443 en el NSG de Azure o autorización para un túnel saliente.
- Permiso para configurar nginx y TLS.
- Dominio y DNS; actualmente solo consta el nombre `*.cloudapp.azure.com`.
- Propietarios de los puertos de Supabase ocupados.
- Disco persistente y destino de backups.

No se ha cambiado firewall, nginx, DNS, permisos ni servicios del servidor.

## Sustitución de Render

La API Dockerizada del servidor sustituirá a Render cuando el administrador habilite el acceso y se
complete la validación. Vercel solo necesitará apuntar `VITE_API_URL` a la URL HTTPS pública de la
API. Hasta entonces, Render y Supabase Cloud son transitorios y funcionan como staging o plan B.

El software puede ejecutarse sin licencias adicionales, pero no se puede afirmar que el hosting sea
gratuito: hay que confirmar quién cubre servidor, IP, dominio, tráfico, almacenamiento y backups.
