-- recipe_stats 테이블에 대한 RLS 정책 설정
-- 조회수 통계는 모든 사용자가 읽고 업데이트할 수 있어야 함

-- 1. RLS 활성화
ALTER TABLE public.recipe_stats ENABLE ROW LEVEL SECURITY;

-- 2. SELECT 정책: 모든 사용자가 조회 가능
CREATE POLICY "recipe_stats_select_policy" ON public.recipe_stats
  FOR SELECT
  USING (true);

-- 3. INSERT 정책: 모든 사용자가 생성 가능 (조회수 통계 생성)
CREATE POLICY "recipe_stats_insert_policy" ON public.recipe_stats
  FOR INSERT
  WITH CHECK (true);

-- 4. UPDATE 정책: 모든 사용자가 업데이트 가능 (조회수 증가)
CREATE POLICY "recipe_stats_update_policy" ON public.recipe_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. DELETE 정책: 삭제는 허용하지 않음 (통계 데이터 보존)
-- DELETE 정책은 생성하지 않음 (기본적으로 거부됨)

