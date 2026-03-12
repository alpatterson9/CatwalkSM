#!/bin/bash
./scripts/reset_containers.bash
./scripts/init_network.bash
./scripts/init_pg.bash
./scripts/init_mongo.bash
./scripts/init_express.bash
./scripts/init_react.bash
./scripts/init_neo.bash
podman ps -a