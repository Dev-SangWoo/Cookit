# 📚 Cookit 프로젝트 - 자료사전 (Data Dictionary)

## 📋 개요
실제 데이터베이스 스키마를 기반으로 작성된 Cookit 프로젝트의 자료사전입니다.

---

## 1. 사용자 관련 데이터

### 1.1 사용자 프로필 (user_profiles)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, FK → auth.users(id) | 사용자 고유 식별자 (Supabase Auth 연동) |
| email | TEXT | - | NULL | 사용자 이메일 주소 |
| display_name | TEXT | - | NULL | 사용자 표시명 (닉네임) |
| avatar_url | TEXT | - | NULL | 프로필 이미지 URL |
| bio | TEXT | - | NULL | 자기소개 |
| cooking_level | TEXT | - | CHECK 제약 | 요리 실력 ('beginner', 'intermediate', 'advanced') |
| favorite_cuisines | ARRAY | - | NULL | 선호 요리 종류 배열 |
| dietary_restrictions | ARRAY | - | NULL | 알레르기/식이 제한 배열 |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 계정 생성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 정보 수정일시 |

---

## 2. 레시피 관련 데이터

### 2.1 레시피 기본 정보 (recipes)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 레시피 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 작성자 ID |
| title | TEXT | - | NOT NULL | 레시피 제목 |
| description | TEXT | - | NULL | 레시피 설명 |
| ingredients | JSONB | - | NOT NULL | 재료 정보 (JSON 배열) |
| instructions | JSONB | - | NOT NULL | 조리 방법 (JSON 배열) |
| prep_time | INTEGER | - | NULL | 준비 시간 (분) |
| cook_time | INTEGER | - | NULL | 조리 시간 (분) |
| servings | INTEGER | - | NULL | 인분 수 |
| difficulty_level | TEXT | - | CHECK 제약 | 난이도 ('easy', 'medium', 'hard') |
| category_id | UUID | 36 | FK → recipe_categories(id) | 레시피 카테고리 ID |
| image_urls | ARRAY | - | NULL | 레시피 이미지 URL 배열 |
| tags | ARRAY | - | NULL | 태그 배열 |
| nutrition_info | JSONB | - | NULL | 영양 정보 (JSON) |
| source_url | VARCHAR | - | NULL | 원본 URL |
| ai_generated | BOOLEAN | - | DEFAULT false | AI 생성 여부 |
| ai_analysis_data | JSONB | - | NULL | AI 분석 데이터 |
| video_url | TEXT | - | NULL | 관련 영상 URL |
| ai_prompt | TEXT | - | NULL | AI 프롬프트 |
| is_public | BOOLEAN | - | DEFAULT true | 공개 여부 |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 수정일시 |

### 2.2 레시피 카테고리 (recipe_categories)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 카테고리 고유 식별자 |
| name | TEXT | - | NOT NULL, UNIQUE | 카테고리명 |
| description | TEXT | - | NULL | 카테고리 설명 |
| image_url | TEXT | - | NULL | 카테고리 이미지 URL |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 생성일시 |

### 2.3 레시피 좋아요 (recipe_likes)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 좋아요 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 사용자 ID |
| recipe_id | UUID | 36 | FK → recipes(id) | 레시피 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 좋아요 생성일시 |

### 2.4 레시피 댓글 (recipe_comments)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 댓글 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 작성자 ID |
| recipe_id | UUID | 36 | FK → recipes(id) | 레시피 ID |
| content | TEXT | - | NOT NULL | 댓글 내용 |
| parent_id | UUID | 36 | FK → recipe_comments(id) | 대댓글인 경우 부모 댓글 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 작성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 수정일시 |

### 2.5 레시피 통계 (recipe_stats)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 통계 고유 식별자 |
| recipe_id | UUID | 36 | FK → recipes(id) | 레시피 ID |
| view_count | INTEGER | - | DEFAULT 0 | 조회수 |
| favorite_count | INTEGER | - | DEFAULT 0 | 즐겨찾기 수 |
| custom_count | INTEGER | - | DEFAULT 0 | 커스텀 수 |
| cook_count | INTEGER | - | DEFAULT 0 | 요리 횟수 |
| average_rating | NUMERIC | - | DEFAULT 0.00 | 평균 평점 |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 수정일시 |

### 2.6 사용자 즐겨찾기 (user_favorites)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 즐겨찾기 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 사용자 ID |
| recipe_id | UUID | 36 | FK → recipes(id) | 레시피 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 즐겨찾기 생성일시 |

### 2.7 사용자 레시피 활동 (user_recipe_activities)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 활동 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 사용자 ID |
| recipe_id | UUID | 36 | FK → recipes(id) | 레시피 ID |
| activity_type | TEXT | - | NOT NULL, CHECK 제약 | 활동 유형 ('viewed', 'favorited', 'cooked', 'shared', 'rated') |
| activity_data | JSONB | - | NULL | 활동 관련 추가 데이터 |
| status | TEXT | - | DEFAULT 'viewed' | 활동 상태 |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 활동 발생일시 |

---

## 3. 커뮤니티 관련 데이터

### 3.1 게시글 (user_posts)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| post_id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 게시글 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 작성자 ID |
| title | TEXT | - | NOT NULL | 게시글 제목 |
| content | TEXT | - | NOT NULL | 게시글 내용 |
| image_urls | ARRAY | - | NULL | 첨부 이미지 URL 배열 |
| tags | ARRAY | - | NULL | 태그 배열 |
| recipe_id | UUID | 36 | FK → recipes(id) | 관련 레시피 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 작성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 수정일시 |

### 3.2 게시글 좋아요 (user_post_likes)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 좋아요 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 사용자 ID |
| post_id | UUID | 36 | FK → user_posts(post_id) | 게시글 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 좋아요 생성일시 |

### 3.3 게시글 댓글 (user_post_comments)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 댓글 고유 식별자 |
| comment_id | UUID | 36 | DEFAULT gen_random_uuid() | 댓글 ID (중복) |
| user_id | UUID | 36 | FK → user_profiles(id) | 작성자 ID |
| post_id | UUID | 36 | FK → user_posts(post_id) | 게시글 ID |
| content | TEXT | - | NOT NULL | 댓글 내용 |
| parent_comment_id | UUID | 36 | FK → user_post_comments(id) | 대댓글인 경우 부모 댓글 ID |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 작성일시 |
| updated_at | TIMESTAMPTZ | - | DEFAULT now() | 수정일시 |

---

## 4. 냉장고 관련 데이터

### 4.1 영수증 재료 (receipt_items)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| id | UUID | 36 | PK, DEFAULT gen_random_uuid() | 재료 고유 식별자 |
| user_id | UUID | 36 | FK → user_profiles(id) | 소유자 ID |
| product_name | TEXT | - | NOT NULL | 상품명 |
| quantity | INTEGER | - | NOT NULL, DEFAULT 1 | 수량 |
| unit | TEXT | - | NULL | 단위 |
| expiry_date | DATE | - | NULL | 유통기한 |
| created_at | TIMESTAMPTZ | - | DEFAULT now() | 등록일시 |

---

## 5. 사용자 선호도 데이터

### 5.1 사용자 카테고리 선호도 (user_category_preferences)
| 항목명 | 데이터 타입 | 길이 | 제약조건 | 설명 |
|--------|-------------|------|----------|------|
| user_id | UUID | 36 | PK, FK → user_profiles(id) | 사용자 ID |
| category_id | UUID | 36 | PK, FK → recipe_categories(id) | 카테고리 ID |

---

## 6. JSONB 데이터 구조

### 6.1 레시피 재료 (ingredients JSONB)
```json
[
  {
    "name": "재료명",
    "quantity": "수량",
    "unit": "단위",
    "notes": "특이사항"
  }
]
```

### 6.2 레시피 조리법 (instructions JSONB)
```json
[
  {
    "step": 1,
    "instruction": "조리 설명",
    "time_required": 5,
    "image_url": "이미지 URL",
    "video_url": "영상 URL"
  }
]
```

### 6.3 영양 정보 (nutrition_info JSONB)
```json
{
  "calories": 300,
  "protein": 15.5,
  "carbs": 45.2,
  "fat": 8.3,
  "fiber": 5.1
}
```

### 6.4 AI 분석 데이터 (ai_analysis_data JSONB)
```json
{
  "confidence_score": 0.85,
  "extracted_ingredients": ["재료1", "재료2"],
  "cooking_method": "볶기",
  "difficulty_analysis": "medium",
  "processing_time": 120
}
```

### 6.5 활동 데이터 (activity_data JSONB)
```json
{
  "rating": 4.5,
  "cooking_time": 30,
  "notes": "맛있었어요",
  "photos": ["url1", "url2"]
}
```

---

## 7. 제약조건 (Constraints)

### 7.1 CHECK 제약조건
| 테이블 | 컬럼 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_profiles | cooking_level | IN ('beginner', 'intermediate', 'advanced') | 요리 실력 레벨 |
| recipes | difficulty_level | IN ('easy', 'medium', 'hard') | 난이도 레벨 |
| user_recipe_activities | activity_type | IN ('viewed', 'favorited', 'cooked', 'shared', 'rated') | 활동 유형 |

### 7.2 외래키 제약조건
| 테이블 | 컬럼 | 참조 테이블 | 참조 컬럼 | 설명 |
|--------|------|-------------|-----------|------|
| user_profiles | id | auth.users | id | Supabase Auth 연동 |
| recipes | user_id | user_profiles | id | 레시피 작성자 |
| recipes | category_id | recipe_categories | id | 레시피 카테고리 |
| recipe_likes | user_id | user_profiles | id | 좋아요 사용자 |
| recipe_likes | recipe_id | recipes | id | 좋아요 레시피 |
| recipe_comments | user_id | user_profiles | id | 댓글 작성자 |
| recipe_comments | recipe_id | recipes | id | 댓글 레시피 |
| recipe_comments | parent_id | recipe_comments | id | 대댓글 |
| user_posts | user_id | user_profiles | id | 게시글 작성자 |
| user_posts | recipe_id | recipes | id | 관련 레시피 |
| user_post_likes | user_id | user_profiles | id | 좋아요 사용자 |
| user_post_likes | post_id | user_posts | post_id | 좋아요 게시글 |
| user_post_comments | user_id | user_profiles | id | 댓글 작성자 |
| user_post_comments | post_id | user_posts | post_id | 댓글 게시글 |
| user_post_comments | parent_comment_id | user_post_comments | id | 대댓글 |
| user_favorites | user_id | user_profiles | id | 즐겨찾기 사용자 |
| user_favorites | recipe_id | recipes | id | 즐겨찾기 레시피 |
| user_recipe_activities | user_id | user_profiles | id | 활동 사용자 |
| user_recipe_activities | recipe_id | recipes | id | 활동 레시피 |
| user_category_preferences | user_id | user_profiles | id | 선호도 사용자 |
| user_category_preferences | category_id | recipe_categories | id | 선호도 카테고리 |
| receipt_items | user_id | user_profiles | id | 재료 소유자 |
| recipe_stats | recipe_id | recipes | id | 통계 레시피 |

---

## 8. 인덱스 및 성능 최적화

### 8.1 권장 인덱스
| 테이블 | 컬럼 | 인덱스 타입 | 설명 |
|--------|------|-------------|------|
| recipes | is_public | B-tree | 공개 레시피 조회 최적화 |
| recipes | ai_generated | B-tree | AI 생성 레시피 조회 최적화 |
| recipes | created_at | B-tree | 최신 레시피 조회 최적화 |
| user_posts | created_at | B-tree | 최신 게시글 조회 최적화 |
| user_recipe_activities | user_id, activity_type | Composite | 사용자 활동 조회 최적화 |
| receipt_items | user_id, expiry_date | Composite | 사용자별 유통기한 조회 최적화 |

### 8.2 RLS (Row Level Security) 정책
| 테이블 | 정책명 | 설명 |
|--------|--------|------|
| user_profiles | Users can view their own profile | 사용자는 자신의 프로필만 조회 가능 |
| recipes | Public recipes are viewable by all | 공개 레시피는 모든 사용자가 조회 가능 |
| user_posts | Users can manage their own posts | 사용자는 자신의 게시글만 관리 가능 |
| receipt_items | Users can manage their own ingredients | 사용자는 자신의 재료만 관리 가능 |

---

## 9. 데이터 무결성 규칙

### 9.1 비즈니스 규칙
1. **사용자 프로필**: 이메일은 고유해야 함
2. **레시피**: 제목은 필수, 재료와 조리법은 JSONB로 저장
3. **게시글**: 제목과 내용은 필수
4. **댓글**: 내용은 필수, 대댓글은 2단계까지만 허용
5. **재료**: 상품명과 수량은 필수
6. **통계**: 조회수, 좋아요 수는 0 이상이어야 함

### 9.2 데이터 검증 규칙
1. **이메일 형식**: RFC 5322 표준 준수
2. **URL 형식**: HTTP/HTTPS 프로토콜만 허용
3. **JSONB 데이터**: 유효한 JSON 형식이어야 함
4. **날짜 형식**: ISO 8601 표준 준수
5. **UUID 형식**: RFC 4122 표준 준수

---

## 10. 데이터베이스 성능 고려사항

### 10.1 파티셔닝 전략
- **user_recipe_activities**: 날짜별 파티셔닝 고려
- **receipt_items**: 사용자별 파티셔닝 고려

### 10.2 백업 및 복구
- **일일 백업**: 전체 데이터베이스
- **실시간 복제**: 읽기 전용 복제본
- **포인트 인 타임 복구**: 7일간 보관

### 10.3 모니터링 지표
- **쿼리 성능**: 평균 응답 시간 < 100ms
- **연결 풀**: 최대 100개 동시 연결
- **디스크 사용량**: 80% 이하 유지
- **CPU 사용률**: 70% 이하 유지

이 자료사전은 실제 데이터베이스 스키마를 기반으로 작성되었으며, Cookit 프로젝트의 모든 데이터 구조와 제약조건을 정확하게 반영하고 있습니다.
