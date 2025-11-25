-- ============================================
-- "백년가게" 가게를 owner2에게 할당
-- ============================================
-- 문제: owner2 (백년가게 사장) 계정은 존재하지만 가게가 없음
-- 해결: "백년가게" 가게를 생성하고 owner2에게 할당
-- ============================================

-- 1. 기존에 "백년가게"가 있는지 확인
SELECT business_id, business_name, owner_id
FROM business
WHERE business_name LIKE '%백년가게%';

-- 2. "백년가게" 가게 생성 (owner2 = ownerId 27)
INSERT INTO business (
    owner_id,
    business_name,
    business_number,
    category,
    address,
    phone,
    description,
    business_image_url,
    opening_hours,
    is_open,
    is_active,
    average_rating,
    review_count,
    latitude,
    longitude,
    total_reservations,
    completed_reservations,
    no_show_count,
    monthly_revenue
) VALUES (
    27,  -- owner2의 ownerId
    '백년가게',
    '789-01-23456',
    '한식',
    '광주광역시 동구 금남로 300',
    '062-789-0123',
    '3대째 이어온 전통 한식당. 전통 한정식과 가정식 백반이 맛있는 곳입니다.',
    'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
    '{"weekday": "11:00-22:00", "weekend": "11:00-23:00"}',
    1,  -- is_open
    1,  -- is_active
    4.8,
    245,
    35.1580,  -- latitude (금남로 근처, 검색 가능한 위치)
    126.9280, -- longitude
    50,
    40,
    2,
    5000000
);

-- 3. 메뉴 추가 (방금 생성한 business_id 사용)
SET @business_id = LAST_INSERT_ID();

INSERT INTO menu (business_id, menu_name, price, description, is_available) VALUES
(@business_id, '한정식', 35000, '전통 한정식 코스 요리', 1),
(@business_id, '백반', 12000, '가정식 백반 정식', 1),
(@business_id, '불고기정식', 15000, '소불고기 정식', 1),
(@business_id, '갈비탕', 14000, '푸짐한 갈비탕', 1),
(@business_id, '김치찌개', 10000, '돼지고기 김치찌개', 1);

-- 4. 결과 확인
SELECT
    b.business_id,
    b.business_name,
    b.category,
    b.address,
    b.latitude,
    b.longitude,
    bo.owner_id,
    bo.name as owner_name,
    bo.login_id,
    (SELECT COUNT(*) FROM menu WHERE business_id = b.business_id) as menu_count
FROM business b
JOIN business_owner bo ON b.owner_id = bo.owner_id
WHERE bo.owner_id = 27;

-- 5. 거리 계산 테스트 (검색 가능 여부 확인)
-- 기준 좌표: 35.1495, 126.9173 (광주 금남로 입구)
-- "백년가게" 좌표: 35.1580, 126.9280
-- 예상 거리: 약 1.3km (검색 반경 5km 안에 포함됨)
SELECT
    business_name,
    address,
    latitude,
    longitude,
    (6371 * ACOS(
        COS(RADIANS(35.1495)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(126.9173)) +
        SIN(RADIANS(35.1495)) * SIN(RADIANS(latitude))
    )) AS distance_km
FROM business
WHERE business_name = '백년가게';
