#!/bin/bash

echo "hello from script!"

/opt/mongodb/mongodb-linux-x86_64-2.6.6/bin/mongod --dbpath /opt/mongodb/vera_db/ &
echo "sleeping 20 secs..."
sleep 20
node /opt/vera/server.js
