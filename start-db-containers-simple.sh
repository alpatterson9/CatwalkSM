#!/bin/bash
# start-db-containers-simple.sh
# Starts database containers WITHOUT a custom network (avoids CNI issues).
# Containers communicate via host-mapped ports. Works with rootless Podman.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Stopping any existing DB containers ==="
podman stop postgres mongo neo4j 2>/dev/null || true
podman rm -f postgres mongo neo4j 2>/dev/null || true

echo "=== Creating volumes ==="
podman volume create pgdata 2>/dev/null || true
podman volume create mongodata 2>/dev/null || true
podman volume create neo4jdata 2>/dev/null || true

echo "=== Starting Postgres on port 5432 ==="
podman run -d --name postgres \
  -e POSTGRES_USER=catwalkadmin \
  -e POSTGRES_PASSWORD=meowmeow123 \
  -e POSTGRES_DB=catwalkdb \
  -v pgdata:/var/lib/postgresql/data \
  -v ./server/db/init.sql:/docker-entrypoint-initdb.d/001_init.sql:ro \
  -p 5432:5432 \
  docker.io/library/postgres:16

echo "=== Starting MongoDB on port 27017 ==="
podman run -d --name mongo \
  -v mongodata:/data/db \
  -p 27017:27017 \
  docker.io/library/mongo:7

echo "=== Starting Neo4j on ports 7474/7687 ==="
podman run -d --name neo4j \
  -e NEO4J_AUTH=neo4j/neo4jCatwalk \
  -v neo4jdata:/data \
  -p 7474:7474 \
  -p 7687:7687 \
  docker.io/library/neo4j:5

echo ""
echo "=== Waiting for containers to start ==="
sleep 3

echo ""
echo "=== Container status ==="
podman ps

echo ""
echo "=== Database containers started! ==="
echo "Postgres: localhost:5432  (user: catwalkadmin, pass: meowmeow123, db: catwalkdb)"
echo "MongoDB:  localhost:27017 (db: CatwalkPosts)"
echo "Neo4j:    localhost:7687 (bolt) / localhost:7474 (browser UI)"
echo "          (user: neo4j, pass: neo4jCatwalk)"
echo ""
echo "Now start Express locally:"
echo "  ./start-express-local.sh"
echo ""
echo "And Vite in another terminal:"
echo "  cd catwalk && npm run dev"
