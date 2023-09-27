#FROM library/node:20 AS base_dependencies
#
#WORKDIR /src
#COPY package.json yarn.lock ./
#
## Install production requirements only
#RUN yarn install --frozen-lockfile --prod
#
#FROM library/node:20 AS frontend_builder
#
#WORKDIR /app/static
#
#COPY package.json yarn.lock ./
#
## Install the dev dependencies, too
#RUN yarn install --frozen-lockfile
#
#COPY gulpfile.mjs server.js app.jsx ./
#COPY frontend ./frontend
#
#RUN yarn gulp test && yarn gulp dist
#
#
#FROM library/node:20-alpine AS server
#RUN apk add --no-cache bash
#
#WORKDIR /src
#
#COPY --from=base_dependencies /src/node_modules /src/node_modules
#COPY --from=frontend_builder /app/static/frontend/build /src/frontend/build
#
#COPY package.json yarn.lock docker_vera_startup.sh server.js ./
#COPY backend ./backend
#
#EXPOSE 8080
#ENV NODE_ENV=production
#CMD ["node", "server.js"]
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile  


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]