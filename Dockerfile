FROM node:12-alpine

WORKDIR /src
ADD ./dist .

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]