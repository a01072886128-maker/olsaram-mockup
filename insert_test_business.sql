-- owner_id=1 (owner1)을 위한 테스트 비즈니스 생성
INSERT INTO business (
    business_id, owner_id, business_name, business_number, category,
    address, phone, latitude, longitude, description,
    is_active, is_open, created_at, updated_at
) VALUES (
    1, 1, '치히로 라멘', '123-45-67890', '일식',
    '광주광역시 동구 금남로 123', '062-123-4567', 35.1496, 126.9158, '정통 일본 라멘 전문점',
    1, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE
    owner_id = 1,
    business_name = '치히로 라멘',
    updated_at = NOW();
