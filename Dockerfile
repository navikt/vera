FROM alpine-node:5.7.0
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

WORKDIR /tmp
ADD . /tmp

RUN npm install --production
RUN gulp dist

EXPOSE 8443
CMD ["node", "/opt/vera/server.js"]
