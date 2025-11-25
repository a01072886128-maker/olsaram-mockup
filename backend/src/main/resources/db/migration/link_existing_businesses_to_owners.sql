-- ============================================
-- owner1~5에게 기존 실제 가게 연결
-- ============================================
-- 문제: owner1~5는 계정만 있고 가게가 없음
-- 해결: DB에 이미 있는 실제 가게들을 owner1~5에게 재배정
-- ============================================

-- ============================================
-- 1단계: 연결 가능한 가게 찾기
-- ============================================

-- owner2용: "백년가게" 또는 한정식
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE (business_name LIKE '%백년%' OR business_name LIKE '%한정식%')
  AND owner_id NOT IN (27, 28, 29, 30, 31)  -- 이미 할당된 owner 제외
LIMIT 5;

-- owner3용: 이탈리아 또는 양식
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE (business_name LIKE '%이탈%' OR category = '양식')
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 5;

-- owner4용: 테라스 또는 카페
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE (business_name LIKE '%테라스%' OR business_name LIKE '%카페%')
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 5;

-- owner5용: 홍콩 또는 중식
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE (business_name LIKE '%홍콩%' OR business_name LIKE '%반점%' OR category = '중식')
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 5;

-- owner1용: 한식당
SELECT business_id, business_name, address, latitude, longitude
FROM business
WHERE category = '한식'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 5;

-- ============================================
-- 2단계: 가게 재배정 (UPDATE)
-- ============================================

-- owner2 (백년가게 사장, ownerId=27) <- 백운산 한정식
UPDATE business
SET owner_id = 27
WHERE business_name = '백운산 한정식'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 1;

-- owner3 (이탈리아노 대표, ownerId=28) <- 이탈리아 레스토랑
UPDATE business
SET owner_id = 28
WHERE business_name LIKE '%이탈리아%'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 1;

-- owner4 (테라스 카페 사장, ownerId=29) <- 테라스 카페
UPDATE business
SET owner_id = 29
WHERE business_name LIKE '%테라스%'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 1;

-- owner5 (홍콩반점 주인, ownerId=30) <- 홍콩반점
UPDATE business
SET owner_id = 30
WHERE business_name LIKE '%홍콩%'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 1;

-- owner1 (테스트 사장, ownerId=31) <- 한식당 아무거나
UPDATE business
SET owner_id = 31
WHERE category = '한식'
  AND owner_id NOT IN (27, 28, 29, 30, 31)
LIMIT 1;

-- ============================================
-- 3단계: 결과 확인
-- ============================================

SELECT
    bo.owner_id,
    bo.login_id,
    bo.name as owner_name,
    COUNT(b.business_id) as business_count,
    GROUP_CONCAT(b.business_name SEPARATOR ', ') as businesses
FROM business_owner bo
LEFT JOIN business b ON bo.owner_id = b.owner_id
WHERE bo.owner_id IN (27, 28, 29, 30, 31)
GROUP BY bo.owner_id, bo.login_id, bo.name
ORDER BY bo.owner_id;

-- 상세 정보
SELECT
    bo.owner_id,
    bo.login_id,
    bo.name as owner_name,
    b.business_id,
    b.business_name,
    b.address,
    b.category,
    b.latitude,
    b.longitude
FROM business_owner bo
LEFT JOIN business b ON bo.owner_id = b.owner_id
WHERE bo.owner_id IN (27, 28, 29, 30, 31)
ORDER BY bo.owner_id;

-- ============================================
-- 4단계: 검색 테스트 (거리 계산)
-- ============================================
-- 기준 좌표: 35.1495, 126.9173 (광주 금남로)

SELECT
    b.business_id,
    b.business_name,
    b.address,
    b.category,
    bo.login_id as owner_login,
    bo.name as owner_name,
    b.latitude,
    b.longitude,
    ROUND((6371 * ACOS(
        COS(RADIANS(35.1495)) * COS(RADIANS(b.latitude)) *
        COS(RADIANS(b.longitude) - RADIANS(126.9173)) +
        SIN(RADIANS(35.1495)) * SIN(RADIANS(b.latitude))
    )), 2) AS distance_km
FROM business b
JOIN business_owner bo ON b.owner_id = bo.owner_id
WHERE bo.owner_id IN (27, 28, 29, 30, 31)
ORDER BY distance_km;

-- ============================================
-- 주의사항
-- ============================================
-- 1. 이 스크립트는 기존 가게의 owner_id를 변경합니다
-- 2. system_owner나 다른 owner의 가게를 가져오는 것이므로
--    실제 운영 환경에서는 신중하게 사용하세요
-- 3. 테스트 환경에서만 사용 권장
-- ============================================
