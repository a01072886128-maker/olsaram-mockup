#!/bin/sh
set -euo pipefail

REGISTRY=${1:?Usage: ./scripts/deploy-containers.sh <registry> [tag]}
TAG=${2:-latest}

BACKEND_IMAGE="$REGISTRY/olsaram-backend:$TAG"
FRONTEND_IMAGE="$REGISTRY/olsaram-frontend:$TAG"

docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"

docker rm -f olsaram-backend || true
docker rm -f olsaram-frontend || true

docker run -d \
  --name olsaram-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file backend/.env \
  "$BACKEND_IMAGE"

docker run -d \
  --name olsaram-frontend \
  --restart unless-stopped \
  -p 80:80 \
  "$FRONTEND_IMAGE"

echo "Backend and frontend are running (backend:8080, frontend:80)"
