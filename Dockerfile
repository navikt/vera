FROM centos:7
MAINTAINER Johnny Horvi <johnny.horvi@nav.no>

COPY nodejs /tmp/nodejs
RUN yum install -y /tmp/nodejs/*.rpm

ADD mongodb.tar.gz /opt/mongodb
COPY dist /opt/vera

RUN mkdir /opt/mongodb/vera_db

COPY start.sh /opt/
RUN chmod +x /opt/start.sh
CMD ["/opt/start.sh"]
