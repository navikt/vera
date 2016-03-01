FROM docker.adeo.no:5000/alpine-node:5.7.0
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

WORKDIR /src
ADD ./dist .

EXPOSE 8443
CMD ["node", "server.js"]
