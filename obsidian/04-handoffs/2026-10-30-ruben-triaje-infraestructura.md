---
fecha: 2026-10-30
autor: Rubén
area: vault
para: Alex, Marina, Kevin
rama: docs/vault-handoffs-y-objetivo-infra
pr: "#101"
tags: [handoff, vault, infraestructura, triaje]
estado: abierto
---

# Handoff — Triaje de handoffs y objetivo de infraestructura

## Qué se hizo

- Se revisaron los 52 handoffs del vault y se creó [[handoffs-pendientes]] con estado, pendientes,
  responsables y respuestas basadas en el código, el contrato y el historial Git.
- Se dejó explícito que la base de datos y la API dockerizadas en el servidor son el destino final.
  Supabase Cloud y Render quedan como entornos transitorios hasta validar el servidor.
- Se documentó el bloqueo actual de apertura de puertos por el administrador.
- El chatbot pasó a estar dentro del sprint por margen de tiempo.
- Se marcó como obsoleto el ADR duplicado `ADR-009-despliegue-servidor`; el ADR vigente es
  [[ADR-009-supabase-self-hosted-en-servidor]].

## Qué queda

- Obtener la confirmación de red del administrador antes de la congelación del 04/11.
- Construir y levantar el stack en el servidor, validar migraciones, catálogo, API, Auth, Realtime y
  restauración de backups.
- Resolver las decisiones abiertas enumeradas en [[handoffs-pendientes]].

## Bloqueos / preguntas para otros

- El servidor sigue bloqueado por puertos, proxy/TLS, DNS y permisos externos.
- No se ha ejecutado `up --build` en el servidor desde este entorno.
- El QR actual usa HMAC-SHA256; el contrato histórico menciona Ed25519 y Rubén debe decidir la
  alineación antes del 04/11.

## Cambios en contratos

Ninguno. Solo se actualizaron notas de estado, decisiones, áreas y handoffs.

## Ficheros tocados

- `obsidian/01-estado/handoffs-pendientes.md`
- `obsidian/01-estado/sprint-actual.md`
- `obsidian/01-estado/estado-equipo.md`
- `obsidian/03-decisiones/ADR-009-supabase-self-hosted-en-servidor.md`
- `obsidian/03-decisiones/ADR-009-despliegue-servidor.md`
- `obsidian/05-areas/infraestructura-servidor.md`
- `obsidian/05-areas/supabase-nube.md`
- `obsidian/04-handoffs/*.md` (estado documental)
- Este handoff
