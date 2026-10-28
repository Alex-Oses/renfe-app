---
fecha: 2026-10-28
autor: Rubén
area: devops
para: Kevin, Marina, Alex
rama: docs/vault-infraestructura-servidor
pr: pendiente de abrir
tags: [handoff, infra, docker, supabase]
---

# Handoff — Auditoría de infraestructura del servidor

## Qué se hizo

- Se documentó la evaluación de solo lectura realizada en el servidor asignado.
- Docker es accesible para el usuario actual y hay recursos disponibles, con unos 90 GB libres bajo
  `/`; no se debe usar `/mnt`, que es temporal en Azure.
- La API NestJS es dockerizable con ajustes menores.
- La base de datos debe desplegarse como Supabase completo self-hosted, no como PostgreSQL puro:
  las migraciones dependen de `auth.users`, `auth.uid()`, roles de Supabase y `pgvector`.
- Se confirmó que la salida HTTPS hacia los feeds de Renfe funciona.
- Se detectó que el worker no puede arrancar con su Dockerfile actual: `tsc --noEmit` no genera
  `dist/` y no existe `src/index.ts`.
- Se comprobó que el host tiene ocupado el puerto 3000 y los puertos por defecto de Supabase.
- Se comprobó que 80/443 están cerrados desde fuera; no se intentó modificar NSG, firewall, nginx,
  DNS, TLS ni permisos.

## Qué queda

- Adaptar Dockerfile y Compose.
- Decidir cómo ejecutar el stack Supabase self-hosted y remapear puertos sin interferir con servicios
  existentes.
- Configurar persistencia, healthchecks, reinicios, logs y backups.
- Cuando el administrador habilite acceso externo, configurar nginx/TLS y verificar desde otra red.
- Cambiar Vercel para apuntar a la URL pública de la API y retirar Render solo después de validar.

## Bloqueos / preguntas para otros

- **Kevin/administrador:** abrir 80/443 en el NSG o autorizar un túnel saliente; permitir configurar
  nginx y TLS.
- **Administrador:** indicar qué servicios ocupan 54321, 54322, 54323, 54324, 54327 y 8083, y si se
  pueden reasignar.
- **Equipo:** confirmar dominio/DNS y destino de backups.
- El coste de hosting no está determinado: el software puede ser gratuito, pero servidor, IP,
  dominio, tráfico, almacenamiento y backups dependen del proveedor del servidor.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `obsidian/01-estado/estado-equipo.md`
- `obsidian/05-areas/infraestructura-servidor.md`
- `obsidian/04-handoffs/2026-10-28-ruben-infraestructura-servidor.md`
