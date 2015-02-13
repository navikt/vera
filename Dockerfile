FROM centos:7
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

COPY nodejs /tmp/nodejs
RUN yum install -y /tmp/nodejs/*.rpm

COPY dist /opt/vera

EXPOSE 8443
CMD ["node", "/opt/vera/server.js"]
