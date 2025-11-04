# 데이터베이스 스키마 분석 결과

## ✅ 정상적으로 연결된 외래 키 관계

### 1. **receipt_items**
- ✅ `user_id` → `user_profiles(id)` ✓

### 2. **recipe_comments**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `recipe_id` → `recipes(id)` ✓
- ✅ `parent_id` → `recipe_comments(id)` ✓ (자기 참조)

### 3. **recipe_likes**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `recipe_id` → `recipes(id)` ✓

### 4. **recipe_stats**
- ✅ `recipe_id` → `recipes(id)` ✓

### 5. **recipes**
- ✅ `category_id` → `recipe_categories(id)` ✓
- ✅ `user_id` → `user_profiles(id)` ✓

### 6. **user_category_preferences**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `category_id` → `recipe_categories(id)` ✓

### 7. **user_favorites**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `recipe_id` → `recipes(id)` ✓

### 8. **user_post_comments**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `post_id` → `user_posts(post_id)` ✓
- ✅ `parent_comment_id` → `user_post_comments(id)` ✓ (자기 참조)

### 9. **user_post_likes**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `post_id` → `user_posts(post_id)` ✓

### 10. **user_posts**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `recipe_id` → `recipes(id)` ✓

### 11. **user_profiles**
- ✅ `id` → `auth.users(id)` ✓ (Supabase Auth 연동)

### 12. **user_recipe_activities**
- ✅ `user_id` → `user_profiles(id)` ✓
- ✅ `recipe_id` → `recipes(id)` ✓

---

## ⚠️ 발견된 문제점

### 1. **user_post_comments 테이블 - 중복 필드**
```sql
comment_id uuid NOT NULL DEFAULT gen_random_uuid(),  -- 사용되지 않음
id uuid NOT NULL DEFAULT gen_random_uuid(),          -- 실제 PK
```
- **문제**: `comment_id`와 `id` 두 개의 UUID 필드가 있음
- **권장**: `comment_id` 필드를 제거하거나, PK를 `comment_id`로 변경

### 2. **recipe_stats 테이블 - 누락된 필드 정의**
```sql
CREATE TABLE public.recipe_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),  -- 이 줄이 보이지 않음
  recipe_id uuid NOT NULL,
  ...
  CONSTRAINT recipe_stats_pkey PRIMARY KEY (id),  -- 하지만 PK로 사용됨
```
- **문제**: `id` 필드 정의가 누락된 것으로 보임
- **확인 필요**: 실제 파일에는 있을 수 있으니 확인 필요

### 3. **user_category_preferences - PK 순서**
```sql
CONSTRAINT user_category_preferences_pkey PRIMARY KEY (category_id, user_id),
```
- **문제**: 일반적으로 복합 PK는 `(user_id, category_id)` 순서가 더 일반적
- **영향**: 기능적으로는 문제 없지만, 인덱스 효율성 측면에서 고려 필요

### 4. **user_recipe_activities - status 필드**
```sql
status text DEFAULT 'viewed'::text,
```
- **문제**: `status` 필드에 CHECK 제약조건이 없음
- **문제**: `activity_type`과 역할이 중복될 수 있음
- **권장**: `status` 필드 제거 또는 CHECK 제약조건 추가

### 5. **외래 키 삭제 정책 누락**
- 대부분의 FK에 `ON DELETE` 정책이 명시되지 않음
- **권장 정책**:
  - `user_profiles` 삭제 시: `CASCADE` (연관 데이터 함께 삭제)
  - `recipes` 삭제 시: `CASCADE` (댓글, 좋아요 등 함께 삭제)
  - `recipe_categories` 삭제 시: `SET NULL` (레시피의 카테고리는 NULL로)

### 6. **recipes 테이블 - video_id UNIQUE 제약**
```sql
video_id text UNIQUE,
```
- **문제**: `video_id`가 UNIQUE인데, 여러 레시피가 같은 YouTube 영상을 사용할 수 있음
- **권장**: UNIQUE 제약 제거 또는 재고려

---

## 📋 제안 사항

### 1. 외래 키 삭제 정책 추가 예시:
```sql
-- recipes 테이블
CONSTRAINT recipes_category_id_fkey 
  FOREIGN KEY (category_id) 
  REFERENCES public.recipe_categories(id) 
  ON DELETE SET NULL;

CONSTRAINT recipes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.user_profiles(id) 
  ON DELETE CASCADE;

-- recipe_comments 테이블
CONSTRAINT recipe_comments_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES public.recipes(id) 
  ON DELETE CASCADE;

-- recipe_likes 테이블
CONSTRAINT recipe_likes_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES public.recipes(id) 
  ON DELETE CASCADE;
```

### 2. user_post_comments 수정:
```sql
-- 옵션 1: comment_id 제거
CREATE TABLE public.user_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  ...
  CONSTRAINT user_post_comments_pkey PRIMARY KEY (id)
);

-- 옵션 2: id 제거하고 comment_id를 PK로
CREATE TABLE public.user_post_comments (
  comment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  ...
  CONSTRAINT user_post_comments_pkey PRIMARY KEY (comment_id)
);
```

### 3. user_recipe_activities status 필드:
```sql
-- 옵션 1: status 제거 (activity_type으로 충분)
-- 옵션 2: status에 CHECK 제약 추가
status text DEFAULT 'viewed'::text 
  CHECK (status IN ('viewed', 'active', 'completed'))
```

---

## ✅ 전체적인 평가

**외래 키 관계는 대체로 잘 연결되어 있습니다.** 
- 모든 주요 관계가 올바르게 설정됨
- 자기 참조 관계도 올바르게 설정됨
- 몇 가지 개선 사항이 있지만, 기능적으로는 문제 없음

**우선순위:**
1. 🔴 **높음**: `user_post_comments` 중복 필드 정리
2. 🟡 **중간**: 외래 키 삭제 정책 추가
3. 🟢 **낮음**: `status` 필드 정리, PK 순서 조정

