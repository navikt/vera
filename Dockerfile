FROM centos:7
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

COPY nodejs /tmp/nodejs
RUN yum install -y /tmp/nodejs/*.rpm

ADD mongodb-linux-x86_64-2.6.6.tgz /opt/mongodb
COPY dist /opt/vera

