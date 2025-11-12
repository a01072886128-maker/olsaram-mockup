#!/bin/sh
set -euo pipefail

REGISTRY=${1:?Usage: ./scripts/docker-build-push.sh <registry> [tag]}
TAG=${2:-latest}

BACKEND_IMAGE="$REGISTRY/olsaram-backend:$TAG"
FRONTEND_IMAGE="$REGISTRY/olsaram-frontend:$TAG"

docker build \
  --file backend/Dockerfile \
  --tag "$BACKEND_IMAGE" \
  .

docker build \
  --file frontend/Dockerfile \
  --tag "$FRONTEND_IMAGE" \
  .

docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo "Pushed $BACKEND_IMAGE and $FRONTEND_IMAGE"
