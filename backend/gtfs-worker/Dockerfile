# Placeholder (Kevin). Funcionará cuando exista el código del worker.
FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
CMD ["node", "dist/index.js"]
