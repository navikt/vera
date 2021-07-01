SHELL=bash

IMAGE_NAME=local_vera

.PHONY: docker-compose
docker-compose:
	docker-compose up --detach --build

.PHONY: docker-build
docker-build:
	docker build -t local_vera .

.PHONY: docker-kill
docker-kill:
	shell docker kill $(docker ps --quiet --filter ancestor=local_vera)

.PHONY: clean
clean:
	docker-compose down --remove-orphans --rmi all
