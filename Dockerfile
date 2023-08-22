FROM library/node:18 AS base_dependencies

WORKDIR /src
COPY package.json yarn.lock ./

# Install production requirements only
RUN yarn install --frozen-lockfile --prod

FROM library/node:18 AS frontend_builder

WORKDIR /app/static

COPY package.json yarn.lock ./

# Install the dev dependencies, too
RUN yarn install --frozen-lockfile

COPY gulpfile.mjs server.js app.jsx ./
COPY frontend ./frontend

RUN yarn gulp test && yarn gulp dist


FROM library/node:18-alpine AS server
RUN apk add --no-cache bash

WORKDIR /src

COPY --from=base_dependencies /src/node_modules /src/node_modules
COPY --from=frontend_builder /app/static/frontend/build /src/frontend/build

COPY package.json yarn.lock docker_vera_startup.sh server.js ./
COPY backend ./backend

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
