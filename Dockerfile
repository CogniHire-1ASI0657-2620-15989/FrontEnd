# Build the Vue application. Vite variables are embedded at build time.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src

ARG VITE_USE_MOCK=true
ARG VITE_API_URL=/api
ENV VITE_USE_MOCK=${VITE_USE_MOCK}
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Serve only the compiled assets. The official entrypoint renders nginx templates.
FROM nginx:stable-alpine AS runtime

ENV PORT=10000

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
