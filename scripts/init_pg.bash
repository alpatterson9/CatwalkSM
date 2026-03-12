#!/bin/bash
podman volume create pgdata

podman run -d --replace --name postgres \
  --env-file ./server/.env \
  -v pgdata:/var/lib/postgresql/data \
  -v ./server/db/init.sql:/docker-entrypoint-initdb.d/001_init.sql:ro \
  -p 5432:5432 \
  docker.io/library/postgres:16


podman run --rm --network catwalknet docker.io/library/postgres:16 \
  pg_isready -h postgres -p 5432

echo "postgres container created and running."