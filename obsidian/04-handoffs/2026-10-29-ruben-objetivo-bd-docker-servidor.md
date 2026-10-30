---
fecha: 2026-10-29
autor: Rubén
area: database
para: Marina, Kevin, Alex
rama: feat/api-chatbot
pr: pendiente
tags: [handoff, supabase, docker, despliegue, database]
---

# Handoff — objetivo final de base de datos en Docker

## Qué se hizo

- Se confirmó en la bóveda que Supabase Cloud está operativa, con cuatro migraciones aplicadas y el
  catálogo AV/LD cargado y verificado.
- Se registró la decisión [[ADR-009-supabase-self-hosted-en-servidor]]: la base de datos final debe
  ser Supabase self-hosted en Docker en el servidor asignado.
- Supabase Cloud queda como entorno transitorio para continuar el desarrollo mientras el
  administrador abre el acceso externo al servidor.

## Qué queda

- Confirmar con el administrador la apertura de puertos y la configuración autorizada de proxy/TLS.
- Preparar el despliegue persistente de Supabase self-hosted en Docker en el servidor.
- Aplicar las migraciones versionadas, importar el catálogo y validar la API, Auth, pgvector y
  Realtime contra el servidor antes de retirar Cloud o Render.
- Mantener separadas las variables y credenciales de Cloud, Render y Docker.

## Bloqueos / preguntas para otros

- El cambio al entorno final está bloqueado hasta que el administrador abra el puerto y autorice la
  configuración de red.
- No se deben publicar contraseñas, claves JWT ni claves de Gemini en la bóveda.

## Cambios en contratos

Ninguno. La decisión de infraestructura está documentada en [[ADR-009-supabase-self-hosted-en-servidor]].

## Ficheros tocados

- `obsidian/03-decisiones/ADR-009-supabase-self-hosted-en-servidor.md`
- `obsidian/05-areas/supabase-nube.md`
- `obsidian/05-areas/base-datos.md`
- `obsidian/01-estado/estado-equipo.md`
- Este handoff
