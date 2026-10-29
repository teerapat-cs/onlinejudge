# syntax=docker/dockerfile:1
#
# Ships the Expo app as a static web build behind nginx, so the same repository
# can run as a container on Railway next to the API and PostgreSQL.
# Railway builds this file with the service root directory set to `app/frontend`
# (see `railway.json` and `../DEPLOY_RAILWAY.md`).

############################
# 1. Export the web bundle
############################
FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV CI=1 \
    EXPO_NO_TELEMETRY=1

# Install from the lockfile only, so cached layers stay valid until deps change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# `EXPO_PUBLIC_*` values are inlined into the JS bundle while exporting, so the
# API URL has to be known at build time. Railway only exposes service variables
# to a Docker build when they are declared with ARG.
ARG EXPO_PUBLIC_API_URL=http://localhost:5150
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npx expo export --platform web --output-dir dist

############################
# 2. Serve the static bundle
############################
FROM nginx:1.29-alpine AS runtime

# The nginx entrypoint renders every `*.template` in /etc/nginx/templates with
# envsubst, which is how PORT from the environment reaches the config.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080

EXPOSE 8080
