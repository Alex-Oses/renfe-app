# API NestJS. Se construye desde la raíz del monorepo (usa el pnpm-lock.yaml común):
#   docker build -f backend/api/Dockerfile -t renfe-api .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @renfe/api... \
 && pnpm --filter @renfe/api build \
 && pnpm --filter @renfe/api deploy --prod /out \
 && cp -r backend/api/dist /out/dist

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out .
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
