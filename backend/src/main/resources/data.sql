-- 테스트 사장님 계정 생성
-- 비밀번호: 1234 (BCrypt 인코딩)
INSERT IGNORE INTO business_owner (login_id, password, name, phone, email, business_number, is_verified, subscription_plan, max_business_count, created_at, updated_at)
VALUES ('owner1', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '테스트 사장', '01012345678', 'owner1@test.com', '1234567890', true, 'FREE', 10, NOW(), NOW());

-- 테스트 고객 계정 생성
INSERT IGNORE INTO customer (login_id, password, name, phone, email, created_at, updated_at)
VALUES ('customer1', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '테스트 고객', '01087654321', 'customer1@test.com', NOW(), NOW());
