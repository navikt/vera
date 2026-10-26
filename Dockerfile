# syntax=docker/dockerfile:1

ARG NODE_DEV_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-dev
ARG NODE_RUNTIME_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim

FROM ${NODE_DEV_IMAGE} AS base
USER root
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json ./
RUN npm install -g "$(node -p "require('./package.json').packageManager")"

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS tester
RUN apk add --no-cache curl libcrypto3 libssl3 libstdc++
# MongoDB has no Wolfi download; use a glibc binary compatible with OpenSSL 3.
ENV MONGOMS_DISTRO=ubuntu-22.04
COPY . .
RUN pnpm run test && touch /tmp/tests-passed

FROM dependencies AS builder
COPY . .
# Keep tests mandatory without copying test-only dependencies into the builder.
COPY --from=tester /tmp/tests-passed /tmp/tests-passed
RUN pnpm run build && mkdir -p .next/cache

FROM ${NODE_RUNTIME_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

USER node
EXPOSE 3000
ENTRYPOINT ["/usr/bin/node"]
CMD ["server.js"]
