#!/usr/bin/env bash
# start-express-local.sh
# Run from the repository root in WSL / bash. This script exports env vars so the server
# connects to DB containers via localhost (mapped ports), then starts the Express server.

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$REPO_ROOT/server/.env"

# Load ACCESS/REFRESH secrets from .env if present
if [ -f "$ENV_FILE" ]; then
  ACCESS_SECRET=$(grep -E '^ACCESS_SECRET=' "$ENV_FILE" | cut -d'=' -f2-)
  REFRESH_SECRET=$(grep -E '^REFRESH_SECRET=' "$ENV_FILE" | cut -d'=' -f2-)
  export ACCESS_SECRET
  export REFRESH_SECRET
fi

# Override DB hostnames so Express (running on host) connects to container-mapped ports
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=catwalkadmin
export POSTGRES_PASSWORD=meowmeow123
export POSTGRES_DB=catwalkdb

export MONGO_DB_NAME='mongodb://localhost:27017/CatwalkPosts'

export NEO4J_URI='bolt://localhost:7687'
export NEO4J_USER='neo4j'
export NEO4J_PASSWORD='neo4jCatwalk'

cd "$REPO_ROOT/server"
echo "Starting Express server from $(pwd)"
node router.js
