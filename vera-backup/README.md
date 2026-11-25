# Backup
Periodic backup of vera MongoDB, uploaded to a Google Cloud Storage bucket.

See [backup.py](./backup.py). The job runs `mongodump --archive --gzip` in
`vera-mongo-0` using `kubectl`, then uploads the completed dump to
`vera-backup-bckt` with the official `google-cloud-storage` Python library.
The local dump is removed only after a successful upload. Dump and upload
failures cause the job to exit with a nonzero status.

## Container

The Dockerfile uses the internal Chainguard Python `3.14-dev` image to install
dependencies and run unit tests. Only the virtual environment, `kubectl` binary,
and backup script are copied into the regular Python `3.14` runtime image.
The runtime runs as nonroot without a shell, package manager, or Google Cloud SDK.

Authentication uses Application Default Credentials supplied by the NAIS/GCP
environment; no service account keys or `gcloud` login are required. Kubernetes
access continues to use the job's service account and existing RBAC.

Build from the repository root:

```sh
docker build -t vera-backup ./vera-backup
```

Deployed by [workflow](../.github/workflows/build-deploy-vera-backup.yml).