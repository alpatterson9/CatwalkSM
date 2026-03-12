#!/bin/bash
podman run -d --replace --name neo4j \
  --env-file ./server/neo.env \
  -v neo4jdata:/data \
  -p 7474:7474 \
  -p 7687:7687 \
  docker.io/library/neo4j:5