# owner2 "백년가게" 검색 문제 해결 가이드

## 🔍 문제 원인

**owner2 계정은 존재하지만 가게가 없습니다!**

- ✅ owner2 계정 존재: `ownerId=27`, `loginId=owner2`, `name=백년가게 사장`
- ❌ owner2 소유 가게 없음: DB에 `owner_id=27`인 business가 0개
- 🔍 검색 결과 없음: `/api/stores/nearby` 응답에 owner2의 가게가 없음

## 🛠️ 해결 방법

### 방법 1: SQL 스크립트 실행 (권장)

**1단계: MySQL 접속**
```bash
mysql -u root -p olsaram_db
```

**2단계: SQL 파일 실행**
```sql
source backend/src/main/resources/db/migration/assign_business_owner2.sql;
```

**3단계: 결과 확인**
```sql
-- owner2의 가게 확인
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE owner_id = 27;

-- 예상 결과:
-- business_id | business_name | address              | latitude | longitude
-- -----------|--------------|---------------------|----------|----------
-- XXX        | 백년가게      | 광주광역시 동구 금남로 300 | 35.1580  | 126.9280
```

**4단계: 백엔드 재시작 (선택사항)**
```bash
# 기존 백엔드 중지 (Ctrl+C)
cd backend
./gradlew bootRun
```

**5단계: 프론트엔드에서 테스트**
1. `http://localhost:5173` 접속
2. 고객 계정으로 로그인 (또는 비로그인 상태)
3. 맛집 탐색 페이지 이동
4. 검색창에 "백년가게" 입력 또는 지도에서 확인
5. ✅ "백년가게" 검색 결과 표시 확인!

---

### 방법 2: API를 통한 생성 (향후 개선)

현재는 가게 생성 API가 없지만, 향후 다음과 같은 엔드포인트를 추가하면 UI에서 바로 생성 가능:

```java
// BusinessController.java (미구현)
@PostMapping("/api/owners/{ownerId}/businesses")
public ResponseEntity<Business> createBusiness(
    @PathVariable Long ownerId,
    @RequestBody CreateBusinessRequest request
) {
    // 가게 생성 로직
}
```

---

## 📊 "백년가게" 기본 정보

SQL 스크립트를 실행하면 다음과 같은 가게가 생성됩니다:

| 항목 | 값 |
|------|-----|
| **가게명** | 백년가게 |
| **카테고리** | 한식 |
| **주소** | 광주광역시 동구 금남로 300 |
| **전화번호** | 062-789-0123 |
| **설명** | 3대째 이어온 전통 한식당 |
| **위도/경도** | 35.1580, 126.9280 |
| **평점** | 4.8 / 5.0 |
| **리뷰 수** | 245개 |
| **영업시간** | 평일 11:00-22:00, 주말 11:00-23:00 |

### 메뉴 (5개 자동 생성)
1. 한정식 - 35,000원
2. 백반 - 12,000원
3. 불고기정식 - 15,000원
4. 갈비탕 - 14,000원
5. 김치찌개 - 10,000원

---

## 🗺️ 검색 가능 여부 확인

**기준 좌표** (광주 금남로 입구):
- 위도: 35.1495
- 경도: 126.9173

**"백년가게" 좌표**:
- 위도: 35.1580
- 경도: 126.9280

**예상 거리**: 약 **1.3km**

✅ 기본 검색 반경 5km 안에 포함되므로 검색 가능!

---

## 🚀 다른 사장님 계정도 동일한 문제

현재 다음 계정들도 가게가 없습니다:

| 계정 | 이름 | ownerId | 상태 |
|------|------|---------|------|
| owner1 | 테스트 사장 | 31 | ❌ 가게 없음 |
| owner2 | 백년가게 사장 | 27 | ❌ 가게 없음 |
| owner3 | 이탈리아노 대표 | 28 | ❌ 가게 없음 |
| owner4 | 테라스 카페 사장 | 29 | ❌ 가게 없음 |
| owner5 | 홍콩반점 주인 | 30 | ❌ 가게 없음 |

### 다른 사장님 계정에도 가게 추가하려면?

SQL 스크립트 복사 후 `owner_id`만 변경:

```sql
-- owner3 (이탈리아노 대표, ownerId=28)에게 가게 추가
INSERT INTO business (owner_id, business_name, category, address, latitude, longitude, ...)
VALUES (28, '이탈리아노', '양식', '광주광역시 동구 금남로 350', 35.1415, 126.9100, ...);

-- owner4 (테라스 카페 사장, ownerId=29)에게 가게 추가
INSERT INTO business (owner_id, business_name, category, address, latitude, longitude, ...)
VALUES (29, '테라스 카페', '카페', '광주광역시 동구 금남로 400', 35.1675, 126.9320, ...);

-- owner5 (홍콩반점 주인, ownerId=30)에게 가게 추가
INSERT INTO business (owner_id, business_name, category, address, latitude, longitude, ...)
VALUES (30, '홍콩반점', '중식', '광주광역시 동구 금남로 450', 35.1295, 126.9050, ...);
```

---

## 📝 참고 사항

### 왜 owner2~5는 가게가 없었나?

1. **초기 설정 방식**:
   - owner1~5는 테스트용으로 수동 생성된 계정
   - 가게는 Kakao API로 가져온 실제 가게 데이터 (system_owner 소유)

2. **assign-owners API의 동작**:
   - `/api/stores/assign-owners` 호출 시
   - system_owner 소유의 동구 가게들을 찾아서
   - **새로운** owner6, owner7, ... 계정을 생성하고 연결
   - 기존 owner1~5는 건드리지 않음

3. **해결책**:
   - 수동으로 owner1~5에게 가게 할당 필요
   - 또는 더미 데이터로 가게 생성

---

## ❓ FAQ

**Q: 백엔드를 재시작해야 하나요?**
A: 아닙니다. JPA는 `ddl-auto: update` 설정으로 자동 새로고침됩니다. 하지만 확실하게 하려면 재시작을 권장합니다.

**Q: MySQL 명령어가 없다고 나옵니다.**
A: MySQL이 설치되지 않았거나 PATH에 없습니다. 다음 방법을 시도하세요:
```bash
# WSL/Ubuntu
sudo apt-get install mysql-client

# macOS
brew install mysql-client
```

**Q: 가게를 생성했는데도 검색이 안 됩니다.**
A: 다음을 확인하세요:
1. 백엔드가 실행 중인지 (`http://localhost:8080/api/stores/db-status` 테스트)
2. 위도/경도가 검색 범위 안에 있는지
3. 프론트엔드 검색 페이지가 `/api/stores/nearby` API를 호출하는지 (F12 → Network 탭 확인)

**Q: owner1도 가게를 추가하고 싶습니다.**
A: SQL 스크립트를 복사 후 `owner_id`를 31로 변경하고 실행하세요.

---

## ✅ 해결 확인

SQL 스크립트 실행 후 다음과 같이 확인:

```bash
# 1. API로 확인
curl "http://localhost:8080/api/stores/nearby?lat=35.1495&lng=126.9173&radius=5000" | grep "백년가게"

# 2. 프론트엔드에서 확인
# - 맛집탐색 페이지에서 "백년가게" 검색
# - 지도에서 "백년가게" 마커 표시 확인

# 3. owner2로 로그인 후 확인
# - owner2 / password 로그인
# - 내 가게 목록에 "백년가게" 표시 확인
```

---

**작성일**: 2025-11-25
**문제**: owner2 계정 존재, 가게 없음
**해결책**: SQL 스크립트로 "백년가게" 생성
**파일**: `backend/src/main/resources/db/migration/assign_business_owner2.sql`
