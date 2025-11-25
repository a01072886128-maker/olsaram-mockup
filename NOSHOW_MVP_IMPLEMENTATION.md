# 노쇼율 분석 MVP 구현 가이드

## 📌 개요

사장님 예약확인 페이지에서 **실제 DB 기반**으로 가게별 노쇼율과 예약별 위험도를 계산하여 표시하는 MVP 버전을 구현했습니다.

기존에는 프론트엔드에서 랜덤 목업 데이터를 생성했지만, 이제는 백엔드 API를 통해 실제 데이터 기반으로 분석합니다.

---

## 🎯 구현된 기능

### 1. **DB 스키마 수정**
- `ReservationStatus` enum에 `NO_SHOW`, `COMPLETED` 상태 추가
- 예약 상태를 통해 노쇼 여부 추적 가능

### 2. **더미 데이터 생성**
- 5개 가게 × 20건 예약 = 총 100건의 더미 예약 데이터
- 각 가게당 10~20% 노쇼 데이터 포함
- 고객별 노쇼 이력 차등 설정 (위험 고객 vs 정상 고객)

### ⭐ **2.1 자동 통계 업데이트 (추가)**
- 예약을 `NO_SHOW`로 변경 시:
  - 고객의 `no_show_count` 자동 +1
  - 고객의 `trust_score` 자동 -10 (최소 0점)
  - 가게의 `no_show_count` 자동 +1
- 예약을 `COMPLETED`로 변경 시:
  - 고객의 `reservation_count` 자동 +1
  - 고객의 `trust_score` 자동 +5 (최대 100점)
  - 가게의 `completed_reservations` 자동 +1
- **완전히 실시간 데이터 기반 시스템!**

### 3. **가게별 노쇼율 계산 API**
- **엔드포인트**: `GET /api/businesses/{businessId}/noshow-rate`
- **응답 예시**:
  ```json
  {
    "businessId": 1,
    "businessName": "맛있는 식당",
    "totalReservations": 20,
    "noShowCount": 4,
    "noShowRate": 0.20,
    "noShowPercentage": 20.0,
    "completedCount": 12,
    "pendingCount": 2,
    "canceledCount": 2
  }
  ```

### 4. **예약별 위험도 계산 API (룰 기반)**
- **엔드포인트**: `GET /api/reservations/{reservationId}/risk`
- **위험도 규칙**:
  - 노쇼 이력 3회 이상 → `HIGH`
  - 노쇼 이력 2회 → `HIGH`
  - 노쇼 이력 1회 → `MEDIUM`
  - 신뢰 점수 70점 미만 → 위험도 증가
  - 신규 고객 (예약 이력 0) → `MEDIUM`
  - 야간 예약 (18~23시) + 노쇼 이력 → 위험도 증가
  - 대규모 인원 (8명 이상) + 신규 → 위험도 증가
  - 선결제 완료 → 위험도 감소
  - VIP 고객 (예약 10회 이상 + 노쇼 0회) → `LOW`

- **응답 예시**:
  ```json
  {
    "reservationId": 123,
    "riskLevel": "HIGH",
    "riskScore": 35,
    "reason": "고객의 과거 노쇼 이력 3회 (높은 위험)",
    "riskFactors": [
      "노쇼 이력 3회",
      "신뢰 점수 낮음 (70점)"
    ],
    "customerId": 1,
    "customerName": "홍길동",
    "customerNoShowCount": 3,
    "customerTrustScore": 70
  }
  ```

### 5. **사장님 대시보드 프론트엔드 연동**
- 기존 랜덤 데이터 생성 코드 제거
- 백엔드 API 호출로 전환:
  - `/owners/{ownerId}/reservations/with-risk` → 위험도 포함 예약 목록
  - `/owners/{ownerId}/noshow-rate` → 노쇼율 통계
- **노쇼율 요약 카드** 추가 (상단에 표시)
- 각 예약 카드에 **실시간 위험도** 표시

### ⭐ **5.1 노쇼/완료 처리 버튼 (추가)**
- **예약확정** 후 표시되는 버튼:
  - **✅ 방문완료**: 고객이 정상 방문 시 클릭 → `COMPLETED` 상태로 변경
  - **🚫 노쇼처리**: 고객이 안 나타났을 시 클릭 → `NO_SHOW` 상태로 변경
- 확인 대화상자로 실수 방지
- 처리 후 자동으로:
  - 예약 목록 새로고침
  - 노쇼율 통계 새로고침
  - 고객 위험도 재계산

---

## 📁 파일 구조

```
backend/
├── domain/
│   └── reservation/
│       └── ReservationStatus.java          # ⭐ NO_SHOW, COMPLETED 추가
├── dto/
│   └── noshow/
│       ├── NoShowRateResponse.java         # ⭐ 노쇼율 응답 DTO
│       └── ReservationRiskResponse.java    # ⭐ 위험도 응답 DTO
├── service/
│   └── noshow/
│       ├── NoShowRateService.java          # ⭐ 노쇼율 계산 서비스
│       └── ReservationRiskService.java     # ⭐ 위험도 계산 서비스 (룰 기반)
├── controller/
│   └── noshow/
│       ├── NoShowRateController.java       # ⭐ 노쇼율 API
│       └── ReservationRiskController.java  # ⭐ 위험도 API
└── resources/
    └── db/
        └── migration/
            └── dummy_reservations_with_noshow.sql  # ⭐ 더미 데이터

frontend/
├── services/
│   └── reservations.js                     # ⭐ API 호출 함수 추가
└── pages/
    └── owner/
        ├── Reservations.jsx                # ⭐ 백엔드 연동 버전
        └── Reservations_old_mockup.jsx     # 기존 랜덤 목업 버전 (백업)
```

---

## 🚀 사용 방법

### 1. 더미 데이터 삽입
```bash
# MySQL 접속 후 실행
mysql> source backend/src/main/resources/db/migration/dummy_reservations_with_noshow.sql;
```

### 2. 백엔드 서버 실행
```bash
cd backend
./gradlew bootRun
```

### 3. 프론트엔드 서버 실행
```bash
cd frontend
npm run dev
```

### 4. 사장님 계정으로 로그인
- owner1 ~ owner5 중 하나로 로그인
- 예약 관리 페이지로 이동
- 노쇼율 통계 및 예약별 위험도 확인

---

## 📊 API 엔드포인트 요약

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/businesses/{businessId}/noshow-rate` | 가게별 노쇼율 조회 |
| GET | `/api/owners/{ownerId}/noshow-rate` | 사장님의 모든 가게 노쇼율 조회 |
| GET | `/api/reservations/{reservationId}/risk` | 예약별 위험도 조회 |
| POST | `/api/reservations/risk/batch` | 여러 예약 위험도 일괄 조회 |
| GET | `/api/owners/{ownerId}/reservations/with-risk` | 위험도 포함 예약 목록 조회 |

---

## 🔄 확장성: AI 모델로 교체하기

현재 MVP는 **룰 기반(Rule-based)** 위험도 계산을 사용하지만, 향후 **OpenAI 기반 AI 모델**로 쉽게 교체 가능합니다.

### 권장 아키텍처

```java
// 1. 인터페이스 정의
public interface IRiskCalculator {
    ReservationRiskResponse calculateRisk(Reservation reservation, Customer customer);
}

// 2. 룰 기반 구현체 (현재)
@Service
@Qualifier("ruleBased")
public class RuleBasedRiskCalculator implements IRiskCalculator {
    @Override
    public ReservationRiskResponse calculateRisk(Reservation reservation, Customer customer) {
        // 기존 ReservationRiskService 로직
    }
}

// 3. AI 기반 구현체 (향후)
@Service
@Qualifier("aiBased")
public class AiBasedRiskCalculator implements IRiskCalculator {
    private final NoShowAiService aiService;

    @Override
    public ReservationRiskResponse calculateRisk(Reservation reservation, Customer customer) {
        // OpenAI API 호출 로직
        // aiService.predictAndSave() 활용
    }
}

// 4. Controller에서 선택적 사용
@RestController
public class ReservationRiskController {
    @Autowired
    @Qualifier("ruleBased")  // 또는 "aiBased"
    private IRiskCalculator riskCalculator;

    @GetMapping("/reservations/{id}/risk")
    public ReservationRiskResponse getRisk(@PathVariable Long id) {
        return riskCalculator.calculateRisk(...);
    }
}
```

### 교체 시나리오

**Phase 1 (현재)**: 룰 기반 계산 → 빠른 응답, 운영 비용 0원
**Phase 2 (향후)**: AI 모델 병행 → A/B 테스트로 정확도 비교
**Phase 3 (최종)**: AI 모델 전환 → 높은 정확도, OpenAI 비용 발생

---

## ⚠️ 주의사항

### 1. 더미 데이터 삭제 방법
```sql
-- MVP 테스트 완료 후 실행
DELETE FROM reservation
WHERE created_at >= '2025-01-10 00:00:00'
  AND created_at <= '2025-01-30 00:00:00';

UPDATE customer
SET no_show_count = 0,
    trust_score = 100,
    reservation_count = 0
WHERE customer_id <= 10;
```

### 2. 성능 최적화
- 예약 수가 많을 경우 (`/reservations/with-risk` 엔드포인트)
  - 페이지네이션 추가 고려
  - 위험도 계산 결과 캐싱 (Redis 등)

### 3. 프론트엔드 주의사항
- 기존 `Reservations_old_mockup.jsx`는 백업용이므로 삭제하지 마세요
- 롤백이 필요한 경우 파일명만 변경하면 됩니다

---

## 🎓 학습 포인트

1. **DB 설계**: Enum 타입을 활용한 상태 관리
2. **비즈니스 로직**: 룰 기반 위험도 계산 알고리즘
3. **API 설계**: RESTful API 설계 원칙
4. **프론트-백엔드 연동**: React에서 백엔드 API 호출
5. **확장성**: 인터페이스 기반 설계로 AI 모델 교체 용이

---

## 📞 문의

구현 과정에서 문제가 발생하거나 추가 기능이 필요한 경우, 다음 파일들을 확인하세요:

- **백엔드 로직**: `ReservationRiskService.java` (115줄부터 위험도 계산 로직)
- **프론트엔드 UI**: `Reservations.jsx` (예약 카드 렌더링)
- **API 연동**: `reservations.js` (API 호출 함수)

---

**구현 완료일**: 2025-01-25
**버전**: MVP 1.0
**다음 단계**: AI 모델 통합 준비
