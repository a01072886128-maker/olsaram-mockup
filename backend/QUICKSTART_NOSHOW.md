# 노쇼 분석 기능 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1. 더미 데이터 삽입

데이터베이스에 접속하여 더미 데이터를 삽입합니다:

```bash
# MySQL 접속
mysql -u root -p olsaram_db

# SQL 파일 실행
source src/main/resources/db/migration/dummy_reservations_with_noshow.sql;

# 확인
SELECT status, COUNT(*) FROM reservation GROUP BY status;
```

**결과 예시**:
```
+-----------+----------+
| status    | COUNT(*) |
+-----------+----------+
| NO_SHOW   |    16    |
| COMPLETED |    64    |
| CONFIRMED |    10    |
| PENDING   |    10    |
+-----------+----------+
```

### 2. API 테스트

백엔드 서버 실행 후 API를 테스트합니다:

```bash
# 백엔드 서버 실행
./gradlew bootRun
```

#### 2.1 가게별 노쇼율 조회

```bash
curl -X GET http://localhost:8080/api/businesses/1/noshow-rate
```

**응답 예시**:
```json
{
  "businessId": 1,
  "businessName": "가게 1",
  "totalReservations": 20,
  "noShowCount": 4,
  "noShowRate": 0.2,
  "noShowPercentage": 20.0,
  "completedCount": 12,
  "pendingCount": 2,
  "canceledCount": 2
}
```

#### 2.2 사장님 전체 가게 노쇼율 조회

```bash
curl -X GET http://localhost:8080/api/owners/1/noshow-rate
```

#### 2.3 예약별 위험도 조회

```bash
# 예약 ID를 실제 값으로 변경하세요
curl -X GET http://localhost:8080/api/reservations/1/risk
```

**응답 예시**:
```json
{
  "reservationId": 1,
  "riskLevel": "HIGH",
  "riskScore": 35,
  "reason": "고객의 과거 노쇼 이력 3회 (높은 위험)",
  "riskFactors": [
    "노쇼 이력 3회",
    "신뢰 점수 낮음 (70점)"
  ],
  "customerId": 1,
  "customerName": "고객1",
  "customerNoShowCount": 3,
  "customerTrustScore": 70,
  "reservationTime": "2025-01-15T18:00:00",
  "people": 4,
  "paymentStatus": "UNPAID"
}
```

#### 2.4 위험도 포함 예약 목록 조회 (사장님용)

```bash
curl -X GET http://localhost:8080/api/owners/1/reservations/with-risk
```

### 3. 프론트엔드에서 확인

```bash
cd ../frontend
npm run dev
```

1. 브라우저에서 `http://localhost:5173` 접속
2. `owner1` / `password` 로 로그인 (또는 owner2~5)
3. **예약 관리** 페이지로 이동
4. 상단에 **노쇼율 통계** 카드 확인
5. 각 예약 카드에 **위험도 점수** 표시 확인

---

## 📊 위험도 계산 로직

### 점수 계산 (0~100점, 낮을수록 위험)

| 조건 | 점수 변화 |
|------|----------|
| 노쇼 이력 1회 | -20점 |
| 노쇼 이력 2회 | -30점 |
| 노쇼 이력 3회 이상 | -50점 |
| 신뢰 점수 < 70 | -15점 |
| 첫 예약 (이력 없음) | -10점 |
| 야간 예약 (18~23시) + 노쇼 이력 | -10점 |
| 대규모 인원 (8명 이상) + 신규 | -15점 |
| 선결제 완료 | +10점 |
| VIP (예약 10회 이상 + 노쇼 0회) | +20점 |

### 등급 분류

- **70점 이상**: LOW (안전) 🟢
- **40~69점**: MEDIUM (주의) 🟡
- **0~39점**: HIGH (위험) 🔴

---

## 🛠️ 커스터마이징

### 위험도 규칙 수정

파일: `backend/src/main/java/com/olsaram/backend/service/noshow/ReservationRiskService.java`

```java
// 규칙 1: 노쇼 이력이 3회 이상 → HIGH
if (noShowCount >= 3) {
    riskScore -= 50;  // 이 값을 조정하여 민감도 변경
    riskLevel = "HIGH";
}
```

### 노쇼율 계산 기간 제한

파일: `backend/src/main/java/com/olsaram/backend/service/noshow/NoShowRateService.java`

```java
// 전체 기간 대신 최근 3개월만 계산하려면:
LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);
List<Reservation> reservations = reservationRepository
    .findByBusinessIdAndCreatedAtAfter(businessId, threeMonthsAgo);
```

---

## 🧹 더미 데이터 삭제

테스트 완료 후 더미 데이터를 삭제하려면:

```sql
DELETE FROM reservation
WHERE created_at >= '2025-01-10 00:00:00'
  AND created_at <= '2025-01-30 00:00:00';

UPDATE customer
SET no_show_count = 0,
    trust_score = 100,
    reservation_count = 0
WHERE customer_id <= 10;
```

---

## 🎯 다음 단계

1. **실제 데이터 수집**: 고객의 실제 노쇼 이벤트를 `NO_SHOW` 상태로 기록
2. **AI 모델 통합**: `ReservationRiskService`를 `NoShowAiService`로 교체
3. **알림 기능 추가**: 고위험 예약에 대한 SMS/푸시 알림
4. **대시보드 확장**: 시계열 분석, 트렌드 차트 추가

---

## ❓ FAQ

**Q: 노쇼율이 0%로 나옵니다.**
A: 더미 데이터가 제대로 삽입되었는지 확인하세요. `SELECT * FROM reservation WHERE status = 'NO_SHOW';` 쿼리로 확인 가능합니다.

**Q: 위험도가 모두 100점(안전)으로 나옵니다.**
A: 고객의 `no_show_count`가 0으로 설정되어 있는지 확인하세요. 더미 데이터 스크립트를 다시 실행해보세요.

**Q: API 호출 시 401 에러가 발생합니다.**
A: JWT 토큰이 필요한 경우 로그인 후 토큰을 헤더에 포함하세요:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/...
```

**Q: 프론트엔드에서 노쇼율이 표시되지 않습니다.**
A: 브라우저 개발자 도구(F12) → Console/Network 탭에서 API 호출 오류를 확인하세요.

---

**작성일**: 2025-01-25
**버전**: MVP 1.0
