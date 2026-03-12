#!/bin/bash
podman volume create mongodata

podman run -d --replace --name mongo \
  -v mongodata:/data/db \
  docker.io/library/mongo:7

echo "mongo container created and running."