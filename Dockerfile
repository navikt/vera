FROM library/node:12-alpine AS base_dependencies

COPY package.json ./
COPY yarn.lock ./
COPY .snyk .

# Install production requirements only
RUN yarn install --frozen-lockfile --prod

FROM base_dependencies AS frontend_builder

WORKDIR /app/static

COPY package.json ./
COPY yarn.lock ./
COPY .snyk .

COPY --from=base_dependencies node_modules .

# Install the dev dependencies, too
RUN yarn install --frozen-lockfile

COPY gulpfile.js /app/static/
COPY frontend /app/static/frontend/
COPY server.js app.jsx ./

RUN yarn gulp test
RUN yarn gulp dist

FROM base_dependencies as server

WORKDIR /src
COPY --from=frontend_builder /app/static/frontend/build /src/frontend/build
COPY --from=base_dependencies node_modules .

COPY server.js /src/
COPY backend /src/backend

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]
