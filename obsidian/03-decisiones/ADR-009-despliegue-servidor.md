---
fecha: 2026-10-30
estado: obsoleto
autor: Rubén
tags: [adr, infra, docker, despliegue]
---

# ADR-009 — Despliegue en el servidor asignado (opción A)

> ADR obsoleto: el destino final y la transición están consolidados en
> [[ADR-009-supabase-self-hosted-en-servidor]]. No borrar este registro histórico.

## Contexto

Hay un servidor asignado con Docker disponible para el usuario actual, ~90 GB libres en `/` y salida
a internet por HTTPS. La auditoría del 28/10 ([[infraestructura-servidor]]) dice que la API y el stack
de Supabase caben en esa máquina, y que los puertos 80/443 están cerrados desde fuera.

Hoy la API vive en Render y la base de datos en Supabase Cloud ([[supabase-nube]]). Render en plan
`free` duerme por inactividad y el proyecto de Supabase gratuito se pausa si no hay actividad. El
equipo pide que el despliegue sea en el servidor: «si podemos conectarnos a nuestro docker desde
fuera, adiós Render».

## Decisión

**Opción A: base de datos y API en el servidor, con Docker Compose.** Una sola máquina, un único
puerto de entrada.

- La **base de datos no se publica nunca**. Vive en la red interna de Docker (`db:5432`) y solo la
  alcanza la API.
- La **API escucha en `127.0.0.1`** del host. Delante va nginx con TLS, o un túnel de Cloudflare.
- El único puerto que hay que negociar con el administrador es **uno de entrada** (443, o uno alto
  como 8443). **El 80 no hace falta**: el certificado se saca por el reto DNS-01 de Let's Encrypt.
- Render y Supabase Cloud se quedan **como paracaídas** hasta que la opción A esté en verde. No es
  trabajo duplicado: mismo esquema, mismo importador, y cambiar de una a otra es cambiar
  `DATABASE_URL`.

Ficheros: `docker-compose.yml`, `backend/api/Dockerfile`, `backend/gtfs-worker/Dockerfile`,
`.dockerignore`, `deploy/`. Runbook en [`deploy/README.md`](../../deploy/README.md).

### Dos variantes de base de datos

| Variante | Qué es | Cuándo |
|---|---|---|
| **Supabase self-hosted** | El stack completo (`supabase start`) en la máquina | Si Marina ya lo tiene levantado. Trae `auth.users`, Supabase Auth y `pgvector` |
| **Postgres pelado + `pgvector`** | El servicio `db` del compose, con `deploy/postgres/00-compat-supabase.sql` | Si no hay Supabase en el servidor. Es lo mínimo para que las migraciones se apliquen tal cual |

La segunda variante **no tiene Supabase Auth**: solo crea `auth.users (id, email)` y `auth.uid()`, que
es lo único que tocan las migraciones y la API. Consecuencia: no hay login por contraseña hasta que
existan `POST /auth/registro` y `POST /auth/login` en la API, porque nadie va a crear filas en
`auth.users`. El login facial depende de esas filas (`embeddings_faciales` va a `perfiles`).

## Alternativas descartadas

- **BD en el servidor y API en Render.** Obliga a exponer Postgres a internet o a montar un túnel, con
  un salto de red por consulta. Es la peor de las tres: más superficie de ataque y más latencia.
- **Seguir solo con Render + Supabase Cloud.** Cero mantenimiento, pero no es lo que pide el equipo y
  deja la demo a merced de que el plan gratuito no esté dormido.
- **Exponer Postgres con un puerto público.** Un `5432` abierto a internet es fuerza bruta garantizada
  y no hace falta para nada: la API está en la misma máquina.
- **Cloudflare Tunnel como plan principal.** Es la salida si el administrador no puede abrir nada,
  pero añade una dependencia externa (dominio en Cloudflare) que no hace falta si hay puerto.

## Consecuencias

- **El servidor no puede estar en el camino crítico de la entrega del 6/11.** El puerto depende de un
  administrador externo. Mientras no esté, la demo va con Render + Cloud, que ya funciona.
- **Los puertos del host están ocupados.** La auditoría vio el 3000 y los de Supabase (54321–54327,
  8083). Por eso la API publica en `3010` (`API_PUBLICO`) y no en el 3000.
- **Backups manuales.** No hay `pg_dump` programado. Está el comando en el runbook, nada más.
- **Una máquina, un punto de fallo.** BD y API caen juntas. Para un proyecto académico es aceptable;
  para producción real no.
- **La BD del servidor no está documentada.** El vault solo describe Supabase Cloud. Hasta que Marina
  escriba qué contenedores hay, en qué puerto escuchan y con qué feed, la «principal» no la puede
  reproducir nadie más.
- **Nada de esto se ha ejecutado todavía.** En el portátil de desarrollo no hay daemon de Docker: los
  Dockerfile están escritos y `docker compose config` valida, pero el primer `up --build` real es en
  el servidor.
