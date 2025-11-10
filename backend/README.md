# Backend

Spring Boot로 구축된 Olsaram 프로젝트 백엔드입니다.

## 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/olsaram/backend/
│   │   │   ├── config/           # 설정 (Security, OCR 등)
│   │   │   ├── controller/       # API 엔드포인트
│   │   │   │   └── auth/        # 인증 관련 API
│   │   │   ├── service/          # 비즈니스 로직
│   │   │   │   ├── auth/        # 인증 서비스
│   │   │   │   └── ocr/         # OCR 서비스
│   │   │   ├── entity/           # JPA 엔티티 (DB 매핑)
│   │   │   ├── dto/              # 요청/응답 DTO
│   │   │   │   ├── auth/
│   │   │   │   └── menu/
│   │   │   ├── domain/           # 도메인 모델
│   │   │   ├── repository/       # DB 접근 계층
│   │   │   └── health/           # 헬스체크
│   │   └── resources/
│   │       ├── application.yml   # 설정 파일
│   │       └── schema.sql        # DB 스키마
│   └── test/                     # 테스트 코드
├── gradle/
├── build.gradle                  # Gradle 설정
├── settings.gradle
└── gradlew                        # Gradle Wrapper
```

## 기술 스택

- Java 21
- Spring Boot 3.4.2
- Gradle (Wrapper 포함)
- Spring Data JPA & Validation
- MySQL (실행 환경) / H2 (테스트 프로파일)

## 필수 요구사항

- JDK 21 이상
- MySQL 8.0 이상
- Gradle 8.0 (gradlew 포함)

## 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `DB_URL` | JDBC URL | `jdbc:mysql://localhost:3306/olsaram_db` |
| `DB_USERNAME` | DB 사용자명 | `olsaram` |
| `DB_PASSWORD` | DB 비밀번호 | `olsaram` |
| `SERVER_PORT` | 애플리케이션 포트 | `8080` |
| `NCLOUD_OCR_INVOKE_URL` | CLOVA OCR API URL | _(없음)_ |
| `NCLOUD_OCR_API_KEY_ID` | API Gateway Key ID | _(없음)_ |
| `NCLOUD_OCR_API_KEY` | API Gateway Key | _(없음)_ |
| `NCLOUD_OCR_SECRET_KEY` | CLOVA OCR Secret | _(없음)_ |

로컬 개발 시 `application-local.yml` 생성:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/olsaram_db
    username: root
    password: secret
server:
  port: 9000
```

## 설치 및 실행

### 데이터베이스 설정
```bash
mysql -u root -p < ../db/schema.sql
```

### 실행
```bash
cd backend
./gradlew bootRun
```

서버는 `http://localhost:8080`에서 실행됩니다.

## API 엔드포인트

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 헬스 체크 |
| `POST` | `/api/owner/menu-ocr/upload` | 메뉴 OCR 이미지 업로드 |
| `GET` | `/api/owner/menu-ocr` | 메뉴 목록 조회 |
| `DELETE` | `/api/owner/menu-ocr/{menuId}` | 메뉴 삭제 |

## 테스트
```bash
./gradlew test
```

## 컨벤션
- 패키지: lowercase (예: `com.olsaram.backend`)
- 클래스: PascalCase (예: `UserController`)
- 메서드: camelCase (예: `getUserProfile`)
- 상수: UPPER_SNAKE_CASE
