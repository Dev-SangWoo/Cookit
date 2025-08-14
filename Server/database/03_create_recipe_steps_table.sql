-- ==============================================
-- 3. RECIPE_STEPS 테이블 (조리 단계 1:N 관계)
-- ==============================================

CREATE TABLE recipe_steps (
    step_id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL, -- 단계 순서 (1, 2, 3...)
    title VARCHAR(100), -- 단계 제목 (예: "재료 준비", "볶기")
    instruction TEXT NOT NULL, -- 단계별 상세 설명
    image_url VARCHAR(500), -- 단계별 이미지 URL
    estimated_time INTEGER, -- 이 단계 예상 소요 시간 (분)
    temperature VARCHAR(50), -- 온도 정보 (예: "중불", "180°C")
    tips TEXT, -- 단계별 팁이나 주의사항
    tools VARCHAR(200), -- 필요한 도구들 (예: "팬, 주걱, 볼")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX idx_recipe_steps_order ON recipe_steps(recipe_id, step_number);

-- 유니크 제약조건 (같은 레시피 내에서 단계 번호 중복 방지)
ALTER TABLE recipe_steps 
ADD CONSTRAINT uq_recipe_step_number 
UNIQUE (recipe_id, step_number);

-- 외래키 제약조건
ALTER TABLE recipe_steps 
ADD CONSTRAINT fk_recipe_steps_recipe 
FOREIGN KEY (recipe_id) 
REFERENCES recipes(recipe_id) 
ON DELETE CASCADE;

-- 단계 번호 양수 체크
ALTER TABLE recipe_steps 
ADD CONSTRAINT chk_step_number_positive 
CHECK (step_number > 0);

-- 코멘트 추가
COMMENT ON TABLE recipe_steps IS '레시피 조리 단계 테이블 - 1:N 관계';
COMMENT ON COLUMN recipe_steps.step_id IS '단계 고유 ID';
COMMENT ON COLUMN recipe_steps.recipe_id IS '레시피 ID (외래키)';
COMMENT ON COLUMN recipe_steps.step_number IS '단계 순서 번호';
COMMENT ON COLUMN recipe_steps.title IS '단계 제목';
COMMENT ON COLUMN recipe_steps.instruction IS '단계별 상세 조리 방법';
COMMENT ON COLUMN recipe_steps.image_url IS '단계별 참고 이미지';
COMMENT ON COLUMN recipe_steps.estimated_time IS '단계별 예상 소요 시간 (분)';
COMMENT ON COLUMN recipe_steps.temperature IS '조리 온도 정보';
COMMENT ON COLUMN recipe_steps.tips IS '단계별 팁이나 주의사항';
COMMENT ON COLUMN recipe_steps.tools IS '필요한 조리 도구들';