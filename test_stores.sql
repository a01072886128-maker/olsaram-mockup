-- 광주 금남로 주변 테스트 가게 데이터
-- 중심 좌표: 35.1495, 126.9173

-- 1. 맛있는 한식당 (500m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남로 한정식', '123-45-67890', '한식', '광주광역시 동구 금남로 100', '062-123-4567',
        '정통 한정식을 맛볼 수 있는 곳입니다. 신선한 재료로 정성껏 준비합니다.',
        'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
        '{"weekday": "11:00-22:00", "weekend": "11:00-23:00"}', true, true, 4.5, 127,
        35.1535, 126.9173, 450, 420, 30, 8500000);

-- 2. 중식당 (700m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남 차이나타운', '234-56-78901', '중식', '광주광역시 동구 금남로 150', '062-234-5678',
        '정통 중화요리 전문점. 짜장면, 짬뽕, 탕수육이 인기 메뉴입니다.',
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
        '{"weekday": "10:30-21:30", "weekend": "10:30-22:00"}', true, true, 4.3, 89,
        35.1555, 126.9210, 320, 295, 25, 6200000);

-- 3. 일식당 (400m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '사쿠라 스시', '345-67-89012', '일식', '광주광역시 동구 금남로 80', '062-345-6789',
        '신선한 회와 초밥을 제공하는 일식 전문점입니다.',
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        '{"weekday": "12:00-22:00", "weekend": "12:00-23:00"}', true, true, 4.7, 156,
        35.1520, 126.9150, 580, 550, 30, 12300000);

-- 4. 양식당 (600m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남로 비스트로', '456-78-90123', '양식', '광주광역시 동구 금남로 200', '062-456-7890',
        '프랑스풍 분위기의 양식 레스토랑. 파스타와 스테이크가 일품입니다.',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        '{"weekday": "11:30-22:00", "weekend": "11:30-23:00"}', true, true, 4.6, 203,
        35.1470, 126.9230, 670, 635, 35, 15600000);

-- 5. 카페 (300m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남로 커피하우스', '567-89-01234', '카페', '광주광역시 동구 금남로 50', '062-567-8901',
        '아늑한 분위기의 카페. 핸드드립 커피와 수제 디저트를 제공합니다.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        '{"weekday": "08:00-22:00", "weekend": "09:00-23:00"}', true, true, 4.4, 312,
        35.1510, 126.9190, 180, 170, 10, 4200000);

-- 6. 분식집 (800m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남 떡볶이', '678-90-12345', '분식', '광주광역시 동구 금남로 250', '062-678-9012',
        '매콤달콤한 떡볶이가 인기인 분식집. 김밥, 튀김도 맛있습니다.',
        'https://images.unsplash.com/photo-1525518392674-39ba1fca2ec2?w=800',
        '{"weekday": "10:00-21:00", "weekend": "10:00-21:00"}', true, true, 4.2, 78,
        35.1440, 126.9250, 95, 90, 5, 2100000);

-- 7. 한식당 2 (900m 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '백년가게 한식', '789-01-23456', '한식', '광주광역시 동구 금남로 300', '062-789-0123',
        '3대째 이어온 전통 한식당. 된장찌개와 불고기가 특히 맛있습니다.',
        'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800',
        '{"weekday": "11:00-21:00", "weekend": "11:00-22:00"}', true, true, 4.8, 245,
        35.1580, 126.9280, 820, 795, 25, 18700000);

-- 8. 양식당 2 (1km 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '금남 이탈리아노', '890-12-34567', '양식', '광주광역시 동구 금남로 350', '062-890-1234',
        '정통 이탈리아 요리 전문점. 피자와 리조또가 일품입니다.',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        '{"weekday": "11:30-22:00", "weekend": "11:30-23:00"}', true, true, 4.5, 167,
        35.1415, 126.9100, 490, 465, 25, 11200000);

-- 9. 카페 2 (2km 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '테라스 카페', '901-23-45678', '카페', '광주광역시 동구 금남로 400', '062-901-2345',
        '루프탑 테라스가 있는 카페. 야경이 아름답습니다.',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        '{"weekday": "09:00-23:00", "weekend": "09:00-24:00"}', true, true, 4.6, 421,
        35.1675, 126.9320, 340, 325, 15, 7800000);

-- 10. 중식당 2 (2.5km 거리)
INSERT INTO business (owner_id, business_name, business_number, category, address, phone, description,
                      business_image_url, opening_hours, is_open, is_active, average_rating, review_count,
                      latitude, longitude, total_reservations, completed_reservations, no_show_count, monthly_revenue)
VALUES (1, '홍콩반점', '012-34-56789', '중식', '광주광역시 동구 금남로 450', '062-012-3456',
        '홍콩식 중화요리 전문점. 딤섬과 광동요리가 특별합니다.',
        'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800',
        '{"weekday": "11:00-22:00", "weekend": "11:00-23:00"}', true, true, 4.4, 134,
        35.1295, 126.9050, 410, 390, 20, 9300000);

-- 각 가게에 대표 메뉴 추가
INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '한정식 특선', 25000, '전통 한정식 코스', true, 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400'
FROM business WHERE business_name = '금남로 한정식';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '짜장면', 7000, '정통 중화 짜장면', true, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'
FROM business WHERE business_name = '금남 차이나타운';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '모듬초밥', 35000, '신선한 모듬초밥 15피스', true, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
FROM business WHERE business_name = '사쿠라 스시';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '안심 스테이크', 42000, '프리미엄 소고기 스테이크', true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
FROM business WHERE business_name = '금남로 비스트로';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '아메리카노', 4500, '핸드드립 아메리카노', true, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'
FROM business WHERE business_name = '금남로 커피하우스';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '떡볶이', 4000, '매콤달콤 떡볶이', true, 'https://images.unsplash.com/photo-1525518392674-39ba1fca2ec2?w=400'
FROM business WHERE business_name = '금남 떡볶이';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '불고기 정식', 15000, '전통 불고기 정식', true, 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400'
FROM business WHERE business_name = '백년가게 한식';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '마르게리타 피자', 18000, '정통 이탈리아 피자', true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
FROM business WHERE business_name = '금남 이탈리아노';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '카페라떼', 5000, '부드러운 카페라떼', true, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
FROM business WHERE business_name = '테라스 카페';

INSERT INTO menu (business_id, menu_name, price, description, is_available, menu_image_url)
SELECT business_id, '딤섬세트', 28000, '홍콩식 딤섬 모음', true, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400'
FROM business WHERE business_name = '홍콩반점';
