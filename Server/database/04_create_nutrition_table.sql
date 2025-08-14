-- ==============================================
-- 4. NUTRITION 테이블 (영양 정보 1:1 관계)
-- ==============================================

CREATE TABLE nutrition (
    nutrition_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL UNIQUE REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    calories INTEGER, -- 칼로리 (kcal)
    carbs DECIMAL(8,2), -- 탄수화물 (g)
    protein DECIMAL(8,2), -- 단백질 (g)
    fat DECIMAL(8,2), -- 지방 (g)
    fiber DECIMAL(8,2), -- 식이섬유 (g)
    sugar DECIMAL(8,2), -- 당분 (g)
    sodium DECIMAL(8,2), -- 나트륨 (mg)
    cholesterol DECIMAL(8,2), -- 콜레스테롤 (mg)
    vitamin_c DECIMAL(8,2), -- 비타민C (mg)
    calcium DECIMAL(8,2), -- 칼슘 (mg)
    iron DECIMAL(8,2), -- 철분 (mg)
    serving_size VARCHAR(50), -- 1인분 기준 (예: "200g", "1그릇")
    notes TEXT, -- 영양 정보 관련 메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_nutrition_recipe_id ON nutrition(recipe_id);
CREATE INDEX idx_nutrition_calories ON nutrition(calories);

-- 외래키 제약조건 (1:1 관계)
ALTER TABLE nutrition 
ADD CONSTRAINT fk_nutrition_recipe 
FOREIGN KEY (recipe_id) 
REFERENCES recipes(recipe_id) 
ON DELETE CASCADE;

-- 영양 값 양수 체크 제약조건
ALTER TABLE nutrition 
ADD CONSTRAINT chk_nutrition_positive 
CHECK (
    (calories IS NULL OR calories >= 0) AND
    (carbs IS NULL OR carbs >= 0) AND
    (protein IS NULL OR protein >= 0) AND
    (fat IS NULL OR fat >= 0) AND
    (fiber IS NULL OR fiber >= 0) AND
    (sugar IS NULL OR sugar >= 0) AND
    (sodium IS NULL OR sodium >= 0)
);

-- 자동 updated_at 트리거
CREATE TRIGGER update_nutrition_updated_at
    BEFORE UPDATE ON nutrition
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE nutrition IS '레시피 영양 정보 테이블 - 1:1 관계';
COMMENT ON COLUMN nutrition.nutrition_id IS '영양정보 고유 ID';
COMMENT ON COLUMN nutrition.recipe_id IS '레시피 ID (외래키, 유니크)';
COMMENT ON COLUMN nutrition.calories IS '칼로리 (kcal)';
COMMENT ON COLUMN nutrition.carbs IS '탄수화물 (g)';
COMMENT ON COLUMN nutrition.protein IS '단백질 (g)';
COMMENT ON COLUMN nutrition.fat IS '지방 (g)';
COMMENT ON COLUMN nutrition.fiber IS '식이섬유 (g)';
COMMENT ON COLUMN nutrition.sugar IS '당분 (g)';
COMMENT ON COLUMN nutrition.sodium IS '나트륨 (mg)';
COMMENT ON COLUMN nutrition.serving_size IS '1인분 기준량';
COMMENT ON COLUMN nutrition.notes IS '영양 정보 관련 추가 메모';