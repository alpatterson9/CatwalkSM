#!/bin/bash
podman build -t catwalk-web -f catwalk/Containerfile catwalk

podman run -d --replace --name web \
  --network catwalknet \
  -p 5173:5173 \
  catwalk-web

echo "react container initialized and running."