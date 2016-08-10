FROM docker.adeo.no:5000/alpine-node:base-6.3.1
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

WORKDIR /src
ADD ./dist .

EXPOSE 8443
CMD ["node", "server.js"]