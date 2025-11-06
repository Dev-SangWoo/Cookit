# 📱 Cookit 레시피 DB 연동 가이드

DB에 저장된 레시피 데이터를 프론트엔드에서 보여주는 기능을 구현했습니다!

## 🎯 구현된 기능

### ✅ 백엔드 (서버)
- **사용자별 레시피 관리**: 저장, 즐겨찾기, 생성한 레시피 구분
- **공개 레시피 조회**: 모든 사용자가 볼 수 있는 레시피 목록
- **레시피 상세 정보**: 재료, 조리단계, 영양정보 포함
- **활동 로그**: 조회, 요리, 공유 기록 추적
- **통계 기능**: 조회수, 즐겨찾기 수 자동 업데이트

### ✅ 프론트엔드 (모바일 앱)
- **홈 화면 통합**: DB 레시피 접근 버튼 추가
- **레시피 목록 화면**: 카드 형태로 예쁘게 표시
- **레시피 카드**: 즐겨찾기, 저장 기능 포함
- **사용자 인증**: 로그인한 사용자만 저장/즐겨찾기 가능

## 🗄️ 개선된 데이터베이스 구조

### 핵심 테이블들
```sql
recipes                 # 메인 레시피 테이블
├── recipe_id          # 기본키
├── title, description # 기본 정보
├── ingredients (JSONB) # 재료 배열
├── instructions (JSONB) # 조리단계 배열
├── created_by (UUID)  # 생성자 (NULL = AI생성)
├── is_public          # 공개 여부
├── view_count         # 조회수
└── favorite_count     # 즐겨찾기 수

user_profiles          # 사용자 프로필
├── id (UUID)          # Supabase auth 연동
├── email, display_name
└── cooking_level      # 요리 실력

user_recipes           # 사용자-레시피 관계
├── user_id, recipe_id # 외래키
├── relationship_type  # 'saved', 'favorited', 'created'
├── notes, rating      # 개인 메모, 평점
└── last_cooked_at     # 마지막 요리한 날짜

recipe_activity_logs   # 활동 기록
├── user_id, recipe_id
├── activity_type      # 'viewed', 'cooked', 'shared'
└── created_at
```

## 🚀 설정 방법

### 1️⃣ 데이터베이스 설정

**Supabase 대시보드에서 실행:**
```sql
-- 완전한 DB 설정 (샘플 데이터 포함)
\i Server/database/09_complete_setup.sql
```

또는 개별 파일 순서대로:
```sql
\i Server/database/06_create_user_tables.sql
\i Server/database/07_update_recipes_table.sql  
\i Server/database/08_create_helper_functions.sql
```

### 2️⃣ 서버 실행

```bash
cd Server
npm install
npm start
```

### 3️⃣ 모바일 앱 실행

```bash
cd CookitMobile
npm install
npx expo start
```

## 📱 사용법

### 홈 화면에서
1. **"모든 레시피"** 버튼 → 공개 레시피 목록
2. **"저장한 레시피"** 버튼 → 내가 저장한 레시피 (로그인 필요)
3. **"즐겨찾기"** 버튼 → 즐겨찾기한 레시피 (로그인 필요)

### 레시피 목록에서
- **레시피 카드 터치** → 상세 화면으로 이동
- **❤️ 버튼** → 즐겨찾기 추가/제거
- **📖 버튼** → 레시피 저장/제거
- **새로고침** → 당겨서 목록 새로고침
- **무한스크롤** → 아래로 스크롤하면 더 로드

## 🔄 API 엔드포인트

### 공개 레시피
```javascript
GET /api/user-recipes/public
- page, limit, category, difficulty, sort 파라미터 지원
```

### 내 레시피 (인증 필요)
```javascript
GET /api/user-recipes/my?type=saved
- type: 'all', 'saved', 'favorited', 'created'

POST /api/user-recipes/save
- recipe_id, type('saved'|'favorited'), notes, rating

DELETE /api/user-recipes/:recipe_id?type=saved
```

### 레시피 상세
```javascript
GET /api/user-recipes/detail/:recipe_id
- 재료, 조리단계, 사용자 관계 정보 포함
- 조회수 자동 증가
```

## 🎨 UI 컴포넌트

### RecipeCard
- 썸네일 이미지 + AI 배지
- 제목, 설명, 메타 정보 (시간, 인분, 난이도)
- 즐겨찾기/저장 버튼
- 조회수, 좋아요 수 표시

### RecipeList  
- 2열 그리드 레이아웃
- 무한스크롤 + 새로고침
- 빈 상태 처리
- 로딩 상태 표시

## 🔐 보안 기능

- **RLS (Row Level Security)** 적용
- 사용자는 자신의 데이터만 접근 가능
- 공개 레시피는 모든 사용자 조회 가능
- JWT 토큰 기반 인증

## 📊 샘플 데이터

설정 완료 후 다음 샘플 레시피가 생성됩니다:
- **AI 김치찌개** (쉬움, 2인분, 25분)
- **AI 계란말이** (쉬움, 2인분, 13분) 
- **AI 파스타** (보통, 2인분, 20분)

## 🧪 테스트 방법

1. **모바일 앱 실행** → 홈 화면에서 "모든 레시피" 터치
2. **샘플 레시피 확인** → 3개 레시피 카드 표시 확인
3. **레시피 터치** → 상세 화면으로 이동 확인
4. **로그인 후** → 즐겨찾기/저장 기능 테스트
5. **YouTube 분석** → AI 파이프라인으로 새 레시피 생성 테스트

## 🎉 완성!

이제 DB의 레시피 데이터가 프론트엔드에서 예쁘게 표시됩니다! 
사용자별 저장/즐겨찾기 기능까지 완벽하게 연동되어 있어요. 🍳✨
