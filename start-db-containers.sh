#!/bin/bash
# start-db-containers.sh
# Starts only the database containers (Postgres, Mongo, Neo4j) with ports mapped to localhost.
# Run this from the repository root, then start Express and Vite locally.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Stopping any existing DB containers ==="
podman stop postgres mongo neo4j 2>/dev/null || true
podman rm -f postgres mongo neo4j 2>/dev/null || true

echo "=== Removing old network (if exists) ==="
podman network rm catwalknet 2>/dev/null || true

echo "=== Creating container network ==="
podman network create catwalknet || true

echo "=== Creating volumes ==="
podman volume create pgdata 2>/dev/null || true
podman volume create mongodata 2>/dev/null || true
podman volume create neo4jdata 2>/dev/null || true

echo "=== Starting Postgres ==="
podman run -d --name postgres \
  --network catwalknet \
  --env-file ./server/.env \
  -v pgdata:/var/lib/postgresql/data \
  -v ./server/db/init.sql:/docker-entrypoint-initdb.d/001_init.sql:ro \
  -p 5432:5432 \
  docker.io/library/postgres:16

echo "=== Starting MongoDB ==="
podman run -d --name mongo \
  --network catwalknet \
  -v mongodata:/data/db \
  -p 27017:27017 \
  docker.io/library/mongo:7

echo "=== Starting Neo4j ==="
podman run -d --name neo4j \
  --network catwalknet \
  --env-file ./server/neo.env \
  -v neo4jdata:/data \
  -p 7474:7474 \
  -p 7687:7687 \
  docker.io/library/neo4j:5

echo ""
echo "=== Container status ==="
podman ps

echo ""
echo "=== Database containers started! ==="
echo "Postgres: localhost:5432"
echo "MongoDB:  localhost:27017"
echo "Neo4j:    localhost:7687 (bolt) / localhost:7474 (browser)"
echo ""
echo "Now start Express locally:"
echo "  ./start-express-local.sh"
echo ""
echo "And Vite in another terminal:"
echo "  cd catwalk && npm run dev"
