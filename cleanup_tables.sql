-- menu 테이블 삭제
DROP TABLE IF EXISTS menu;

-- menu_item 테이블 데이터 전체 삭제 (구조는 유지)
TRUNCATE TABLE menu_item;

-- 확인용 쿼리
SELECT 'menu_item 테이블 정리 완료' AS status;
SELECT COUNT(*) AS remaining_rows FROM menu_item;
