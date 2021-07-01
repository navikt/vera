FROM node:12-alpine AS builder

COPY package*.json ./

RUN npm install

FROM builder

COPY --from=builder node_modules .

WORKDIR /src

ADD . .

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]
