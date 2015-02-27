#!/bin/bash

BASEDIR=$(dirname $0)
DOCKERDIR=$BASEDIR/docker
DISTDIR=$DOCKERDIR/dist

rm -rf $DOCKERDIR 
mkdir -p $DOCKERDIR/nodejs
mkdir -p $DISTDIR

#curl http://utviklerportalen.adeo.no/software/nodejs/nodejs-0.10.33-with-deps.el7.x86_64.tar.gz | tar xzfv - -C $DOCKERDIR/nodejs
curl -O http://utviklerportalen.adeo.no/software/nodejs/nodejs-0.10.33-with-deps.el7.x86_64.tar.gz
tar xzfv nodejs-0.10.33-with-deps.el7.x86_64.tar.gz -C $DOCKERDIR/nodejs

cd $DISTDIR && cp ../../package.json . && npm install --production && rm -f package.json && cd -

npm install
gulp dist || exit 1

cp -r dist $DOCKERDIR
cp Dockerfile $DOCKERDIR

