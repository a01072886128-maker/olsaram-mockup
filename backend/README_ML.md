# ML 모델 실행 환경 설정 (Ubuntu)

## 간단한 설치 방법

클라우드 서버에서 다음 명령어 하나로 설치:

```bash
sudo apt-get update && sudo apt-get install -y python3-pandas python3-sklearn python3-joblib
```

또는 pip로 설치 (권장하지 않음):

```bash
pip3 install --break-system-packages pandas scikit-learn joblib
```

## 가상 환경 사용 (선택사항)

가상 환경을 사용하려면:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install pandas scikit-learn joblib
```

가상 환경이 있으면 자동으로 사용되고, 없으면 시스템 Python을 사용합니다.

