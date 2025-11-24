-- somin6128 데모 데이터 생성
-- DBeaver에서 이 파일을 실행하세요

-- 1. somin6128 계정 설정 업데이트
UPDATE business_owner SET max_business_count = 10 WHERE login_id = 'somin6128';

-- 2. 가게 3개 생성 (owner_id = 9)
-- 가게 1: 한정식
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue, created_at, updated_at)
VALUES (9, '소민이네 한정식', '611-11-11111', '한식', '광주광역시 동구 금남로 123', '062-111-1111',
        '정성을 다해 만드는 전통 한정식 전문점입니다. 제철 재료로 만드는 건강한 한 끼를 제공합니다.',
        'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
        '{"weekday": "11:00-22:00", "weekend": "11:00-23:00"}', true, true, 4.7, 89,
        35.1495, 126.9173, 150, 142, 8, 12500000, NOW(), NOW());

-- 가게 2: 카페
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue, created_at, updated_at)
VALUES (9, '소민 커피하우스', '622-22-22222', '카페', '광주광역시 동구 금남로 200', '062-222-2222',
        '핸드드립 커피와 수제 디저트를 즐길 수 있는 아늑한 카페입니다.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        '{"weekday": "08:00-22:00", "weekend": "09:00-23:00"}', true, true, 4.5, 156,
        35.1510, 126.9190, 230, 225, 5, 8700000, NOW(), NOW());

-- 가게 3: 일식당
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue, created_at, updated_at)
VALUES (9, '소민 스시', '633-33-33333', '일식', '광주광역시 동구 금남로 300', '062-333-3333',
        '신선한 재료로 만드는 정통 일식 전문점. 오마카세와 초밥이 인기입니다.',
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        '{"weekday": "12:00-22:00", "weekend": "12:00-23:00"}', true, true, 4.8, 203,
        35.1520, 126.9200, 180, 170, 10, 18500000, NOW(), NOW());

-- totalBusinessCount 업데이트
UPDATE business_owner SET total_business_count = 3 WHERE owner_id = 9;

-- 3. 메뉴 생성 (각 가게 5개씩)
-- 한정식 메뉴 (business_id는 위에서 생성된 ID로 대체 필요)
SET @hanshik_id = (SELECT business_id FROM business WHERE business_name = '소민이네 한정식' LIMIT 1);
SET @cafe_id = (SELECT business_id FROM business WHERE business_name = '소민 커피하우스' LIMIT 1);
SET @sushi_id = (SELECT business_id FROM business WHERE business_name = '소민 스시' LIMIT 1);

-- 한정식 메뉴
INSERT INTO menu (business_id, menu_name, price, description, category, is_available, is_popular, created_at, updated_at) VALUES
(@hanshik_id, '한정식 특선', 25000, '전통 한정식 코스 (밥, 국, 반찬 10종)', '정식', true, true, NOW(), NOW()),
(@hanshik_id, '불고기 정식', 18000, '양념 불고기와 밥, 된장찌개 세트', '정식', true, true, NOW(), NOW()),
(@hanshik_id, '된장찌개 백반', 12000, '구수한 된장찌개와 밥, 반찬', '백반', true, false, NOW(), NOW()),
(@hanshik_id, '김치찌개 백반', 11000, '얼큰한 김치찌개와 밥, 반찬', '백반', true, false, NOW(), NOW()),
(@hanshik_id, '제육볶음 정식', 15000, '매콤한 제육볶음과 밥, 반찬', '정식', true, true, NOW(), NOW());

-- 카페 메뉴
INSERT INTO menu (business_id, menu_name, price, description, category, is_available, is_popular, created_at, updated_at) VALUES
(@cafe_id, '아메리카노', 4500, '깊고 진한 에스프레소 아메리카노', '커피', true, true, NOW(), NOW()),
(@cafe_id, '카페라떼', 5000, '부드러운 우유와 에스프레소의 조화', '커피', true, true, NOW(), NOW()),
(@cafe_id, '바닐라라떼', 5500, '달콤한 바닐라 시럽이 들어간 라떼', '커피', true, false, NOW(), NOW()),
(@cafe_id, '딸기케이크', 7000, '신선한 딸기를 올린 수제 케이크', '디저트', true, true, NOW(), NOW()),
(@cafe_id, '티라미수', 6500, '진한 커피향의 이탈리안 디저트', '디저트', true, false, NOW(), NOW());

-- 스시 메뉴
INSERT INTO menu (business_id, menu_name, price, description, category, is_available, is_popular, created_at, updated_at) VALUES
(@sushi_id, '모듬초밥', 35000, '신선한 모듬초밥 12피스', '초밥', true, true, NOW(), NOW()),
(@sushi_id, '연어초밥', 18000, '노르웨이산 연어초밥 8피스', '초밥', true, true, NOW(), NOW()),
(@sushi_id, '우동', 9000, '진한 육수의 일본식 우동', '면류', true, false, NOW(), NOW()),
(@sushi_id, '사시미 모듬', 45000, '오늘의 신선한 회 모듬', '사시미', true, true, NOW(), NOW()),
(@sushi_id, '돈까스 정식', 15000, '바삭한 수제 돈까스와 밥', '정식', true, false, NOW(), NOW());

-- 4. 테스트 고객 생성 (예약용)
INSERT IGNORE INTO customer (login_id, password, name, phone, email, trust_score, no_show_count, reservation_count, created_at, updated_at)
VALUES
('guest1', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '김철수', '010-1111-1111', 'guest1@test.com', 95, 0, 5, NOW(), NOW()),
('guest2', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '이영희', '010-2222-2222', 'guest2@test.com', 88, 1, 8, NOW(), NOW()),
('guest3', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '박민수', '010-3333-3333', 'guest3@test.com', 100, 0, 3, NOW(), NOW()),
('guest4', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '정수진', '010-4444-4444', 'guest4@test.com', 92, 0, 6, NOW(), NOW()),
('guest5', '$2a$10$3OIJWc0VvaAYjhD62hMwy.ySfrHwr8AAi/eZLSsHXC1PwERD/ypYC', '최동훈', '010-5555-5555', 'guest5@test.com', 75, 2, 10, NOW(), NOW());

-- 5. 예약 데이터 생성 (각 가게 5개씩)
-- 한정식 예약
INSERT INTO reservation (business_id, member_id, reservation_time, people, status, payment_status, created_at) VALUES
(@hanshik_id, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 4, 'CONFIRMED', 'PENDING', NOW()),
(@hanshik_id, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 2, 'CONFIRMED', 'PAID', NOW()),
(@hanshik_id, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 6, 'PENDING', 'PENDING', NOW()),
(@hanshik_id, 4, DATE_ADD(NOW(), INTERVAL 4 DAY), 3, 'CONFIRMED', 'PENDING', NOW()),
(@hanshik_id, 5, DATE_ADD(NOW(), INTERVAL 5 DAY), 5, 'CONFIRMED', 'PAID', NOW());

-- 카페 예약
INSERT INTO reservation (business_id, member_id, reservation_time, people, status, payment_status, created_at) VALUES
(@cafe_id, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 2, 'CONFIRMED', 'PENDING', NOW()),
(@cafe_id, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 4, 'CONFIRMED', 'PAID', NOW()),
(@cafe_id, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 'PENDING', 'PENDING', NOW()),
(@cafe_id, 4, DATE_ADD(NOW(), INTERVAL 1 DAY), 3, 'CONFIRMED', 'PENDING', NOW()),
(@cafe_id, 5, DATE_ADD(NOW(), INTERVAL 2 DAY), 2, 'CONFIRMED', 'PAID', NOW());

-- 스시 예약
INSERT INTO reservation (business_id, member_id, reservation_time, people, status, payment_status, created_at) VALUES
(@sushi_id, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 2, 'CONFIRMED', 'PAID', NOW()),
(@sushi_id, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 4, 'CONFIRMED', 'PENDING', NOW()),
(@sushi_id, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 'PENDING', 'PENDING', NOW()),
(@sushi_id, 4, DATE_ADD(NOW(), INTERVAL 4 DAY), 6, 'CONFIRMED', 'PAID', NOW()),
(@sushi_id, 5, DATE_ADD(NOW(), INTERVAL 5 DAY), 2, 'CONFIRMED', 'PENDING', NOW());

SELECT '데모 데이터 생성 완료!' AS result;
