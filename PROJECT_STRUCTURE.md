# Cookit 프로젝트 구조 분석

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [전체 구조도](#전체-구조도)
3. [프론트엔드 (CookitMobile)](#프론트엔드-cookitmobile)
4. [백엔드 (Server)](#백엔드-server)
5. [데이터베이스 구조](#데이터베이스-구조)
6. [주요 기능별 파일 매핑](#주요-기능별-파일-매핑)

---

## 프로젝트 개요

**Cookit**은 AI 기반 요리 레시피 추천 및 관리 모바일 애플리케이션입니다.

### 기술 스택
- **프론트엔드**: React Native (Expo), TypeScript/JavaScript
- **백엔드**: Node.js (Express)
- **데이터베이스**: Supabase (PostgreSQL)
- **AI 서비스**: Google Gemini API
- **인증**: Supabase Auth (Google OAuth 지원)
- **스토리지**: Supabase Storage

---

## 전체 구조도

```
Cookit/
├── CookitMobile/          # React Native 모바일 앱
│   ├── screens/          # 화면 컴포넌트
│   ├── components/       # 재사용 컴포넌트
│   ├── services/         # API 서비스 레이어
│   ├── contexts/         # React Context (상태 관리)
│   ├── lib/              # 라이브러리 설정
│   └── types/            # TypeScript 타입 정의
│
├── Server/               # Node.js 백엔드 서버
│   ├── routes/          # API 라우트
│   ├── services/        # 비즈니스 로직 서비스
│   ├── migrations/      # 데이터베이스 마이그레이션
│   └── upload_to_supabase.cjs  # 데이터 업로드 스크립트
│
└── 문서/                 # 프로젝트 문서
    ├── DB.TXT           # 데이터베이스 스키마
    ├── Cookit_Data_Dictionary.md
    └── ...
```

---

## 프론트엔드 (CookitMobile)

### 📱 앱 진입점
- **`App.js`**: 앱의 최상위 컴포넌트, 네비게이션 설정

### 🗂️ 디렉토리 구조

#### 1. **screens/** - 화면 컴포넌트

##### 홈 화면
- **`Home/HomeMain.js`**: 메인 홈 화면
  - 개인화 추천 레시피
  - 난이도 기반 추천
  - 실시간 인기 레시피 (상위 3개)
  - 유사 레시피 추천
  - Pull-to-Refresh 기능

- **`Home/Ingredients.js`**: 내 냉장고 페이지
  - 재료 목록 3열 그리드 레이아웃
  - 유통기한 관리
  - 재료 추가/수정/삭제

##### 레시피 화면
- **`Recipe/RecipeMain.js`**: 레시피 상세 화면
  - YouTube 영상 재생 (YouTubePlayer 컴포넌트)
  - 단계별 조리법
  - 타임스탬프 기반 영상 구간 재생
  - 음성 제어 기능

- **`Recipe/RecipeStack.js`**: 레시피 네비게이션 스택

- **`Summary.js`**: 레시피 요약 화면
  - 레시피 요약 정보 표시
  - 조회수 증가 처리 (진입 시)
  - YouTube 영상 재생

##### 검색 화면
- **`Search/SearchMain.js`**: 검색 메인 화면
- **`Search/SearchList.js`**: YouTube 검색 결과
  - YouTube API 연동
  - 영상 분석 모달 (YouTubeAnalysisModal)
- **`Search/SearchStack.js`**: 검색 네비게이션 스택

##### 커뮤니티 화면
- **`community/CommunityMain.tsx`**: 커뮤니티 메인
- **`community/CommunityCreate.tsx`**: 게시글 작성
  - 레시피 연결 (필수)
  - 이미지 업로드
  - 태그 선택
- **`community/CommunityDetail.tsx`**: 게시글 상세
- **`community/CommunityStack.tsx`**: 커뮤니티 네비게이션

##### 프로필 화면
- **`Profile/ProfileMain.js`**: 프로필 메인
  - 요리 레벨 설정 모달
  - 통계 정보 표시
- **`Profile/ProfileEdit.js`**: 프로필 수정
- **`Profile/ProfileLikes.js`**: 좋아요한 레시피
- **`Profile/ProfileRecentViewed.js`**: 최근 조회 레시피
- **`Profile/ProfileWeekRecipes.js`**: 주간 레시피
- **`Profile/ProfileHistory.js`**: 요리 기록
- **`Profile/ProfileAlarm.js`**: 알림 설정

##### 영수증 인식 화면
- **`Receipt/ReceiptMain.js`**: 영수증 인식
  - OCR 기능 (영수증 텍스트 추출)
  - 재료 자동 등록
- **`Receipt/ReceiptStack.js`**: 영수증 네비게이션

##### AI 분석 화면
- **`AIAnalyze.js`**: AI 레시피 분석
  - YouTube 영상 분석
  - Gemini API 연동

##### 설정 화면
- **`Setup/`**: 초기 설정 화면들
  - 닉네임 설정
  - 선호도 설정
  - 재료 설정
  - 프로필 설정

#### 2. **components/** - 재사용 컴포넌트

- **`YouTubePlayer.js`**: YouTube 비디오 플레이어
  - 재사용 가능한 컴포넌트
  - Summary, RecipeMain, YouTubeAnalysisModal에서 사용
  - 구간 반복 재생 지원
  - 자동재생 옵션

- **`YouTubeAnalysisModal.js`**: YouTube 영상 분석 모달
  - YouTubePlayer 컴포넌트 사용
  - 영상 분석 시작

- **`RecipeCard.js`**: 레시피 카드 컴포넌트
  - 조회수, 좋아요 수 표시
  - 즐겨찾기 기능
  - 썸네일 이미지

- **`RecipeSelectModal.tsx`**: 레시피 선택 모달
  - 커뮤니티 게시글 작성 시 사용

- **`SearchInput.js`**: 검색 입력 컴포넌트
- **`Sort.js`**: 정렬 컴포넌트
- **`AuthNavigator.js`**: 인증 네비게이터
- **`AuthScreen.tsx`**: 인증 화면
- **`GoogleSignInButton.tsx`**: Google 로그인 버튼
- **`AnalysisFloatingBar.tsx`**: 분석 플로팅 바
- **`WheelDatePicker.js`**: 날짜 선택 휠

#### 3. **services/** - API 서비스 레이어

- **`recipeService.js`**: 레시피 관련 API
  - `getRecommendedRecipes()`: 개인화 추천
  - `getPopularRecipes(limit)`: 인기 레시피
  - `getRecipesByDifficulty(limit)`: 난이도 기반 추천
  - `getSimilarToCookedRecipes(limit)`: 유사 레시피
  - `incrementViewCount(recipeId)`: 조회수 증가
  - `saveRecipe(recipeId, type)`: 레시피 저장
  - `removeRecipe(recipeId, type)`: 레시피 삭제

- **`recipeLikesApi.ts`**: 레시피 좋아요 API
- **`postsApi.ts`**: 커뮤니티 게시글 API
- **`postLikesApi.ts`**: 게시글 좋아요 API
- **`commentsApi.ts`**: 댓글 API
- **`receiptItemsApi.ts`**: 재료 API
- **`userApi.ts`**: 사용자 API
- **`notificationService.js`**: 알림 서비스

#### 4. **contexts/** - 상태 관리

- **`AuthContext.tsx`**: 인증 상태 관리
  - 사용자 로그인/로그아웃
  - 세션 관리

- **`AnalysisContext.tsx`**: 분석 상태 관리
  - YouTube 분석 진행 상태
  - 분석 결과 관리

#### 5. **lib/** - 라이브러리 설정

- **`supabase.ts`**: Supabase 클라이언트 설정

#### 6. **types/** - TypeScript 타입 정의

- **`auth.ts`**: 인증 관련 타입
- **`env.d.ts`**: 환경변수 타입

---

## 백엔드 (Server)

### 🚀 서버 진입점
- **`app.js`**: Express 서버 설정 및 라우팅

### 🗂️ 디렉토리 구조

#### 1. **routes/** - API 라우트

- **`recipes.js`**: 레시피 관련 API
  - `POST /api/recipes/from-ai`: AI 분석 결과 저장
  - `POST /api/recipes/:id/view`: 조회수 증가
  - `GET /api/recipes/:id`: 레시피 상세 조회

- **`recommendations.js`**: 추천 시스템 API
  - `GET /api/recommendations/personalized`: 개인화 추천
  - `GET /api/recommendations/popular`: 인기 레시피
  - `GET /api/recommendations/difficulty`: 난이도 기반 추천
  - `GET /api/recommendations/similar`: 유사 레시피

- **`youtube.js`**: YouTube 분석 API
  - `POST /api/youtube-analysis/start`: 분석 시작
  - `GET /api/youtube-analysis/result/:id`: 분석 결과 조회

- **`auth.js`**: 인증 API
- **`users.js`**: 사용자 API
- **`userPosts.js`**: 커뮤니티 게시글 API
- **`userRecipes.js`**: 사용자 레시피 API
- **`recipeLikes.js`**: 레시피 좋아요 API
- **`postLikes.js`**: 게시글 좋아요 API
- **`comments.js`**: 댓글 API
- **`receiptItems.js`**: 재료 API
- **`receiptOcr.js`**: 영수증 OCR API
- **`receiptList.js`**: 영수증 목록 API
- **`recipeCategories.js`**: 레시피 카테고리 API

#### 2. **services/** - 비즈니스 로직 서비스

- **`supabaseService.js`**: Supabase 데이터베이스 서비스
  - 레시피 CRUD
  - 사용자 프로필 관리
  - 통계 조회

- **`supabaseClient.js`**: Supabase 클라이언트 설정

- **`geminiService.js`**: Google Gemini API 서비스
  - 프롬프트 생성
  - AI 응답 처리

- **`aiPipelineService.js`**: AI 파이프라인 서비스
  - YouTube 영상 분석 파이프라인
  - OCR 처리
  - 텍스트 추출 및 분석

- **`ocrHandler.js`**: OCR 처리 핸들러

#### 3. **migrations/** - 데이터베이스 마이그레이션

- **`enable_recipe_stats_rls.sql`**: recipe_stats 테이블 RLS 정책 설정
  - SELECT: 모든 사용자 조회 가능
  - INSERT: 모든 사용자 생성 가능
  - UPDATE: 모든 사용자 업데이트 가능

#### 4. **스크립트 파일**

- **`upload_to_supabase.cjs`**: 데이터 업로드 스크립트
- **`run_full_pipeline.cjs`**: 전체 파이프라인 실행
- **`send_to_gemini.cjs`**: Gemini API 호출
- **`generate_prompt.cjs`**: 프롬프트 생성
- **`generate_parsed_output.cjs`**: 파싱된 출력 생성
- **`generate_combined_text.cjs`**: 텍스트 합성
- **`ocr_analyze.cjs`**: OCR 분석

---

## 데이터베이스 구조

### 주요 테이블

#### 1. **recipes** - 레시피 테이블
- `id`: UUID (PK)
- `title`: 레시피 제목
- `description`: 설명
- `ingredients`: JSONB (재료 목록)
- `instructions`: JSONB (조리법)
- `prep_time`, `cook_time`: 조리 시간
- `servings`: 인분
- `difficulty_level`: 난이도 (easy/medium/hard)
- `video_url`: YouTube URL
- `source_url`: 원본 URL
- `ai_generated`: AI 생성 여부
- `category_id`: FK → recipe_categories

#### 2. **recipe_stats** - 레시피 통계 테이블
- `id`: UUID (PK)
- `recipe_id`: UUID (FK → recipes.id)
- `view_count`: 조회수
- `favorite_count`: 좋아요 수
- `cook_count`: 요리 완료 수
- `average_rating`: 평균 평점
- **RLS 정책**: 모든 사용자 조회/생성/업데이트 가능

#### 3. **recipe_likes** - 레시피 좋아요 테이블
- `id`: UUID (PK)
- `user_id`: UUID (FK → user_profiles.id)
- `recipe_id`: UUID (FK → recipes.id)
- `created_at`: 생성 시간

#### 4. **user_posts** - 커뮤니티 게시글 테이블
- `post_id`: UUID (PK)
- `user_id`: UUID (FK → user_profiles.id)
- `recipe_id`: UUID (FK → recipes.id, **필수**)
- `title`: 제목
- `content`: 내용 (NOT NULL)
- `image_urls`: ARRAY
- `tags`: ARRAY
- `created_at`, `updated_at`: 타임스탬프

#### 5. **user_profiles** - 사용자 프로필 테이블
- `id`: UUID (PK, FK → auth.users.id)
- `email`: 이메일
- `display_name`: 닉네임
- `avatar_url`: 프로필 이미지
- `cooking_level`: 요리 레벨 (beginner/intermediate/advanced)
- `favorite_cuisines`: ARRAY
- `dietary_restrictions`: ARRAY

#### 6. **receipt_items** - 재료 테이블
- `id`: UUID (PK)
- `user_id`: UUID (FK → user_profiles.id)
- `product_name`: 제품명
- `quantity`: 수량
- `expiry_date`: 유통기한
- `storage_type`: 보관 방법 (냉동/냉장/실온)

#### 7. **recipe_categories** - 레시피 카테고리 테이블
- `id`: UUID (PK)
- `name`: 카테고리명
- `description`: 설명
- `image_url`: 이미지 URL

#### 8. **recipe_comments** - 레시피 댓글 테이블
- `id`: UUID (PK)
- `user_id`: UUID (FK → user_profiles.id)
- `recipe_id`: UUID (FK → recipes.id)
- `content`: 댓글 내용
- `parent_id`: UUID (FK → recipe_comments.id, 대댓글)
- `rating`: 평점
- `created_at`, `updated_at`: 타임스탬프

---

## 주요 기능별 파일 매핑

### 📊 조회수 관리
1. **프론트엔드**: `CookitMobile/screens/Summary.js`
   - Summary 진입 시 조회수 증가

2. **백엔드**: `Server/routes/recipes.js`
   - `POST /api/recipes/:id/view`
   - `recipe_stats.view_count` 증가

3. **데이터베이스**: `recipe_stats` 테이블
   - RLS 정책으로 ANON_KEY 사용 가능

### 🎥 YouTube 영상 재생
1. **컴포넌트**: `CookitMobile/components/YouTubePlayer.js`
   - 재사용 가능한 YouTube 플레이어
   - Summary, RecipeMain, YouTubeAnalysisModal에서 사용

2. **사용 위치**:
   - `CookitMobile/screens/Summary.js`
   - `CookitMobile/screens/Recipe/RecipeMain.js`
   - `CookitMobile/components/YouTubeAnalysisModal.js`

### 🔍 레시피 추천 시스템
1. **프론트엔드**: `CookitMobile/screens/Home/HomeMain.js`
   - 4가지 추천 알고리즘 사용

2. **백엔드**: `Server/routes/recommendations.js`
   - 개인화 추천
   - 인기 레시피 (조회수 기반)
   - 난이도 기반 추천
   - 유사 레시피 추천

3. **서비스**: `CookitMobile/services/recipeService.js`
   - API 호출 래퍼

### 🤖 AI 레시피 분석
1. **프론트엔드**: `CookitMobile/screens/AIAnalyze.js`
2. **백엔드**: `Server/routes/youtube.js`
3. **서비스**: `Server/services/aiPipelineService.js`
   - YouTube 영상 다운로드
   - 프레임 추출
   - OCR 처리
   - Whisper 자막 추출
   - Gemini API 분석

### 📝 커뮤니티 기능
1. **프론트엔드**:
   - `CookitMobile/screens/community/CommunityMain.tsx`
   - `CookitMobile/screens/community/CommunityCreate.tsx`
   - `CookitMobile/screens/community/CommunityDetail.tsx`

2. **백엔드**:
   - `Server/routes/userPosts.js`
   - `Server/routes/postLikes.js`
   - `Server/routes/comments.js`

3. **서비스**:
   - `CookitMobile/services/postsApi.ts`
   - `CookitMobile/services/postLikesApi.ts`
   - `CookitMobile/services/commentsApi.ts`

### 🛒 재료 관리
1. **프론트엔드**: `CookitMobile/screens/Home/Ingredients.js`
2. **백엔드**: `Server/routes/receiptItems.js`
3. **서비스**: `CookitMobile/services/receiptItemsApi.ts`

### 📸 영수증 인식
1. **프론트엔드**: `CookitMobile/screens/Receipt/ReceiptMain.js`
2. **백엔드**: `Server/routes/receiptOcr.js`
3. **서비스**: `Server/services/ocrHandler.js`

---

## 데이터 흐름 예시

### 조회수 증가 흐름
```
사용자 → Summary.js 진입
  → recipeService.incrementViewCount(recipeId)
    → POST /api/recipes/:id/view
      → recipes.js (백엔드)
        → recipe_stats 테이블 UPDATE
          → view_count + 1
  → 홈 화면으로 돌아감
    → useFocusEffect 트리거
      → fetchAllRecipes()
        → 최신 조회수 반영
```

### YouTube 영상 분석 흐름
```
사용자 → SearchList.js에서 영상 선택
  → YouTubeAnalysisModal 열림
    → 분석 시작 버튼 클릭
      → POST /api/youtube-analysis/start
        → youtube.js (백엔드)
          → aiPipelineService 실행
            → 영상 다운로드 → 프레임 추출 → OCR → Whisper → Gemini
              → 분석 결과 저장
                → 클라이언트 폴링
                  → GET /api/youtube-analysis/result/:id
                    → 분석 완료 시 Summary 화면으로 이동
```

---

## 주요 설정 파일

### 프론트엔드
- **`package.json`**: 의존성 관리
- **`app.config.js`**: Expo 앱 설정
- **`babel.config.js`**: Babel 설정
- **`tsconfig.json`**: TypeScript 설정

### 백엔드
- **`package.json`**: 의존성 관리
- **`env.example`**: 환경변수 예시
- **`nodemon.json`**: 개발 서버 설정

---

## 보안 및 권한 관리

### RLS (Row Level Security) 정책
- **recipe_stats**: 모든 사용자 조회/생성/업데이트 가능
- **recipes**: 공개 레시피는 모든 사용자 조회 가능
- **user_posts**: 사용자는 자신의 게시글만 관리 가능
- **receipt_items**: 사용자는 자신의 재료만 관리 가능

### 인증
- Supabase Auth 사용
- Google OAuth 지원
- JWT 토큰 기반 인증

---

## 개발 가이드

### 환경 설정
1. 프론트엔드: `.env` 파일에 `EXPO_PUBLIC_API_BASE_URL` 설정
2. 백엔드: `.env` 파일에 Supabase 및 Gemini API 키 설정

### 데이터베이스 마이그레이션
1. `Server/migrations/enable_recipe_stats_rls.sql` 실행
2. Supabase Dashboard에서 SQL Editor로 실행

### 주요 명령어
```bash
# 프론트엔드 실행
cd CookitMobile
npm start

# 백엔드 실행
cd Server
npm run dev
```

---

## 최근 주요 변경사항

1. **조회수 시스템**
   - Summary 진입 시 자동 증가
   - ANON_KEY + RLS 정책 사용
   - 홈 화면 Pull-to-Refresh로 실시간 반영

2. **YouTubePlayer 컴포넌트화**
   - 재사용 가능한 컴포넌트로 리팩토링
   - Summary, RecipeMain, YouTubeAnalysisModal에서 공통 사용

3. **홈 화면 개선**
   - 인기 레시피 상위 3개 순위 표시
   - Pull-to-Refresh 기능 추가
   - 조회수/좋아요 실시간 업데이트

4. **커뮤니티 기능**
   - 레시피 연결 필수화
   - 이미지 업로드 지원
   - 댓글 및 좋아요 기능

---

*최종 업데이트: 2024년*

