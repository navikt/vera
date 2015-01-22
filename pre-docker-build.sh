#!/bin/bash

WORKDIR=docker

rm -rf $WORKDIR 
mkdir -p $WORKDIR/nodejs

curl http://utviklerportalen.adeo.no/software/nodejs/nodejs-0.10.33-with-deps.el7.x86_64.tar.gz | tar xzfv - -C $WORKDIR/nodejs
curl http://utviklerportalen.adeo.no/software/mongodb/mongodb-linux-x86_64-2.6.6.tgz > $WORKDIR/mongodb.tar.gz


