FROM library/node:10.9-alpine AS frontend_builder

WORKDIR /app/static

COPY package*.json ./
RUN yarn ci

COPY gulpfile.js /app/static/
COPY frontend /app/static/frontend/
COPY server.js app.jsx ./

RUN yarn gulp test
RUN yarn gulp dist


FROM library/node:12-alpine as backend_base

WORKDIR /src
COPY --from=frontend_builder /app/static/frontend/build /src/frontend/build

COPY package*.json ./
RUN yarn ci --only=production

COPY server.js /src/
COPY backend /src/backend

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]
