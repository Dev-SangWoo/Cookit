-- ==============================================
-- 🍳 COOKIT 레시피 데이터베이스 전체 설정 스크립트
-- ==============================================
-- 실행 순서: Supabase SQL Editor에서 이 파일을 복사해서 실행

-- 기존 테이블이 있다면 삭제 (개발 중에만 사용)
-- DROP TABLE IF EXISTS nutrition CASCADE;
-- DROP TABLE IF EXISTS recipe_steps CASCADE;
-- DROP TABLE IF EXISTS ingredients CASCADE;
-- DROP TABLE IF EXISTS recipes CASCADE;

-- 1. 메인 레시피 테이블
\i 01_create_recipes_table.sql

-- 2. 재료 테이블 (1:N)
\i 02_create_ingredients_table.sql

-- 3. 조리 단계 테이블 (1:N)
\i 03_create_recipe_steps_table.sql

-- 4. 영양 정보 테이블 (1:1)
\i 04_create_nutrition_table.sql

-- 5. 샘플 데이터 삽입
\i 05_insert_sample_data.sql

-- 확인 쿼리
SELECT 'Database setup completed!' as message;
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('recipes', 'ingredients', 'recipe_steps', 'nutrition')
ORDER BY table_name, ordinal_position;