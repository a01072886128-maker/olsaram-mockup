# Olsaram Backend (Spring Boot)

Java 기반의 신규 백엔드 서버입니다. Spring Boot와 Gradle을 사용하며 MySQL 데이터베이스 연동을 기본으로 제공합니다.

## 기술 스택

- Java 21
- Spring Boot 3.4.2
- Gradle (Wrapper 포함)
- Spring Data JPA & Validation
- MySQL (실행 환경) / H2 (테스트 프로파일)

## 사전 준비

1. JDK 21 혹은 그 이상이 설치되어 있어야 합니다.
2. MySQL 인스턴스가 실행 중이어야 하며, 접속 정보가 준비되어 있어야 합니다.

## 환경 변수

애플리케이션은 다음 환경 변수를 통해 데이터베이스와 서버 포트를 설정할 수 있습니다. 설정하지 않으면 기본값을 사용합니다.

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `DB_URL` | JDBC URL | `jdbc:mysql://localhost:3306/olsaram_db?useSSL=false&characterEncoding=UTF-8&serverTimezone=Asia/Seoul` |
| `DB_USERNAME` | DB 사용자명 | `olsaram` |
| `DB_PASSWORD` | DB 비밀번호 | `olsaram` |
| `SERVER_PORT` | 애플리케이션 포트 | `8080` |
| `NCLOUD_OCR_INVOKE_URL` | CLOVA OCR API Gateway URL | _(없음)_ |
| `NCLOUD_OCR_API_KEY_ID` | API Gateway Key ID (`X-NCP-APIGW-API-KEY-ID`) | _(없음)_ |
| `NCLOUD_OCR_API_KEY` | API Gateway Key (`X-NCP-APIGW-API-KEY`) | _(없음)_ |
| `NCLOUD_OCR_SECRET_KEY` | CLOVA OCR Secret (`X-OCR-SECRET`) | _(없음)_ |

로컬 개발 시에는 `application-local.yml`을 만들어 (자동으로 로드됨) 환경 변수 대신 설정할 수도 있습니다.

```yaml
# backend/src/main/resources/application-local.yml 예시
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/olsaram_db
    username: root
    password: secret
server:
  port: 9000
```

실행 시 `SPRING_PROFILES_ACTIVE=local`을 지정하면 위 설정을 사용할 수 있습니다.

## 실행 방법

```bash
# 의존성 다운로드 및 서버 실행
./gradlew bootRun
```

REST API 헬스체크 엔드포인트는 `GET /api/health` 입니다. 응답은 `service`, `status`, `databaseStatus` 필드를 포함하며 MySQL 연결 가능 여부를 함께 제공합니다.

### 메뉴 OCR API

사장님 메뉴 관리 페이지에서 사용하는 엔드포인트는 다음과 같습니다.

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/owner/menu-ocr/upload` | `multipart/form-data` 이미지 업로드 → CLOVA OCR 호출 → 메뉴 후보 추출 및 저장 |
| `GET` | `/api/owner/menu-ocr?ownerId={id}` | 특정 사장님이 등록한 메뉴 목록 조회 |
| `DELETE` | `/api/owner/menu-ocr/{menuId}?ownerId={id}` | OCR 결과로 저장된 메뉴 삭제 |

`POST` 요청 본문은 `FormData` 형태로 `ownerId` 와 `image`(파일) 필드를 포함해야 합니다. CLOVA API 자격 증명이 설정되어 있지 않으면 업로드가 거부됩니다.

## 테스트

```bash
./gradlew test
```

테스트 프로파일은 메모리 기반 H2 데이터베이스를 사용하도록 구성되어 있습니다.

## 프로젝트 구조

```
backend/
├── build.gradle                  # Gradle 설정
├── gradle/                       # Gradle Wrapper 메타데이터
├── gradlew / gradlew.bat         # Gradle Wrapper 스크립트
├── src/
│   ├── main/
│   │   ├── java/com/olsaram/backend/
│   │   │   ├── OlsaramBackendApplication.java
│   │   │   ├── controller/
│   │   │   │   └── HealthController.java
│   │   │   └── health/
│   │   │       ├── DatabaseHealthService.java
│   │   │       └── HealthResponse.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/olsaram/backend/
│           ├── OlsaramBackendApplicationTests.java
│           └── health/
│               └── HealthControllerTest.java
└── README.md
```

추가 API, 엔티티, 서비스 로직은 `com.olsaram.backend` 패키지 아래에서 확장해 나갈 수 있습니다.
