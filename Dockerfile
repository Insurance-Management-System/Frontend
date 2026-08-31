# Stage 1: build the static production bundle
# Vite reads VITE_* variables from .env at build time and bakes them into the JS - this is
# why they can't be changed at container start like a backend service's env vars can.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve the built files with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
