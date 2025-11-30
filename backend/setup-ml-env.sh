#!/bin/bash
# ML 모델 실행 환경 설정 스크립트 (Ubuntu)
# 가상 환경 생성 및 패키지 설치

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔵 ML 모델 실행 환경 설정 시작..."

# 가상 환경 생성
if [ ! -d "venv" ]; then
    echo "📦 가상 환경 생성 중..."
    python3 -m venv venv
fi

# 가상 환경 활성화 및 패키지 설치
echo "📦 Python 패키지 설치 중..."
source venv/bin/activate
pip install --upgrade pip
pip install pandas scikit-learn joblib

echo "✅ ML 모델 실행 환경 설정 완료!"
echo "📝 가상 환경 Python 경로: $SCRIPT_DIR/venv/bin/python3"

