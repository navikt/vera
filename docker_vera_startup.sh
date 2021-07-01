#!/usr/bin/env bash

for attempt in 1..10; do
	node server.js && break
	sleep attempt
done
