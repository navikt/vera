FROM centos:7
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

WORKDIR /src
ADD ./dist .

EXPOSE 80
ENV NODE_ENV=production
CMD ["node", "server.js"]