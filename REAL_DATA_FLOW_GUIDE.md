# 실제 데이터 흐름 가이드

## 🎯 완전한 실시간 노쇼 분석 시스템

이제 시스템은 **완전히 실제 데이터를 기반**으로 동작합니다. 고객이 예약을 하고, 사장님이 노쇼 처리를 하면 모든 통계가 자동으로 업데이트됩니다.

---

## 📊 전체 데이터 흐름

```
[고객이 새 예약 생성]
         ↓
[Reservation 테이블에 저장]
  - status: PENDING
  - member_id: 고객 ID
  - business_id: 가게 ID
         ↓
[사장님이 예약 관리 페이지 접속]
         ↓
[백엔드 API 호출: /owners/{ownerId}/reservations/with-risk]
         ↓
[실시간 위험도 계산]
  - Customer 테이블에서 no_show_count 조회
  - 예약 정보 (시간, 인원, 결제상태) 분석
  - 위험도 점수 계산 (룰 기반)
         ↓
[화면에 위험도 표시]
  - 🟢 안전 (70점 이상)
  - 🟡 주의 (40~69점)
  - 🔴 위험 (0~39점)
         ↓
[사장님이 예약 확정 버튼 클릭]
  - status: PENDING → CONFIRMED
         ↓
[예약 시간 도래]
         ↓
┌─────────────────┬─────────────────┐
│ 고객이 방문함    │ 고객이 안 나타남 │
└─────────────────┴─────────────────┘
         ↓                   ↓
[✅ 방문완료 버튼]    [🚫 노쇼처리 버튼]
         ↓                   ↓
   COMPLETED            NO_SHOW
         ↓                   ↓
─────────────────────────────────────
  자동 업데이트 (백엔드)
─────────────────────────────────────
         ↓                   ↓
Customer 테이블          Customer 테이블
reservation_count +1     no_show_count +1
trust_score +5           trust_score -10
         ↓                   ↓
Business 테이블          Business 테이블
completed_reservations+1 no_show_count +1
         ↓                   ↓
─────────────────────────────────────
  화면 자동 새로고침 (프론트엔드)
─────────────────────────────────────
         ↓
[노쇼율 통계 갱신]
[예약 목록 갱신]
[고객 위험도 재계산]
```

---

## 🔄 자동 업데이트 로직

### 1. **노쇼 처리 시** (`status: NO_SHOW`)

**백엔드 자동 처리** ([ReservationService.java:181-204](backend/src/main/java/com/olsaram/backend/service/reservation/ReservationService.java#L181-L204))

```java
// 고객 업데이트
customer.setNoShowCount(currentNoShowCount + 1);     // 노쇼 횟수 +1
customer.setTrustScore(max(0, trustScore - 10));     // 신뢰 점수 -10

// 가게 업데이트
business.setNoShowCount(currentNoShowCount + 1);     // 가게 노쇼 카운트 +1
```

**프론트엔드 자동 처리** ([Reservations.jsx:548-562](frontend/src/pages/owner/Reservations.jsx#L548-L562))

```javascript
// 예약 목록 새로고침 (위험도 재계산)
const reservationData = await reservationAPI.getOwnerReservationsWithRisk(ownerId);
setReservations(reservationData);

// 노쇼율 통계 새로고침
const noShowData = await reservationAPI.getOwnerNoShowRates(ownerId);
setNoShowRates(noShowData);

alert("노쇼 처리되었습니다. 고객의 신뢰도가 감소했습니다.");
```

### 2. **방문 완료 처리 시** (`status: COMPLETED`)

**백엔드 자동 처리** ([ReservationService.java:209-232](backend/src/main/java/com/olsaram/backend/service/reservation/ReservationService.java#L209-L232))

```java
// 고객 업데이트
customer.setReservationCount(currentCount + 1);      // 예약 완료 횟수 +1
customer.setTrustScore(min(100, trustScore + 5));    // 신뢰 점수 +5

// 가게 업데이트
business.setCompletedReservations(currentCount + 1); // 완료 예약 카운트 +1
```

**프론트엔드 자동 처리**

동일하게 전체 데이터 새로고침

---

## 📝 실제 사용 시나리오

### **시나리오 1: 신규 고객의 첫 노쇼**

```
1. 홍길동(customer_id=100) 회원가입
   → no_show_count: 0
   → trust_score: 100
   → reservation_count: 0

2. 홍길동이 "맛있는 식당"에 예약
   → Reservation 생성 (status: PENDING)

3. 사장님이 예약 관리 페이지 확인
   → 위험도: MEDIUM (신규 고객)
   → 점수: 90점

4. 사장님이 "예약확정" 버튼 클릭
   → status: PENDING → CONFIRMED

5. 예약 시간이 지났는데 고객이 안 나타남

6. 사장님이 "🚫 노쇼처리" 버튼 클릭
   → status: CONFIRMED → NO_SHOW

   [자동 업데이트]
   → customer.no_show_count: 0 → 1
   → customer.trust_score: 100 → 90
   → business.no_show_count: 5 → 6

7. 화면 자동 새로고침
   → 노쇼율: 15% → 17% (6/35)

8. 홍길동이 다음에 또 예약하면
   → 위험도: MEDIUM (노쇼 이력 1회)
   → 점수: 70점
```

### **시나리오 2: 상습 노쇼 고객**

```
고객 상태:
- no_show_count: 3
- trust_score: 70
- reservation_count: 5

새 예약 생성 시 위험도:
→ 위험도: HIGH
→ 점수: 35점
→ 이유: "고객의 과거 노쇼 이력 3회 (높은 위험)"

사장님이 할 수 있는 선택:
1. ✅ 예약확정 → 정상 진행
2. ❌ 예약취소 → 환불 처리 (위험 회피)
3. 📞 전화하기 → 재확인 후 결정
```

### **시나리오 3: VIP 고객**

```
고객 상태:
- no_show_count: 0
- trust_score: 100
- reservation_count: 15

새 예약 생성 시 위험도:
→ 위험도: LOW
→ 점수: 115점 → 100점 (최대값)
→ 이유: "신뢰 고객 (VIP)"
→ VIP 배지 표시

매번 정상 방문 시:
→ trust_score: +5점
→ reservation_count: +1
```

---

## 🎮 테스트 방법

### 1단계: 더미 데이터 확인

```bash
mysql -u root -p olsaram_db
```

```sql
-- 노쇼 이력이 있는 고객 확인
SELECT customer_id, name, no_show_count, trust_score, reservation_count
FROM customer
WHERE no_show_count > 0;

-- 노쇼 예약 확인
SELECT id, member_id, business_id, status
FROM reservation
WHERE status = 'NO_SHOW';
```

### 2단계: 사장님 로그인

1. 프론트엔드 접속: `http://localhost:5173`
2. 로그인: `owner1` / `password`
3. **예약 관리** 페이지 이동

### 3단계: 노쇼율 확인

상단 **노쇼율 통계** 카드에서:
- 총 예약: 20건
- 노쇼: 4건
- 노쇼율: 20%

### 4단계: 새 고객 예약 생성

고객 계정으로 로그인하여 예약 생성:
1. 로그아웃 → 고객 로그인
2. 가게 검색 → 예약 생성
3. 다시 사장님 계정으로 로그인

### 5단계: 예약 관리

1. 새 예약이 목록에 표시됨
2. 위험도 확인 (고객의 노쇼 이력에 따라)
3. **✅ 예약확정** 버튼 클릭
4. 확정된 예약에 **🚫 노쇼처리** 버튼 표시됨
5. 노쇼 처리 클릭 → 확인 대화상자 → 확인
6. 자동으로:
   - 예약 목록 새로고침
   - 노쇼율 통계 갱신
   - 고객 신뢰도 감소

### 6단계: 결과 확인

DB에서 변경사항 확인:

```sql
-- 고객의 노쇼 카운트 증가 확인
SELECT customer_id, name, no_show_count, trust_score
FROM customer
WHERE customer_id = {방금 노쇼 처리한 고객 ID};

-- 가게의 노쇼 카운트 증가 확인
SELECT business_id, business_name, no_show_count, completed_reservations
FROM business
WHERE business_id = 1;

-- 예약 상태 변경 확인
SELECT id, member_id, status, reservation_time
FROM reservation
WHERE id = {방금 처리한 예약 ID};
```

---

## 🔍 디버깅 팁

### 프론트엔드에서 API 호출 확인

브라우저 개발자 도구(F12) → Network 탭:

1. **예약 목록 조회**
   - URL: `/api/owners/1/reservations/with-risk`
   - 응답에 `riskScore`, `riskLevel`, `customerData` 포함 확인

2. **노쇼율 조회**
   - URL: `/api/owners/1/noshow-rate`
   - 응답에 `noShowRate`, `noShowPercentage` 확인

3. **상태 변경**
   - URL: `/api/reservations/{id}/status`
   - Method: PATCH
   - Body: `{"status": "NO_SHOW"}`

### 백엔드 로그 확인

```bash
# 백엔드 실행 터미널에서 로그 확인
# 자동 업데이트 로직이 실행되는지 확인
```

---

## ⚙️ 설정 옵션

### 신뢰 점수 변화량 조정

[ReservationService.java:189](backend/src/main/java/com/olsaram/backend/service/reservation/ReservationService.java#L189) 수정:

```java
// 노쇼 시 감소량 (현재: -10점)
customer.setTrustScore(Math.max(0, currentTrustScore - 10));  // 10을 원하는 값으로 변경

// 완료 시 증가량 (현재: +5점)
customer.setTrustScore(Math.min(100, currentTrustScore + 5));   // 5를 원하는 값으로 변경
```

### 위험도 계산 규칙 수정

[ReservationRiskService.java](backend/src/main/java/com/olsaram/backend/service/noshow/ReservationRiskService.java) 수정:

```java
// 노쇼 이력에 따른 점수 감소량 조정
if (noShowCount >= 3) {
    riskScore -= 50;  // 이 값을 조정
}
```

---

## 🎓 학습 포인트

1. **트랜잭션 관리**: 예약 상태 변경 시 고객/가게 통계도 함께 업데이트 (원자성)
2. **상태 변화 감지**: `oldStatus != newStatus` 체크로 중복 업데이트 방지
3. **실시간 데이터 동기화**: 프론트엔드에서 즉시 새로고침
4. **사용자 경험**: 확인 대화상자로 실수 방지
5. **데이터 무결성**: NULL 체크 및 범위 제한 (0~100점)

---

## 📌 요약

✅ **고객이 예약** → DB 저장
✅ **사장님이 확인** → 실시간 위험도 계산
✅ **노쇼 처리** → 자동으로 모든 통계 업데이트
✅ **화면 갱신** → 최신 데이터 즉시 반영

**이제 완전히 실제 데이터 기반으로 동작합니다!** 🎉

---

**작성일**: 2025-01-25
**버전**: MVP 1.1 (자동 업데이트 추가)
