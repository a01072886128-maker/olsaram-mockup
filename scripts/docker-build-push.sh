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

if [ -z "$KAKAO_MAP_KEY" ]; then
  echo "⚠️  경고: VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다. 카카오 맵이 작동하지 않을 수 있습니다."
  echo "   빌드 전에 다음 명령어로 설정하세요:"
  echo "   export VITE_KAKAO_MAP_APP_KEY='your_kakao_map_key'"
else
  echo "✅ 카카오 맵 키가 설정되었습니다."
fi

docker build \
  --file frontend/Dockerfile \
  --build-arg VITE_KAKAO_MAP_APP_KEY="$KAKAO_MAP_KEY" \
  --tag "$FRONTEND_IMAGE" \
  ./frontend

docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo "Pushed $BACKEND_IMAGE and $FRONTEND_IMAGE"
