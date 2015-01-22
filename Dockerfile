FROM centos:7
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

COPY nodejs /tmp/nodejs
RUN yum install -y /tmp/nodejs/*.rpm
RUN node -e 'console.log("hello world!");'

ADD mongodb-linux-x86_64-2.6.6.tgz /opt/mongodb

#RUN yum install -y epel-release
#RUN yum install -y nodejs
