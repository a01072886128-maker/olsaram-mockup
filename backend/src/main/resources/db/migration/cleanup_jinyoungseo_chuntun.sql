-- ==========================================
-- 진영서 / 청춘뚝배기 데모 데이터 제거 스크립트
-- ==========================================
-- seed_jinyoungseo_chuntun.sql 로 추가된 예약 · 고객 · 가게 데이터를 삭제합니다.

SET @cheonchun_id = (
  SELECT business_id FROM business WHERE business_name = '청춘뚝배기' LIMIT 1
);

SET @jinyoungseo_id = (
  SELECT customer_id FROM customer WHERE login_id = 'jinyoungseo' LIMIT 1
);

-- 예약 및 관련 연관 데이터 삭제
DELETE FROM reservation
WHERE business_id = @cheonchun_id
   OR member_id = @jinyoungseo_id;

-- 이후 존재하는 경우 business / customer 삭제
DELETE FROM business WHERE business_id = @cheonchun_id;
DELETE FROM customer WHERE customer_id = @jinyoungseo_id;
