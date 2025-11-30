# 배포 가이드

## Docker를 사용한 배포 프로세스

### 1. 로컬/CI에서 이미지 빌드 및 푸시

```bash
# 레지스트리 주소 설정 (예: allsaram.kr.ncr.ntruss.com)
REGISTRY="allsaram.kr.ncr.ntruss.com"

# 카카오 맵 API 키 설정 (선택사항, 없으면 빌드 시 카카오 맵이 작동하지 않음)
export VITE_KAKAO_MAP_APP_KEY="your_kakao_map_key_here"

# 이미지 빌드 및 푸시
./scripts/docker-build-push.sh "$REGISTRY" latest
```

이 과정에서:
- Backend Dockerfile이 Python 패키지(pandas, scikit-learn, joblib)를 자동으로 설치합니다
- Frontend Dockerfile이 카카오 맵 API 키를 빌드 타임에 포함시킵니다
- 이미지가 레지스트리에 푸시됩니다

### 2. 클라우드 서버에서 이미지 pull 및 실행

클라우드 서버에서는 **git clone이 필요 없습니다**. 이미지만 pull하면 됩니다:

```bash
# 레지스트리 주소 설정
REGISTRY="allsaram.kr.ncr.ntruss.com"

# 이미지 pull 및 컨테이너 실행
./scripts/deploy-containers.sh "$REGISTRY" latest
```

이 스크립트는:
1. 레지스트리에서 최신 이미지를 pull합니다
2. 기존 컨테이너를 중지하고 제거합니다
3. 새 이미지로 컨테이너를 실행합니다

### 3. 환경 변수 설정

클라우드 서버에 `backend/.env` 파일이 필요합니다:

```bash
# backend/.env
SPRING_DATASOURCE_URL=jdbc:mysql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
# ... 기타 환경 변수
```

**참고:**
- 토스 페이먼츠 테스트 키는 `application.yml`에 하드코딩되어 있습니다 (`test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6`)
- 테스트 모드는 `application.yml`에서 `toss.payment.test-mode: true`로 설정되어 있습니다

## 주의사항

- **클라우드 서버에는 Docker와 Docker Compose만 설치되어 있으면 됩니다**
- Python, Java, Node.js 등을 직접 설치할 필요가 없습니다 (모두 Docker 이미지에 포함됨)
- ML 모델 스크립트와 모델 파일(`scripts/`, `models/`)은 Docker 이미지에 포함되어야 합니다

## Dockerfile 확인

`backend/Dockerfile`에서 다음이 포함되어 있는지 확인:
- Python3 및 pip 설치
- ML 모델에 필요한 패키지 설치 (pandas, scikit-learn, joblib)
- ML 모델 스크립트 및 모델 파일 복사

