#!/bin/bash

DOCKERDIR=$(dirname $0)/docker
DISTDIR=${DOCKERDIR}/dist

# prepares a docker directory for build
rm -rf ${DOCKERDIR}
mkdir -p ${DISTDIR}

# include backend in dist
cp -r server.js api ${DISTDIR}

# install the application dependencies
cd ${DISTDIR} && cp ../../package.json . && npm install --production && cd -

# init build-tool and build the frontend
npm install && node ./node_modules/gulp/bin/gulp.js dist || exit 1

# include frontend in dist
cp -r dist ${DOCKERDIR}

cp Dockerfile ${DOCKERDIR}