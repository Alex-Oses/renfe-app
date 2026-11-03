---
fecha: 2026-11-03
autor: Alex
area: infra
para: todos
rama: chore/infra-sincronizar-main-en-develop
pr: 126
tags: [handoff, release, vercel]
---

# Handoff — develop pasa a main (#113–#125)

## Qué se hizo

- **PR #126 `develop → main`** con merge commit (`df74ab1`). Entra todo lo de #113 a #125:
  app móvil al nivel de la web, búsqueda por ciudad, responsive táctil, estaciones
  recordadas y el tren de vuelta en la portada con fotos de Cercanías.
- **#126 estaba en conflicto** porque el release #122 entró en `main` con *squash* y
  `develop` no tenía ese commit. `main` tenía el mismo árbol que `develop` en #124
  (`ceebd4d`), así que el PR #127 une las historias con un merge `-s ours` sin cambiar
  ningún archivo.
- Los dos se mergearon con `--admin` porque Marina no estaba para revisar.
- CI `ok` en verde en `main` y Vercel marca *Deployment has completed*.

## Para el equipo

- Los releases a `main` van con **merge commit, nunca squash**. Si no, el siguiente
  `develop → main` vuelve a chocar.
- Marina: los dos PRs entraron sin tus aprobaciones. Si quieres, revísalos a posteriori.

## Sin comprobar

- Si hace falta *Promote to Production* en Vercel o el deploy de `main` ya es producción.
- La web publicada en un móvil real.
