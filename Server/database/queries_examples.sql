-- ==============================================
-- 📋 API에서 사용할 쿼리 예시들
-- ==============================================

-- 1. 전체 레시피 목록 조회 (페이징 포함)
SELECT 
    recipe_id,
    title,
    description,
    category,
    cooking_time,
    difficulty,
    servings,
    image_url,
    created_at
FROM recipes 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- 2. 레시피 상세 정보 조회 (모든 관련 데이터 포함)
WITH recipe_detail AS (
    SELECT 
        r.*,
        n.calories,
        n.carbs,
        n.protein,
        n.fat
    FROM recipes r
    LEFT JOIN nutrition n ON r.recipe_id = n.recipe_id
    WHERE r.recipe_id = 1
),
recipe_ingredients AS (
    SELECT 
        ingredient_id,
        name,
        quantity,
        unit,
        order_index
    FROM ingredients 
    WHERE recipe_id = 1
    ORDER BY order_index
),
recipe_steps AS (
    SELECT 
        step_id,
        step_number,
        title,
        instruction,
        estimated_time,
        temperature,
        tips
    FROM recipe_steps 
    WHERE recipe_id = 1
    ORDER BY step_number
)
SELECT 
    (SELECT row_to_json(recipe_detail) FROM recipe_detail) as recipe,
    (SELECT json_agg(recipe_ingredients ORDER BY order_index) FROM recipe_ingredients) as ingredients,
    (SELECT json_agg(recipe_steps ORDER BY step_number) FROM recipe_steps) as steps;

-- 3. 카테고리별 레시피 검색
SELECT 
    recipe_id,
    title,
    category,
    cooking_time,
    difficulty
FROM recipes 
WHERE category ILIKE '%Italian%' 
   OR category ILIKE '%Pasta%'
ORDER BY created_at DESC;

-- 4. 조리 시간별 필터링
SELECT 
    recipe_id,
    title,
    cooking_time,
    difficulty
FROM recipes 
WHERE cooking_time <= 30  -- 30분 이하
    AND difficulty = 'Easy'
ORDER BY cooking_time ASC;

-- 5. 재료 기반 레시피 검색
SELECT DISTINCT 
    r.recipe_id,
    r.title,
    r.cooking_time
FROM recipes r
JOIN ingredients i ON r.recipe_id = i.recipe_id
WHERE i.name ILIKE '%돼지고기%' 
   OR i.name ILIKE '%김치%'
ORDER BY r.created_at DESC;

-- 6. 영양 정보 기반 필터링 (칼로리 범위)
SELECT 
    r.recipe_id,
    r.title,
    n.calories,
    n.protein
FROM recipes r
JOIN nutrition n ON r.recipe_id = n.recipe_id
WHERE n.calories BETWEEN 200 AND 500
ORDER BY n.calories ASC;

-- 7. 레시피 생성 (AI 결과 저장용)
-- 메인 레시피 삽입
INSERT INTO recipes (title, description, category, cooking_time, difficulty, servings, source_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING recipe_id;

-- 재료 일괄 삽입
INSERT INTO ingredients (recipe_id, name, quantity, unit, order_index)
VALUES 
    ($1, $2, $3, $4, 1),
    ($1, $5, $6, $7, 2),
    ($1, $8, $9, $10, 3);

-- 단계 일괄 삽입
INSERT INTO recipe_steps (recipe_id, step_number, title, instruction, estimated_time)
VALUES 
    ($1, 1, $2, $3, $4),
    ($1, 2, $5, $6, $7),
    ($1, 3, $8, $9, $10);

-- 8. 레시피 통계 조회
SELECT 
    COUNT(*) as total_recipes,
    AVG(cooking_time) as avg_cooking_time,
    COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy_count,
    COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium_count,
    COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard_count
FROM recipes;

-- 9. 인기 재료 Top 10
SELECT 
    i.name,
    COUNT(*) as usage_count
FROM ingredients i
GROUP BY i.name
ORDER BY usage_count DESC
LIMIT 10;

-- 10. 최근 추가된 레시피 (관련 데이터 포함)
SELECT 
    r.recipe_id,
    r.title,
    r.created_at,
    COUNT(DISTINCT i.ingredient_id) as ingredient_count,
    COUNT(DISTINCT s.step_id) as step_count,
    n.calories
FROM recipes r
LEFT JOIN ingredients i ON r.recipe_id = i.recipe_id
LEFT JOIN recipe_steps s ON r.recipe_id = s.recipe_id
LEFT JOIN nutrition n ON r.recipe_id = n.recipe_id
WHERE r.created_at >= NOW() - INTERVAL '7 days'
GROUP BY r.recipe_id, r.title, r.created_at, n.calories
ORDER BY r.created_at DESC;