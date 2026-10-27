---
fecha: 2026-10-27
autor: Alex
area: vault
para: todos
rama: docs/vault-plan-entrega
pr: (ver PR de esta rama)
tags: [handoff, sprint]
---

# Handoff — Plan de entrega del 6/11

## Qué se hizo
- La entrega es el **06/11/2026**. Nuevo [[sprint-actual]] con alcance recortado, plan por persona y día, plan B y guion de la demo.
- [[estado-equipo]]: hito de entrega y bloqueo global (CI y despliegue de la API).
- `05-areas/frontend.md` puesto al día.
- Mergeado #28 (web alineada con el contrato y fallos visuales).

## Qué queda
- **Marina:** migración solo de `gtfs_*` e import del GTFS AVE/LD (28–29/10); Supabase en la nube con datos (hasta el 1/11).
- **Rubén:** `/estaciones` y `/trenes` contra Supabase (hasta el 1/11); `/posiciones` con GTFS-RT en memoria, sin worker (2–3/11).
- **Kevin:** CI con lint y test y cuenta de Render (28–29/10); API desplegada en Render (hasta el 1/11). Stripe solo si sobra tiempo.
- **Alex:** conectar la web a la API real desde el 30/10.

## Bloqueos / preguntas para otros
- **Congelación de código el 4/11.** Lo que no esté el 3/11 se presenta simulado (plan B en [[sprint-actual]]).
- Lo que no está en el alcance de [[sprint-actual]] no se empieza.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `obsidian/01-estado/sprint-actual.md`, `obsidian/01-estado/estado-equipo.md`, `obsidian/05-areas/frontend.md`, este handoff.
