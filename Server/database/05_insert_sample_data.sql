-- ==============================================
-- 5. 샘플 데이터 삽입
-- ==============================================

-- 샘플 레시피 1: 스파게티 까르보나라
INSERT INTO recipes (
    title, description, category, cooking_time, difficulty, servings, source_url
) VALUES (
    'Spaghetti Carbonara',
    'Creamy Italian pasta with eggs, cheese, and pancetta',
    'Italian, Pasta, Quick',
    20,
    'Medium',
    2,
    'https://www.youtube.com/watch?v=example1'
);

-- 방금 삽입한 레시피 ID 가져오기
DO $$
DECLARE
    carbonara_id INTEGER;
BEGIN
    SELECT recipe_id INTO carbonara_id 
    FROM recipes WHERE title = 'Spaghetti Carbonara';

    -- 까르보나라 재료들
    INSERT INTO ingredients (recipe_id, name, quantity, unit, order_index) VALUES
    (carbonara_id, 'Spaghetti', '200', 'g', 1),
    (carbonara_id, 'Pancetta', '100', 'g', 2),
    (carbonara_id, 'Eggs', '2', 'pcs', 3),
    (carbonara_id, 'Parmesan Cheese', '50', 'g', 4),
    (carbonara_id, 'Black Pepper', '1', 'tsp', 5),
    (carbonara_id, 'Salt', '1', 'tsp', 6);

    -- 까르보나라 조리 단계들
    INSERT INTO recipe_steps (recipe_id, step_number, title, instruction, estimated_time) VALUES
    (carbonara_id, 1, '물 끓이기', 'Large pot에 물을 끓이고 소금을 넣어주세요.', 5),
    (carbonara_id, 2, '판체타 볶기', '팬에 판체타를 넣고 바삭하게 볶아주세요.', 5),
    (carbonara_id, 3, '파스타 삶기', '끓는 물에 스파게티를 넣고 알단테로 삶아주세요.', 8),
    (carbonara_id, 4, '소스 만들기', '볼에 달걀, 치즈, 후추를 넣고 잘 섞어주세요.', 2),
    (carbonara_id, 5, '완성하기', '뜨거운 파스타에 소스를 넣고 빠르게 섞어 크림처럼 만들어주세요.', 2);

    -- 까르보나라 영양 정보
    INSERT INTO nutrition (recipe_id, calories, carbs, protein, fat, serving_size) VALUES
    (carbonara_id, 520, 65.0, 22.0, 18.0, '1인분 (약 250g)');
END $$;

-- 샘플 레시피 2: 김치찌개
INSERT INTO recipes (
    title, description, category, cooking_time, difficulty, servings
) VALUES (
    '김치찌개',
    '한국 전통 김치찌개, 매콤하고 시원한 맛',
    'Korean, Soup, Spicy',
    25,
    'Easy',
    3
);

-- 김치찌개 데이터
DO $$
DECLARE
    kimchi_id INTEGER;
BEGIN
    SELECT recipe_id INTO kimchi_id 
    FROM recipes WHERE title = '김치찌개';

    -- 김치찌개 재료들
    INSERT INTO ingredients (recipe_id, name, quantity, unit, order_index) VALUES
    (kimchi_id, '신김치', '300', 'g', 1),
    (kimchi_id, '돼지고기 (목살)', '200', 'g', 2),
    (kimchi_id, '두부', '1/2', 'block', 3),
    (kimchi_id, '대파', '1', 'stalk', 4),
    (kimchi_id, '마늘', '3', 'cloves', 5),
    (kimchi_id, '고춧가루', '1', 'tbsp', 6),
    (kimchi_id, '물', '2', 'cups', 7);

    -- 김치찌개 조리 단계들
    INSERT INTO recipe_steps (recipe_id, step_number, title, instruction, estimated_time, temperature) VALUES
    (kimchi_id, 1, '재료 준비', '김치는 한입 크기로 자르고, 돼지고기도 적당히 썰어주세요.', 5, null),
    (kimchi_id, 2, '김치 볶기', '팬에 김치를 넣고 볶아 신맛을 날려주세요.', 3, '중불'),
    (kimchi_id, 3, '고기 볶기', '돼지고기를 넣고 함께 볶아주세요.', 5, '중불'),
    (kimchi_id, 4, '물 넣고 끓이기', '물을 넣고 끓어오르면 두부와 대파를 넣어주세요.', 10, '센불→중불'),
    (kimchi_id, 5, '마무리', '고춧가루로 색과 맛을 맞춰주세요.', 2, '중불');

    -- 김치찌개 영양 정보
    INSERT INTO nutrition (recipe_id, calories, carbs, protein, fat, serving_size) VALUES
    (kimchi_id, 280, 12.0, 25.0, 15.0, '1인분 (약 350ml)');
END $$;

-- 데이터 확인 쿼리
SELECT 
    r.title,
    r.cooking_time,
    r.difficulty,
    COUNT(DISTINCT i.ingredient_id) as ingredient_count,
    COUNT(DISTINCT s.step_id) as step_count,
    n.calories
FROM recipes r
LEFT JOIN ingredients i ON r.recipe_id = i.recipe_id
LEFT JOIN recipe_steps s ON r.recipe_id = s.recipe_id
LEFT JOIN nutrition n ON r.recipe_id = n.recipe_id
GROUP BY r.recipe_id, r.title, r.cooking_time, r.difficulty, n.calories
ORDER BY r.recipe_id;