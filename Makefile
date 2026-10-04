SHELL := /bin/bash

.PHONY: build up down logs ps pull test clean

build:
	docker compose build

up:
	docker compose up -d

pull:
	docker compose pull

ps:
	docker compose ps

logs:
	docker compose logs --tail=100

down:
	docker compose down

test:
	curl -fsS http://localhost:$${APP_PORT:-8080}/api/health

clean:
	docker compose down --remove-orphans
