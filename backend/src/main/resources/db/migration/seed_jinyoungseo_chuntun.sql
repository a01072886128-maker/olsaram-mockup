-- ======================================
-- 진영서 고객 · 청춘뚝배기 예약 데이터
-- ======================================
-- 목적: 진영서 고객이 청춘뚝배기에 50건 예약하고 5건 노쇼한 상태를 시연하기 위한 테스트 데이터
-- 실행 시 기존 데이터가 있어도 중복 없이 설정되도록 구성

-- 1. 청춘뚝배기 가게 등록 (owner_id 1 기준)
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
    monthly_revenue,
    created_at,
    updated_at
) VALUES (
    1,
    '청춘뚝배기',
    '881-55-12345',
    '한식',
    '광주광역시 동구 금남로 196',
    '062-123-4567',
    '청춘의 든든한 한 끼를 책임지는 뚝배기 전문점입니다.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    '{"weekday": "10:30-21:30", "weekend": "10:30-22:30"}',
    1,
    1,
    4.7,
    88,
    35.1500,
    126.9180,
    50,
    45,
    5,
    8200000,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    total_reservations = 50,
    completed_reservations = 45,
    no_show_count = 5,
    updated_at = NOW();

SET @cheonchun_id = (
  SELECT business_id FROM business WHERE business_name = '청춘뚝배기' LIMIT 1
);

-- 2. 진영서 고객 등록
INSERT INTO customer (
    login_id,
    password,
    name,
    phone,
    email,
    trust_score,
    no_show_count,
    reservation_count,
    created_at,
    updated_at
) VALUES (
    'jinyoungseo',
    '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC',
    '진영서',
    '010-7777-8888',
    'jinyoungseo@test.com',
    80,
    5,
    45,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    trust_score = 80,
    no_show_count = 5,
    reservation_count = 45,
    updated_at = NOW();

SET @jinyoungseo_id = (
  SELECT customer_id FROM customer WHERE login_id = 'jinyoungseo' LIMIT 1
);

-- 기존 동일 기간 예약 제거 (스크립트 중복 실행 대비)
DELETE FROM reservation
WHERE business_id = @cheonchun_id
  AND member_id = @jinyoungseo_id
  AND reservation_time >= '2025-03-01 12:00:00'
  AND reservation_time < DATE_ADD('2025-03-01 12:00:00', INTERVAL 51 DAY);

-- 3. 예약 50건, 앞 5건은 노쇼 처리
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50
)
INSERT INTO reservation (business_id, member_id, reservation_time, people, status, payment_status, created_at)
SELECT
  @cheonchun_id,
  @jinyoungseo_id,
  DATE_ADD('2025-03-01 12:00:00', INTERVAL n DAY),
  2,
  CASE WHEN n <= 5 THEN 'NO_SHOW' ELSE 'COMPLETED' END,
  CASE WHEN n <= 5 THEN 'UNPAID' ELSE 'PAID' END,
  DATE_ADD('2025-02-20 09:00:00', INTERVAL n DAY)
FROM seq;

-- 4. 실제 집계값 업데이트
UPDATE business
SET total_reservations = (
      SELECT COUNT(*) FROM reservation WHERE business_id = @cheonchun_id
    ),
    completed_reservations = (
      SELECT COUNT(*) FROM reservation WHERE business_id = @cheonchun_id AND status = 'COMPLETED'
    ),
    no_show_count = (
      SELECT COUNT(*) FROM reservation WHERE business_id = @cheonchun_id AND status = 'NO_SHOW'
    )
WHERE business_id = @cheonchun_id;

UPDATE customer
SET reservation_count = (
      SELECT COUNT(*) FROM reservation WHERE member_id = @jinyoungseo_id AND status = 'COMPLETED'
    ),
    no_show_count = (
      SELECT COUNT(*) FROM reservation WHERE member_id = @jinyoungseo_id AND status = 'NO_SHOW'
    )
WHERE customer_id = @jinyoungseo_id;
