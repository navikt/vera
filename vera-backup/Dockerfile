ARG PYTHON_DEV_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/python:3.14-dev
ARG PYTHON_RUNTIME_IMAGE=europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/python:3.14

FROM ${PYTHON_DEV_IMAGE} AS builder
USER root
WORKDIR /app

RUN apk add --no-cache kubectl \
    && cp -L /usr/bin/kubectl /kubectl

COPY requirements.txt ./
RUN python -m venv --without-pip /opt/venv \
    && pip --python /opt/venv/bin/python install --no-cache-dir -r requirements.txt

COPY backup.py test_backup.py ./
RUN /opt/venv/bin/python -B -m unittest -v

FROM ${PYTHON_RUNTIME_IMAGE} AS runtime
WORKDIR /app

ENV HOME=/tmp \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /kubectl /usr/local/bin/kubectl
COPY --from=builder /app/backup.py ./backup.py

USER nonroot
RUN ["/usr/local/bin/kubectl", "version", "--client=true"]
ENTRYPOINT ["/opt/venv/bin/python", "/app/backup.py"]
