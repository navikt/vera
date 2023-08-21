FROM library/node:18 AS base_dependencies

COPY package.json ./
COPY yarn.lock ./

# Install production requirements only
RUN yarn install --frozen-lockfile --prod

FROM base_dependencies AS frontend_builder

WORKDIR /app/static

COPY --from=base_dependencies node_modules package.json yarn.lock ./

# Install the dev dependencies, too
RUN yarn install --frozen-lockfile

COPY gulpfile.mjs /app/static/
COPY frontend /app/static/frontend/
COPY server.js app.jsx ./

RUN yarn gulp test
RUN yarn gulp dist


FROM library/node:18-alpine AS server

WORKDIR /src
COPY --from=frontend_builder /app/static/frontend/build /src/frontend/build
COPY --from=base_dependencies node_modules package.json ./

COPY server.js /src/
COPY backend /src/backend

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
