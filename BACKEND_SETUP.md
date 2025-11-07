# 백엔드 설정 및 실행 가이드

## 1. MySQL 설치 확인

MySQL이 설치되어 있고 실행 중인지 확인하세요.

```bash
# MySQL 상태 확인 (Linux/WSL)
sudo service mysql status

# MySQL 시작
sudo service mysql start
```

## 2. 환경 설정

`backend/.env` 파일의 데이터베이스 정보를 확인하고 수정하세요:

```env
DB_HOST=project-db-campus.smhrd.com
DB_USER=campus_24IS_CLOUD3_p3_4
DB_PASSWORD=smhrd4
DB_NAME=campus_24IS_CLOUD3_p3_4
DB_PORT=3307
```

## 3. 데이터베이스 초기화

백엔드 폴더로 이동하여 데이터베이스를 초기화합니다:

```bash
cd backend
npm run init-db
```

이 명령은:

- `olsaram_db` 데이터베이스 생성
- `users` 테이블 생성

## 4. 서버 실행

### 개발 모드 (자동 재시작)

```bash
npm run dev
```

### 일반 모드

```bash
npm start
```

서버가 정상적으로 시작되면:

```
✅ MySQL 데이터베이스 연결 성공
✅ users 테이블 생성/확인 완료

🚀 서버가 포트 5000에서 실행 중입니다
📍 http://localhost:5000
🔧 환경: development
```

## 5. API 테스트

### 회원가입 테스트

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "테스트",
    "phone": "010-1234-5678"
  }'
```

### 로그인 테스트

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## 6. 프론트엔드 연동

프론트엔드에서 API 사용 예시:

```javascript
import { authAPI } from "./services/api";

// 회원가입
const handleRegister = async () => {
  try {
    const response = await authAPI.register({
      email: "user@example.com",
      password: "password123",
      name: "홍길동",
      phone: "010-1234-5678",
    });
    console.log("회원가입 성공:", response);
  } catch (error) {
    console.error("회원가입 실패:", error.message);
  }
};

// 로그인
const handleLogin = async () => {
  try {
    const response = await authAPI.login({
      email: "user@example.com",
      password: "password123",
    });
    console.log("로그인 성공:", response);
  } catch (error) {
    console.error("로그인 실패:", error.message);
  }
};

// 로그인 상태 확인
const isLoggedIn = authAPI.isAuthenticated();

// 현재 사용자 정보
const user = authAPI.getCurrentUser();

// 로그아웃
authAPI.logout();
```

## 7. 동시 실행

터미널 2개를 열어서:

**터미널 1 - 백엔드:**

```bash
cd backend
npm run dev
```

**터미널 2 - 프론트엔드:**

```bash
npm run dev
```

## API 엔드포인트

### 인증

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보 (인증 필요)

## 문제 해결

### MySQL 연결 오류

1. MySQL이 실행 중인지 확인
2. `.env` 파일의 DB 정보가 정확한지 확인
3. MySQL 사용자 권한 확인

### 포트 충돌

`.env` 파일에서 `PORT=5000`을 다른 포트로 변경

### CORS 오류

`backend/src/server.js`에서 CORS 설정 확인:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173", // Vite 포트와 일치해야 함
    credentials: true,
  })
);
```

## 프로젝트 구조

```
olsaram-mockup/
├── backend/                 # 백엔드 서버
│   ├── src/
│   │   ├── config/         # 데이터베이스 설정
│   │   ├── controllers/    # API 로직
│   │   ├── middleware/     # 인증 미들웨어
│   │   ├── models/         # 데이터 모델
│   │   ├── routes/         # API 라우트
│   │   ├── utils/          # 유틸리티
│   │   └── server.js       # 서버 진입점
│   ├── .env                # 환경 변수
│   └── package.json
├── src/                    # 프론트엔드
│   └── services/
│       └── api.js          # API 서비스
└── BACKEND_SETUP.md        # 이 파일
```
