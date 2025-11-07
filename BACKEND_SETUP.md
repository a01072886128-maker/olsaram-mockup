# 백엔드 설정 및 실행 가이드 (Spring Boot)

신규 Java 백엔드는 Spring Boot 3.4 기반으로 구성되어 있으며 Gradle을 사용합니다. 아래 절차에 따라 환경을 준비하고 실행할 수 있습니다.

## 1. 필수 설치

- **Java 17 (JDK)**: `java -version`으로 확인하세요.
- **MySQL 8.x**: 로컬 또는 원격 인스턴스를 사용합니다.

MySQL 서비스가 실행 중인지 확인하려면 (Linux/WSL 기준):

```bash
sudo service mysql status     # 상태 확인
sudo service mysql start      # 미동작 시 시작
```

## 2. 데이터베이스 준비

프로젝트는 기본적으로 `olsaram_db` 데이터베이스와 `olsaram` 사용자(비밀번호 `olsaram`)를 가정합니다. 필요 시 아래 SQL을 참고해 데이터베이스와 사용자를 생성하세요.

```sql
CREATE DATABASE IF NOT EXISTS olsaram_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'olsaram'@'%' IDENTIFIED BY 'olsaram';
GRANT ALL PRIVILEGES ON olsaram_db.* TO 'olsaram'@'%';
FLUSH PRIVILEGES;
```

다른 사용자 또는 비밀번호를 사용하고 싶다면 실행 시 환경 변수로 덮어쓸 수 있습니다.

## 3. 환경 변수 설정 (선택)

기본값을 그대로 사용할 수 있지만, 필요하면 다음 환경 변수를 설정합니다.

```bash
export DB_URL="jdbc:mysql://localhost:3306/olsaram_db?useSSL=false&characterEncoding=UTF-8&serverTimezone=Asia/Seoul"
export DB_USERNAME="olsaram"
export DB_PASSWORD="olsaram"
export SERVER_PORT=8080
```

프로파일을 사용하고 싶다면 `backend/src/main/resources/application-local.yml`을 생성하고 `SPRING_PROFILES_ACTIVE=local`로 지정할 수 있습니다.

## 4. 프로젝트 설치 및 실행

```bash
cd backend

# (최초 1회) Gradle Wrapper 권한 부여
chmod +x gradlew

# 서버 실행
./gradlew bootRun
```

애플리케이션이 시작되면 기본적으로 `http://localhost:8080` 포트에서 실행됩니다. 헬스체크 엔드포인트는 아래와 같습니다.

```
GET http://localhost:8080/api/health
응답 예시:
{
  "service": "OlsaramBackend",
  "status": "UP",
  "database": "UP"
}
```

※ 데이터베이스가 닿지 않으면 `database` 필드는 `DOWN` 또는 `NOT_CONFIGURED`로 표시됩니다.

## 5. 테스트

테스트는 H2 인메모리 데이터베이스를 사용하도록 프로파일이 분리되어 있습니다.

```bash
./gradlew test
```

테스트 실행 시에는 Java가 반드시 설치되어 있어야 하며, Gradle이 H2 드라이버를 자동으로 다운로드합니다.

## 6. 프론트엔드와 동시에 실행

터미널 2개를 열어 각각 실행하면 됩니다.

**터미널 1 (백엔드):**
```bash
cd backend
./gradlew bootRun
```

**터미널 2 (프론트엔드):**
```bash
npm run dev
```

프론트엔드에서 API를 호출할 때는 `http://localhost:8080`을 기본 베이스 URL로 사용하면 됩니다.

## 7. 프로젝트 구조

```
olsaram-mockup/
├── backend/                       # Spring Boot 백엔드
│   ├── build.gradle
│   ├── gradlew(.bat)
│   ├── src/
│   │   ├── main/java/com/olsaram/backend/
│   │   │   ├── OlsaramBackendApplication.java
│   │   │   └── controller/HealthController.java
│   │   └── main/resources/application.yml
│   └── README.md
├── src/                           # React 프론트엔드
└── BACKEND_SETUP.md               # 이 문서
```

추가적인 API, 엔티티, 서비스 코드는 `backend/src/main/java/com/olsaram/backend` 아래에서 확장하면 됩니다.
