# Database Setup

## 개요
Olsaram 프로젝트의 데이터베이스 관련 파일을 관리합니다.

## 파일 구조
```
db/
├── schema.sql     # 데이터베이스 테이블 정의
└── README.md      # 이 파일
```

## 데이터베이스 설정

### MySQL 설치 및 설정
```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE olsaram;
USE olsaram;

# 스키마 적용
source db/schema.sql;
```

### Spring Boot 연결 설정
`backend/src/main/resources/application.yml` 참고

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/olsaram
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

## 테이블 설명
자세한 테이블 정의는 `schema.sql` 파일을 참고하세요.

## 마이그레이션
필요시 새로운 마이그레이션 파일을 이 폴더에 추가하세요.
