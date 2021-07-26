#!/usr/bin/env bash

if ! kubectl exec -it -n aura vera-mongo-0 -c mongod-container -- mongodump --archive > ./dump; then
  echo "failed to execute mongodump"
  exit 1
fi

backup_name="dump_$(date +"%Y-%m-%d_%H-%M")"
if ! gsutil mv "./dump" "gs://vera-mongo-backup/$backup_name"; then
  echo "failed to upload backup to bucket"
  exit 1
fi