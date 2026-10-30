# Importador GTFS. El contexto de build es la RAÍZ del monorepo, no esta
# carpeta (ver deploy/README.md).
#
# Es un **job**, no un servidor: no tiene puerto ni se queda corriendo.
#   docker compose run --rm gtfs-worker                       # importar avld
#   docker compose run --rm gtfs-worker ./node_modules/.bin/tsx src/verificar.ts

# node:22-slim y no alpine: `tsx` arrastra esbuild, que trae un binario nativo.
# Con glibc no hay que acertar la variante musl.
FROM node:22-slim

RUN corepack enable
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/api/package.json backend/api/
COPY backend/gtfs-worker/package.json backend/gtfs-worker/
# tsx es devDependency y aquí sí hace falta en ejecución: el `build` del worker
# es `tsc --noEmit`, no genera dist.
RUN pnpm install --frozen-lockfile --filter @renfe/gtfs-worker --prod=false

COPY backend/gtfs-worker backend/gtfs-worker

WORKDIR /repo/backend/gtfs-worker
CMD ["./node_modules/.bin/tsx", "src/importar.ts"]
