# Placeholder (Kevin). Funcionará cuando exista el proyecto NestJS.
FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
EXPOSE 3000
CMD ["node", "dist/main.js"]
