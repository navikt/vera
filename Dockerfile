FROM node:9-alpine

WORKDIR /src
ADD ./dist .

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]