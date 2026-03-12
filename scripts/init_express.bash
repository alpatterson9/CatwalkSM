#!/bin/bash
podman build -t catwalk-api -f server/Containerfile server > /dev/null

podman run -d --replace --name api \
  --network catwalknet \
  --env-file ./server/.env \
  -p 3000:3000 \
  catwalk-api

echo "express container initialized and running."