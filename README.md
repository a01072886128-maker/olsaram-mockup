# 올사람 (Olsaram) - 노쇼 방지 플랫폼 목업

약속을 지키는 사람들의 신뢰 예약 플랫폼

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?style=flat-square&logo=tailwind-css)
![React Router](https://img.shields.io/badge/React_Router-6.20.0-CA4245?style=flat-square&logo=react-router)

## 📋 프로젝트 소개

**올사람**은 소상공인을 위한 노쇼 방지 예약 관리 플랫폼입니다. AI 기반 사기 탐지 시스템과 신뢰 고객 리워드 시스템을 통해 노쇼 문제를 해결하고, 건강한 예약 문화를 만들어갑니다.

### 주요 특징

- 🤖 **AI 사기 탐지**: 동시 다발 예약, 허위 정보 등 사기 패턴 실시간 감지
- 💳 **예약금 0원**: 카드 등록만으로 신뢰 보증, 노쇼 시 자동 결제
- 🔄 **실시간 대기자 매칭**: 취소 발생 시 자동 알림으로 빈자리 최소화
- 🎁 **신뢰 리워드**: 약속을 지키는 고객에게 할인 및 특별 혜택 제공
- 🎤 **AI 음성 예약**: 말로만 하면 30초 만에 예약 완료
- 📸 **메뉴판 OCR**: 사진만 찍으면 자동으로 메뉴 등록

## 🎨 디자인 시스템

### 컬러 팔레트

```
주색상:
- Primary Green: #10B981 (신뢰, 성장)
- Primary Purple: #8B5CF6 (프리미엄, 혁신)

보조색상:
- Light Green: #34D399
- Light Purple: #A78BFA
- Dark Green: #059669
- Dark Purple: #7C3AED

중립색:
- Background: #F9FAFB
- Card Background: #FFFFFF
- Text Primary: #111827
- Text Secondary: #6B7280
- Border: #E5E7EB
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 9.x 이상

### 설치 방법

```bash
# 프로젝트 디렉토리로 이동
cd /home/smhrd/olsaram-mockup

# 의존성 패키지 설치
npm install
```

### 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
olsaram-mockup/
├── src/
│   ├── components/          # 공통 컴포넌트
│   │   ├── Navbar.jsx       # 네비게이션 바
│   │   ├── Button.jsx       # 재사용 가능한 버튼
│   │   ├── Card.jsx         # 카드 컴포넌트
│   │   ├── StatCard.jsx     # 통계 카드
│   │   └── ComingSoon.jsx   # 준비 중 페이지
│   │
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Landing.jsx      # 랜딩 페이지 ✅
│   │   │
│   │   ├── owner/           # 사장님 페이지
│   │   │   ├── Dashboard.jsx        # 대시보드 ✅
│   │   │   ├── FraudDetection.jsx   # AI 사기 탐지 (준비 중)
│   │   │   ├── Reservations.jsx     # 예약 관리 (준비 중)
│   │   │   ├── MenuOCR.jsx          # 메뉴 OCR (준비 중)
│   │   │   └── Community.jsx        # 커뮤니티 (준비 중)
│   │   │
│   │   └── customer/        # 고객 페이지
│   │       ├── Search.jsx            # 맛집 찾기 ✅
│   │       ├── VoiceReservation.jsx  # 음성 예약 (준비 중)
│   │       ├── GroupReservation.jsx  # 공유 예약 (준비 중)
│   │       └── MyPage.jsx            # 마이페이지 (준비 중)
│   │
│   ├── App.jsx              # 메인 앱 (라우팅 설정)
│   ├── main.jsx             # 진입점
│   └── index.css            # 전역 스타일 (Tailwind)
│
├── tailwind.config.js       # Tailwind 설정 (커스텀 색상)
├── postcss.config.js        # PostCSS 설정
├── vite.config.js           # Vite 설정
├── package.json             # 프로젝트 정보 및 의존성
└── README.md                # 프로젝트 문서 (이 파일)
```

## 🗺️ 페이지 라우팅

### Phase 1 (완성 ✅)

| 경로 | 페이지 | 상태 |
|------|--------|------|
| `/` | 랜딩 페이지 | ✅ 완성 |
| `/owner/dashboard` | 사장님 대시보드 | ✅ 완성 |
| `/customer/search` | 고객 맛집 찾기 | ✅ 완성 |

### Phase 2 (준비 중 🚧)

#### 사장님 페이지

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/owner/fraud-detection` | AI 사기 탐지 | 실시간 사기 패턴 감지 |
| `/owner/reservations` | 예약 관리 | 예약 확정/취소/대기자 관리 |
| `/owner/menu-ocr` | 메뉴 OCR | 메뉴판 자동 등록 |
| `/owner/community` | 커뮤니티 | 소상공인 정보 공유 |

#### 고객 페이지

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/customer/voice-reservation` | 음성 예약 | AI 음성 인식 예약 |
| `/customer/group-reservation` | 공유 예약 | 친구와 함께 예약 |
| `/customer/my-page` | 마이페이지 | 리워드 및 예약 관리 |

## 🎯 Phase 1 구현 내용

### 1. 랜딩 페이지 (`/`)

- 히어로 섹션: "약속을 지키는 사람들, 올사람"
- 주요 기능 소개 카드 3개
  - AI 사기 탐지
  - 예약금 0원
  - 실시간 대기자 매칭
- 사장님/고객 혜택 소개
- 통계 섹션
- CTA 버튼 및 푸터

### 2. 사장님 대시보드 (`/owner/dashboard`)

- **통계 카드 4개**
  - 오늘 예약 건수
  - 이번 달 노쇼율
  - 예상 매출
  - 신뢰 고객 비율

- **AI 사기 의심 알림**
  - 실시간 위험도 표시
  - 의심 패턴 상세 정보

- **오늘의 예약 목록**
  - 고객 신뢰 등급 표시
  - 예약 시간 및 인원
  - 상태 표시 (확정/대기)

- **빠른 액션 버튼**
  - 예약 추가
  - 메뉴 등록
  - 사기 패턴 확인
  - 커뮤니티

- **이번 주 성과**
  - 신뢰 고객 비율
  - 예약 달성률
  - 노쇼 방지율

### 3. 고객 맛집 찾기 (`/customer/search`)

- **검색 기능**
  - 현재 위치 표시
  - 맛집 이름 검색
  - 카테고리 필터 (한식, 중식, 일식, 양식, 카페, 분식)

- **맛집 카드**
  - 평점 및 리뷰 수
  - 거리 및 도보 시간
  - 가격대 표시
  - 영업 상태
  - 신뢰 고객 할인 혜택
  - 태그 (#주차가능, #단체석 등)

- **예약 액션**
  - 지금 예약하기
  - 음성 예약
  - 상세보기

## 🛠️ 기술 스택

- **프론트엔드 프레임워크**: React 18.3.1
- **빌드 도구**: Vite 5.4.1
- **스타일링**: Tailwind CSS 3.3.6
- **라우팅**: React Router DOM 6.20.0
- **아이콘**: Lucide React 0.294.0
- **언어**: JavaScript (JSX)

## 📦 주요 의존성

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vite": "^5.4.1"
  }
}
```

## 🎨 컴포넌트 설명

### 공통 컴포넌트

#### `<Navbar />`
- 전체 애플리케이션 네비게이션 바
- Props: `userType` (owner, customer, null)
- 반응형 모바일 메뉴 지원

#### `<Button />`
- 재사용 가능한 버튼 컴포넌트
- Props: `variant` (primary, secondary, outline), `size` (sm, md, lg)
- Hover 효과 및 그림자 포함

#### `<Card />`
- 카드형 레이아웃 컴포넌트
- Props: `hover` (boolean)
- 그림자 및 border 스타일 적용

#### `<StatCard />`
- 대시보드 통계 표시용 카드
- Props: `icon`, `title`, `value`, `change`, `changeType`
- 그라데이션 아이콘 배경

#### `<ComingSoon />`
- 준비 중 페이지 표시
- Props: `title`, `description`, `icon`
- Phase 2 안내 메시지 포함

## 📱 반응형 디자인

- **Desktop**: 1200px 이상
- **Tablet**: 768px ~ 1199px
- **Mobile**: 767px 이하

모든 페이지는 모바일, 태블릿, 데스크톱 화면에 최적화되어 있습니다.

## 🚧 Phase 2 개발 예정

Phase 2에서는 다음 기능들이 구현될 예정입니다:

1. **AI 사기 탐지 시스템** - 실시간 패턴 분석 및 블랙리스트 관리
2. **예약 관리** - 예약 CRUD, 대기자 자동 매칭
3. **메뉴 OCR** - 이미지 업로드 및 OCR 처리
4. **커뮤니티** - 게시판 및 댓글 시스템
5. **음성 예약** - 음성 인식 및 자동 예약 처리
6. **공유 예약** - 링크 공유 및 다중 사용자 주문
7. **마이페이지** - 리워드, 쿠폰, 예약 이력 관리

## 🤝 기여하기

이 프로젝트는 목업(Mockup)입니다. Phase 2 구현을 위한 기여는 환영합니다!

## 📄 라이선스

이 프로젝트는 교육 및 데모 목적으로 제작되었습니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ by 올사람 팀**

*약속을 지키는 사람들, 올사람*
