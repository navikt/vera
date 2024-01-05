#!/usr/bin/env bash

if ! kubectl exec -it vera-mongo-0 -c mongod-container -- mongodump --archive --gzip > /tmp/dump.gz; then
  echo "failed to execute mongodump"
  exit 1
fi

# compress dump before uploading to bucket

backup_name="dump_$(date +"%Y-%m-%d_%H-%M").gz"
if ! gsutil mv "/tmp/dump.gz" "gs://vera-backup-bckt/$backup_name"; then
  echo "failed to upload backup to bucket"
  exit 1
fi
