---
fecha: 2026-10-27
autor: Alex
area: vault
para: todos
rama: docs/vault-reescritura-y-vercel
pr: (ver PR de esta rama)
tags: [handoff, git, vercel]
estado: cerrado
---

# Handoff — Historial reescrito, web local subida y Vercel

## ⚠️ Lo que tiene que hacer TODO el equipo
- **El historial de GitHub se reescribió el 27/10** (`git filter-repo`, solo cambian mensajes de commit; el código es el mismo). Todos los SHA son nuevos.
- **Borrad vuestra carpeta del repo y clonad de nuevo.** No hagáis `git pull` ni `git push` desde una copia anterior: volvería a subir el historial viejo.
- Si teníais cambios sin subir, copiadlos a otra carpeta antes de borrar y pegadlos en el clon nuevo **fichero a fichero o con un diff**, nunca copiando la carpeta entera encima (ver abajo).
- **Rubén:** tus ramas `feat/api-estaciones`, `feat/api-busqueda-trenes` y `feat/api-posiciones` ya están reescritas en GitHub con tu código intacto: clona y haz `git checkout` de la que toque.

## Qué se hizo
- Reescrito el historial de todas las ramas para quitar las líneas de coautoría automáticas. GitHub puede tardar horas en actualizar la lista de contribuidores; los PRs ya cerrados siguen enlazando a los commits antiguos (no se puede borrar).
- Subida la web local de Alex (#37): menú completo, idiomas, avisos, "Mis líneas", cartera y tarifas. Llevada a `main` (#38).
- **Lección:** copiar `frontend/web` local con `robocopy` encima del clon nuevo borró lo que solo estaba en GitHub (cristal líquido #34, contrato y arreglos #28). Se recuperó con *cherry-pick*. Para no repetirlo: trabajar siempre en el clon de GitHub y hacer `git pull` en `develop` antes de empezar.

## Qué queda
- **Alex:** volver a activar la protección de `main` y `develop` (Settings → Branches, quitar "Allow force pushes"). Ahora mismo los PRs se mergean sin esperar a la CI.
- **Alex:** trabajar solo en `C:\Users\aleeex_PC\renfe-app-nuevo` y borrar la carpeta vieja `renfe-app`.
- **Vercel no publica `main` en producción solo.** Tras cada merge a `main`: Vercel → Deployments → el más reciente de `main` → ⋯ → **Promote to Production**, y abrir la web con `Ctrl + F5`. Pendiente averiguar qué rama tiene configurada como producción (en esta versión de Vercel no aparece en Settings → Git).

## Bloqueos / preguntas para otros
- Quien tenga acceso a Vercel y sepa dónde está "Production Branch", que lo ponga en `main`.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- Este handoff, `obsidian/01-estado/estado-equipo.md` (fila de Alex y bloqueos globales).
