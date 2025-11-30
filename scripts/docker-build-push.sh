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

# 카카오 맵 키를 환경 변수에서 읽거나 기본값 사용
KAKAO_MAP_KEY=${VITE_KAKAO_MAP_APP_KEY:-}

docker build \
  --file frontend/Dockerfile \
  --build-arg VITE_KAKAO_MAP_APP_KEY="$KAKAO_MAP_KEY" \
  --tag "$FRONTEND_IMAGE" \
  ./frontend

docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo "Pushed $BACKEND_IMAGE and $FRONTEND_IMAGE"
