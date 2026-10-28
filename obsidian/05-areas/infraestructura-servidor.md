---
responsable: Rubén
estado: viable-con-condiciones
actualizado: 2026-10-28
tags: [infra, docker, supabase, despliegue]
---

# Infraestructura del servidor asignado

## Veredicto

La API NestJS y el stack completo de Supabase se pueden ejecutar en Docker en el servidor, con
ajustes en los Dockerfile, Compose y puertos. El acceso web desde fuera todavía no está disponible:
los puertos 80/443 están cerrados y su apertura, nginx/TLS y el DNS dependen del administrador.

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

Por tanto, el despliegue compatible es Supabase self-hosted mediante Docker, no un contenedor
PostgreSQL aislado.

## Cambios necesarios antes de desplegar

1. Añadir el servicio de Supabase self-hosted o definir claramente cómo se ejecutará su stack.
2. Corregir el contexto de build de la API para incluir el `pnpm-lock.yaml` de la raíz.
3. Cambiar el puerto publicado de la API, porque el 3000 del host está ocupado.
4. Corregir el Dockerfile del worker: `tsc --noEmit` no genera `dist/` y no existe `src/index.ts`.
5. Ejecutar el worker como job/cron de importación, no como servicio residente.
6. Remapear los puertos locales de Supabase ocupados (54321, 54322, 54323, 54324, 54327 y 8083),
   después de identificar sus servicios propietarios.
7. Añadir volúmenes persistentes, healthchecks, reinicio, usuario no root, `.dockerignore` y
   rotación de logs.
8. Preparar backups y probar una restauración.

## Bloqueos externos

El administrador debe confirmar:

- Apertura de 80/443 en el NSG de Azure o autorización para un túnel saliente.
- Permiso para configurar nginx y TLS.
- Dominio y DNS; actualmente solo consta el nombre `*.cloudapp.azure.com`.
- Propietarios de los puertos de Supabase ocupados.
- Disco persistente y destino de backups.

No se ha cambiado firewall, nginx, DNS, permisos ni servicios del servidor.

## Sustitución de Render

Es viable sustituir Render por la API Dockerizada en este servidor. Vercel solo necesitaría apuntar
`VITE_API_URL` a la URL HTTPS pública de la API. Render puede mantenerse como staging o plan B.

El software puede ejecutarse sin licencias adicionales, pero no se puede afirmar que el hosting sea
gratuito: hay que confirmar quién cubre servidor, IP, dominio, tráfico, almacenamiento y backups.
