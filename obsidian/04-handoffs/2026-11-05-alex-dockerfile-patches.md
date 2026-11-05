---
fecha: 2026-11-05
autor: Alex
area: devops
para: todos
rama: fix/infra-dockerfile-patches
pr:
tags: [handoff]
---

# Handoff — Imágenes Docker no construían por `patches/`

## Qué se hizo
- `pnpm install --frozen-lockfile` fallaba en el build de la API con `ENOENT ... /repo/patches/onnxruntime-react-native@1.24.3.patch`. El `package.json` raíz declara `patchedDependencies` y pnpm lee el parche aunque `--filter @renfe/api` no lo instale.
- Añadido `COPY patches patches` en `backend/api/Dockerfile` y `backend/gtfs-worker/Dockerfile`. Las dos imágenes construyen y la API arranca en :3000.

## Qué queda
- Chatbot en Docker: responde 503 porque `GEMINI_API_KEY` está vacía en `.env`. No es un fallo de código: cada uno pone su clave en su `.env` (el compose ya lo carga con `env_file`).

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `backend/api/Dockerfile`
- `backend/gtfs-worker/Dockerfile`
