---
fecha: 2026-10-29
estado: aceptado
autor: Rubén
tags: [adr, database, docker, supabase, despliegue]
---

# ADR-009 — Supabase self-hosted en Docker como base de datos final

## Contexto

Supabase Cloud ya está creada, tiene las migraciones aplicadas y contiene el catálogo AV/LD
validado. Sin embargo, el objetivo final del proyecto es alojar la base de datos en el servidor
asignado, mediante Docker, para no depender de Supabase Cloud en producción.

El acceso externo al servidor todavía depende de que el administrador abra los puertos necesarios
y autorice la configuración de proxy y TLS. Mientras tanto, necesitamos un entorno compartido que
permita continuar con la API y la demostración.

## Decisión

- **Entorno final:** Supabase self-hosted en Docker en el servidor asignado, incluyendo PostgreSQL,
  Auth, API, Realtime, Studio y los servicios necesarios para mantener la compatibilidad con el
  código actual.
- **Entorno transitorio:** Supabase Cloud, usando el session pooler, hasta que el administrador
  habilite el acceso al servidor y se complete la migración.
- **Desarrollo local:** Supabase local mediante la CLI y Docker, sin considerarlo el entorno final.
- La migración al servidor se hará aplicando las migraciones versionadas y cargando de nuevo el
  catálogo GTFS; no se copiarán secretos en Git ni en la bóveda.
- Render seguirá siendo el despliegue temporal de la API hasta que se valide la API en el servidor.

## Alternativas descartadas

- **Mantener Supabase Cloud como producción definitiva:** no cumple el objetivo de alojar la base
  de datos en el servidor propio.
- **Usar PostgreSQL puro sin Supabase:** se perderían Auth, RLS, pgvector, Realtime y la
  compatibilidad con las migraciones y servicios actuales.
- **Exponer PostgreSQL directamente a Internet:** aumenta la superficie de ataque; el acceso deberá
  hacerse mediante la API y la configuración aprobada por el administrador.

## Consecuencias

- Hay que preparar un despliegue reproducible de Supabase self-hosted, almacenamiento persistente,
  copias de seguridad y un plan de actualización.
- La migración queda bloqueada hasta que el administrador confirme puertos, proxy/TLS y permisos.
- Durante la transición habrá que mantener las variables de conexión separadas por entorno y probar
  `/health`, `/estaciones`, `/trenes` y Auth contra el servidor antes de retirar Cloud o Render.
