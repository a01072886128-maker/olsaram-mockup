#!/bin/bash
set -euo pipefail

STATIC_DIR=/app/static
mkdir -p "$STATIC_DIR"

if [ -n "${FRONTEND_ASSET_URL:-}" ]; then
  echo "Downloading frontend bundle from $FRONTEND_ASSET_URL"
  TEMP_ARCHIVE=/tmp/frontend-assets.tar.gz
  curl -fSL "$FRONTEND_ASSET_URL" -o "$TEMP_ARCHIVE"
  tar -xzf "$TEMP_ARCHIVE" -C "$STATIC_DIR"
  echo "Frontend assets copied to $STATIC_DIR"
fi

exec java ${JAVA_OPTS:-} -jar /app/olsaram-backend.jar
