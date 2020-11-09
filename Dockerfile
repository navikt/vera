FROM node:12-alpine

WORKDIR /src
ADD . .

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]