-- ============================================
-- Customer 및 Business 테이블에 노쇼 관련 컬럼 추가/수정
-- ============================================
-- 노쇼 자동 통계 업데이트 기능에 필요한 컬럼들을 확인하고 추가합니다.
-- ============================================

-- 1. 현재 customer 테이블 구조 확인
DESC customer;

-- 2. 현재 business 테이블 구조 확인
DESC business;

-- 3. Customer 테이블에 필요한 컬럼 추가 (이미 있으면 에러 무시)
ALTER TABLE customer
ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 100 COMMENT '신뢰 점수 (0-100)';

ALTER TABLE customer
ADD COLUMN IF NOT EXISTS no_show_count INT DEFAULT 0 COMMENT '노쇼 횟수';

ALTER TABLE customer
ADD COLUMN IF NOT EXISTS reservation_count INT DEFAULT 0 COMMENT '완료된 예약 횟수';

-- 4. Business 테이블에 필요한 컬럼 추가 (이미 있으면 에러 무시)
ALTER TABLE business
ADD COLUMN IF NOT EXISTS no_show_count INT DEFAULT 0 COMMENT '노쇼 발생 횟수';

ALTER TABLE business
ADD COLUMN IF NOT EXISTS completed_reservations INT DEFAULT 0 COMMENT '완료된 예약 횟수';

-- 5. 기존 데이터의 NULL 값을 기본값으로 업데이트
UPDATE customer
SET trust_score = 100
WHERE trust_score IS NULL;

UPDATE customer
SET no_show_count = 0
WHERE no_show_count IS NULL;

UPDATE customer
SET reservation_count = 0
WHERE reservation_count IS NULL;

UPDATE business
SET no_show_count = 0
WHERE no_show_count IS NULL;

UPDATE business
SET completed_reservations = 0
WHERE completed_reservations IS NULL;

-- 6. 결과 확인
SELECT
    customer_id,
    name,
    trust_score,
    no_show_count,
    reservation_count
FROM customer
LIMIT 10;

SELECT
    business_id,
    business_name,
    no_show_count,
    completed_reservations
FROM business
WHERE owner_id IN (27, 28, 29, 30, 31)
ORDER BY business_id;

-- ============================================
-- 문제 해결 확인
-- ============================================
-- 이 스크립트 실행 후:
-- 1. 백엔드 재시작 (./gradlew bootRun)
-- 2. 프론트엔드에서 노쇼 처리 재시도
-- 3. 500 에러가 사라지고 정상 작동해야 함
-- ============================================
