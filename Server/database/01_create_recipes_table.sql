-- ==============================================
-- 1. RECIPES 메인 테이블 (고정 컬럼)
-- ==============================================

CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- "Italian, Pasta" 같은 태그들
    cooking_time INTEGER, -- 총 소요 시간 (분)
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    servings INTEGER DEFAULT 1,
    source_url VARCHAR(500), -- 원본 YouTube URL 등
    image_url VARCHAR(500), -- 대표 이미지
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_cooking_time ON recipes(cooking_time);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

-- 자동 updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE recipes IS '레시피 메인 테이블 - 고정 컬럼들';
COMMENT ON COLUMN recipes.recipe_id IS '레시피 고유 ID';
COMMENT ON COLUMN recipes.title IS '레시피 제목';
COMMENT ON COLUMN recipes.description IS '레시피 간단 설명';
COMMENT ON COLUMN recipes.category IS '카테고리/태그 (쉼표 구분)';
COMMENT ON COLUMN recipes.cooking_time IS '총 조리 시간 (분)';
COMMENT ON COLUMN recipes.difficulty IS '난이도 (Easy/Medium/Hard)';
COMMENT ON COLUMN recipes.servings IS '인분 수';
COMMENT ON COLUMN recipes.source_url IS '원본 소스 URL (YouTube 등)';
COMMENT ON COLUMN recipes.image_url IS '대표 이미지 URL';