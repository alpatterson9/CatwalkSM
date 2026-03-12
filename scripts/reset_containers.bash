#!/bin/bash
echo "clearing containers."

sudo systemctl stop postgresql #sometimes localhost postgres automatically starts for some reason


podman rm -f pg
podman rm -f mongo
podman kill neo4j
podman kill api
podman rm -f web
podman network rm -f catwalknet
podman volume rm -f pgdata
podman volume rm -f mongodata
podman volume rm -f neo4jdata