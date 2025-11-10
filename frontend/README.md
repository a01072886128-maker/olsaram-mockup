# Frontend

React + Vite + Tailwind CSS로 구축된 Olsaram 프로젝트 프론트엔드입니다.

## 프로젝트 구조

```
frontend/
├── public/              # 정적 자산 (이미지, 폰트 등)
├── src/
│   ├── assets/         # 프로젝트 이미지, 아이콘
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── admin/     # 관리자 공통 컴포넌트
│   │   └── ui/        # UI 컴포넌트
│   ├── contexts/      # React Context (상태 관리)
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── admin/     # 관리자 페이지
│   │   ├── auth/      # 인증 (로그인, 회원가입)
│   │   ├── customer/  # 고객용 페이지
│   │   └── owner/     # 사업가용 페이지
│   ├── services/      # API 통신 (api.js, menu.js)
│   ├── lib/           # 유틸리티 함수
│   ├── mocks/         # Mock 데이터
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.local         # 환경 변수
```

## 설치 및 실행

### 설치
```bash
cd frontend
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 열기

### 빌드
```bash
npm run build
```

### 빌드 결과 미리보기
```bash
npm run preview
```

## API 엔드포인트
`frontend/src/services/api.js` 참고

## 환경 변수
`.env.local` 파일에서 설정:
```
VITE_API_BASE_URL=http://localhost:8080
```

## 컨벤션
- 컴포넌트 파일: PascalCase (예: `Dashboard.jsx`)
- 유틸리티 함수: camelCase (예: `formatDate.js`)
- CSS 클래스: kebab-case (예: `user-profile`)
