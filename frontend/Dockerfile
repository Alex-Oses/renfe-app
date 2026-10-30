# Web (Vite) o app Expo exportada a web, servidas con nginx. Se construye desde la raíz del monorepo:
#   docker build -f frontend/Dockerfile --build-arg APP=web -t renfe-web .
# Las variables públicas se fijan al compilar: cambiar API_URL obliga a reconstruir (--build).
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
ARG APP=web
ARG API_URL=http://localhost:3000
ARG WEB_URL=http://localhost:5173
ENV VITE_API_URL=$API_URL \
    EXPO_PUBLIC_API_URL=$API_URL \
    EXPO_PUBLIC_POSICIONES_URL=$API_URL \
    EXPO_PUBLIC_WEB_URL=$WEB_URL
RUN pnpm install --frozen-lockfile --filter "@renfe/$APP..." \
 && if [ "$APP" = mobile ]; then pnpm --filter @renfe/mobile exec expo export -p web; \
    else pnpm --filter @renfe/web exec vite build; fi

FROM nginx:alpine
ARG APP=web
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend/$APP/dist /usr/share/nginx/html
