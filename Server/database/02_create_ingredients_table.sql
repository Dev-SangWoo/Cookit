-- ==============================================
-- 2. INGREDIENTS 테이블 (재료 1:N 관계)
-- ==============================================

CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 재료 이름 (예: "달걀", "스파게티 면")
    quantity VARCHAR(50), -- 수량 (예: "2개", "200g", "1컵")
    unit VARCHAR(20), -- 단위 (예: "개", "g", "ml", "컵", "큰술")
    order_index INTEGER DEFAULT 0, -- 재료 표시 순서
    is_essential BOOLEAN DEFAULT true, -- 필수 재료 여부
    notes TEXT, -- 재료 관련 메모 (예: "없으면 생략 가능")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_order ON ingredients(recipe_id, order_index);

-- 외래키 제약조건 확인
ALTER TABLE ingredients 
ADD CONSTRAINT fk_ingredients_recipe 
FOREIGN KEY (recipe_id) 
REFERENCES recipes(recipe_id) 
ON DELETE CASCADE;

-- 코멘트 추가
COMMENT ON TABLE ingredients IS '레시피 재료 테이블 - 1:N 관계';
COMMENT ON COLUMN ingredients.ingredient_id IS '재료 고유 ID';
COMMENT ON COLUMN ingredients.recipe_id IS '레시피 ID (외래키)';
COMMENT ON COLUMN ingredients.name IS '재료 이름';
COMMENT ON COLUMN ingredients.quantity IS '수량 (숫자+단위 통합)';
COMMENT ON COLUMN ingredients.unit IS '단위 (g, ml, 개, 컵 등)';
COMMENT ON COLUMN ingredients.order_index IS '재료 표시 순서';
COMMENT ON COLUMN ingredients.is_essential IS '필수 재료 여부';
COMMENT ON COLUMN ingredients.notes IS '재료 관련 추가 메모';