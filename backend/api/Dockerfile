# API NestJS. El contexto de build es la RAÍZ del monorepo, no esta carpeta:
# pnpm necesita el lockfile y los manifiestos del workspace para instalar.
#   docker build -f backend/api/Dockerfile .
# Normalmente no se llama a mano: `docker compose up -d` (ver deploy/README.md).

FROM node:22-alpine

RUN corepack enable
WORKDIR /repo

# Manifiestos primero: si no cambian, esta capa se reutiliza y el install no
# se repite. `--filter` instala solo las dependencias de la API (no Expo).
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/api/package.json backend/api/
COPY backend/gtfs-worker/package.json backend/gtfs-worker/
RUN pnpm install --frozen-lockfile --filter @renfe/api --prod=false

COPY backend/api backend/api
RUN pnpm --filter @renfe/api build

# NODE_ENV va después del install a propósito: con NODE_ENV=production pnpm se
# salta las devDependencies y sin @nestjs/cli no hay `nest build`.
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "backend/api/dist/main.js"]
