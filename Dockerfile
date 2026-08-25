ARG NODE_VERSION=26-alpine
ARG NODE_VERSION_TEST=26-bookworm-slim

# ============================================
# Stage 1: Run tests (Debian — needed for MongoMemoryServer)
# ============================================
FROM node:${NODE_VERSION_TEST} AS tester
RUN apt-get update && apt-get install -y --no-install-recommends libcurl4 libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
# Install all dependencies (including devDependencies) on glibc so native modules work
RUN \
if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f bun.lockb ]; then npm install -g bun && bun install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi
COPY . .

RUN \
  if [ -f package-lock.json ]; then npm verify; \
  elif [ -f yarn.lock ]; then yarn verify; \
  elif [ -f pnpm-lock.yaml ]; then pnpm verify; \
  elif [ -f bun.lockb ]; then bun verify; \
  else echo "Lockfile not found." && exit 1; \
  fi


# ============================================
# Stage 2: Install dependencies (Alpine)
# ============================================
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f bun.lockb ]; then npm install -g bun && bun install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ============================================
# Stage 3: Build Next.js application (Alpine)
# ============================================
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
# Ensure tester stage ran (tests must pass before build proceeds)
COPY --from=tester /app/src ./src
COPY . .

RUN \
  if [ -f package-lock.json ]; then npm run build; \
  elif [ -f yarn.lock ]; then npm install -g yarn && yarn build; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm run build; \
  elif [ -f bun.lockb ]; then npm install -g bun && bun run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

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

#ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]