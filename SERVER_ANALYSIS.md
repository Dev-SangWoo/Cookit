# Cookit 서버 분석 문서

## 📋 목차
1. [서버 개요](#서버-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [주요 API 엔드포인트](#주요-api-엔드포인트)
4. [서비스 레이어](#서비스-레이어)
5. [데이터 흐름](#데이터-흐름)
6. [기술 스택 및 의존성](#기술-스택-및-의존성)
7. [주요 기능 상세](#주요-기능-상세)

---

## 서버 개요

**Cookit Server**는 Node.js + Express 기반의 RESTful API 서버로, 모바일 앱을 위한 백엔드 서비스를 제공합니다.

### 주요 역할
- YouTube 영상 분석 및 레시피 생성
- 레시피 추천 시스템
- 사용자 인증 및 프로필 관리
- 커뮤니티 게시글 관리
- 재료 관리 (영수증 OCR)
- 레시피 통계 관리

---

## 프로젝트 구조

```
Server/
├── app.js                    # Express 서버 진입점
├── package.json              # 의존성 관리
├── env.example              # 환경변수 예시
├── nodemon.json             # 개발 서버 설정
│
├── routes/                   # API 라우트 (15개 파일)
│   ├── auth.js              # 인증 관련
│   ├── users.js             # 사용자 관리
│   ├── recipes.js           # 레시피 CRUD
│   ├── recommendations.js   # 추천 시스템 (4가지 알고리즘)
│   ├── youtube.js           # YouTube 검색 및 인기 영상
│   ├── ai.js                # AI 분석 관련
│   ├── userPosts.js         # 커뮤니티 게시글
│   ├── comments.js          # 댓글 관리
│   ├── postLikes.js         # 게시글 좋아요
│   ├── recipeLikes.js       # 레시피 좋아요
│   ├── userRecipes.js       # 사용자 레시피
│   ├── receiptItems.js      # 재료 관리
│   ├── receiptOcr.js        # 영수증 OCR
│   ├── receiptList.js        # 영수증 목록
│   └── recipeCategories.js   # 레시피 카테고리
│
├── services/                 # 비즈니스 로직 서비스
│   ├── supabaseClient.js    # Supabase 클라이언트 설정
│   ├── supabaseService.js   # Supabase 데이터베이스 작업
│   ├── geminiService.js     # Google Gemini API 연동
│   ├── aiPipelineService.js # AI 파이프라인 (OCR + Whisper + Gemini)
│   └── ocrHandler.js        # OCR 처리 핸들러
│
├── migrations/               # 데이터베이스 마이그레이션
│   └── enable_recipe_stats_rls.sql  # RLS 정책 설정
│
├── assets/                   # 정적 파일
│   └── default_thumbnail.png
│
├── logs/                     # 로그 파일
├── video_files/             # 다운로드된 영상 파일
├── temp_frames/              # 임시 프레임 파일
├── whisper_sub/              # Whisper 자막 파일
├── combined_sub/             # 통합 자막 파일
├── prompt_out/               # Gemini 프롬프트 출력
└── parsed_out/               # 파싱된 출력 파일
```

---

## 주요 API 엔드포인트

### 1. 인증 및 사용자 (`/api/auth`, `/api/users`)
- `POST /api/auth/login` - 로그인
- `GET /api/users/:id` - 사용자 정보 조회
- `PUT /api/users/:id` - 사용자 정보 수정

### 2. 레시피 관리 (`/api/recipes`)
- `GET /api/recipes` - 레시피 목록 조회
- `GET /api/recipes/:id` - 레시피 상세 조회
- `POST /api/recipes/from-ai` - AI 분석 결과 저장
- `POST /api/recipes/:id/view` - 조회수 증가
- `PUT /api/recipes/:id` - 레시피 수정
- `DELETE /api/recipes/:id` - 레시피 삭제

### 3. 추천 시스템 (`/api/recommendations`)
- `GET /api/recommendations/user` - 개인화 추천 (선호 요리 기반)
- `GET /api/recommendations/popular` - 인기 레시피 (조회수 기반)
- `GET /api/recommendations/by-difficulty` - 난이도 기반 추천
- `GET /api/recommendations/similar-to-cooked` - 유사 레시피 (완성한 요리 기반)

### 4. YouTube 관련 (`/api/youtube`)
- `GET /api/youtube/search` - YouTube 영상 검색
  - 요리 키워드 자동 추가
  - Shorts 필터링 (60초 미만 제외)
  - 영상 상세 정보 포함
- `GET /api/youtube/trending` - 인기 요리 영상

### 5. AI 분석 (`/api/ai`, `/api/youtube-analysis`)
- `POST /api/ai/analyze-youtube` - YouTube 영상 분석 시작
- `GET /api/ai/status/:id` - 분석 상태 확인
- `GET /api/youtube-analysis/result/:id` - 분석 결과 조회

### 6. 커뮤니티 (`/api/user-posts`, `/api/comments`, `/api/post-likes`)
- `GET /api/user-posts` - 게시글 목록
- `POST /api/user-posts` - 게시글 작성 (레시피 연결 필수)
- `GET /api/user-posts/:id` - 게시글 상세
- `PUT /api/user-posts/:id` - 게시글 수정
- `DELETE /api/user-posts/:id` - 게시글 삭제
- `POST /api/comments` - 댓글 작성
- `POST /api/post-likes` - 게시글 좋아요 토글

### 7. 재료 관리 (`/api/receipt-items`, `/api/receipt/ocr`)
- `GET /api/receipt-items` - 재료 목록 조회
- `POST /api/receipt-items` - 재료 추가
- `PUT /api/receipt-items/:id` - 재료 수정
- `DELETE /api/receipt-items/:id` - 재료 삭제
- `POST /api/receipt/ocr` - 영수증 OCR 처리

### 8. 레시피 좋아요 (`/api/recipe-likes`)
- `POST /api/recipe-likes` - 레시피 좋아요 추가
- `DELETE /api/recipe-likes/:id` - 레시피 좋아요 삭제
- `GET /api/recipe-likes/user/:userId` - 사용자가 좋아요한 레시피 목록

---

## 서비스 레이어

### 1. SupabaseService (`services/supabaseService.js`)
레시피 데이터베이스 작업을 담당하는 서비스 클래스

**주요 메서드:**
- `saveRecipe(recipeData)` - 레시피 저장
- `getRecipes(options)` - 레시피 목록 조회 (페이지네이션, AI 필터 지원)
- `getRecipeById(recipeId)` - 레시피 상세 조회 (recipe_stats JOIN)
- `updateRecipe(recipeId, updateData)` - 레시피 수정
- `deleteRecipe(recipeId)` - 레시피 삭제

### 2. GeminiService (`services/geminiService.js`)
Google Gemini API를 사용한 레시피 생성 서비스

**주요 기능:**
- `generateRecipeFromText(combinedText, videoUrl)` - 텍스트 기반 레시피 생성
- `generateRecipeFromVideoAndText(videoPath, combinedText, videoUrl)` - 영상+텍스트 분석
- `parseRecipeResponse(responseText)` - Gemini 응답 파싱 (다양한 형식 지원)

**모델 설정:**
- 모델: `gemini-2.5-pro`
- Temperature: 0.7
- Max Output Tokens: 2048

**프롬프트 특징:**
- 단계별 타임스탬프 요구 (HH:MM:SS 형식)
- 세부 조리 동작 구조화 (재료, 도구, 시간, 팁 포함)
- JSON 형식 출력

### 3. AIPipelineService (`services/aiPipelineService.js`)
YouTube 영상 분석 파이프라인 서비스

**주요 메서드:**
- `analyzeYouTubeVideo(youtubeUrl, options)` - YouTube 영상 분석
- `analyzeUploadedVideo(videoPath, options)` - 업로드 영상 분석
- `downloadYouTubeContent(url)` - 영상 및 오디오 다운로드
- `processAudioWithWhisper(audioPath)` - Whisper 음성 인식
- `downloadSubtitles(url)` - YouTube 자막 다운로드
- `combineTexts({ ocr, whisper, subtitle })` - 텍스트 통합
- `saveRecipeToDatabase(recipe, metadata)` - 레시피 DB 저장

**처리 플로우:**
1. YouTube 영상/오디오 다운로드 (yt-dlp 사용)
2. 병렬 처리:
   - OCR (Tesseract.js) - 영상 프레임에서 텍스트 추출
   - Whisper - 오디오 음성 인식
   - YouTube 자막 다운로드
3. 텍스트 통합
4. Gemini API로 레시피 생성
5. Supabase에 자동 저장
6. 임시 파일 정리

### 4. OCR Handler (`services/ocrHandler.js`)
영수증 OCR 처리 핸들러

**주요 기능:**
- `performOCR(imagePath, userId)` - OCR 실행
- `cleanOcrText(text)` - OCR 텍스트 보정
- `extractItemsFromOcr(text)` - 상품명 및 수량 추출

**OCR 보정 규칙:**
- `|`, `ㅣ`, `I`, `l` → `1`
- `O`, `o` → `0`
- `S` → `5`
- `B` → `8`
- `Z` → `2`
- 특수문자 정리 및 공백 정규화

---

## 데이터 흐름

### 1. YouTube 영상 분석 플로우

```
클라이언트
  ↓ POST /api/ai/analyze-youtube
서버 (routes/ai.js)
  ↓
AIPipelineService.analyzeYouTubeVideo()
  ├─→ YouTube 다운로드 (yt-dlp)
  ├─→ OCR 처리 (Tesseract.js)
  ├─→ Whisper 음성 인식 (Python)
  └─→ 자막 다운로드 (yt-dlp)
  ↓
텍스트 통합
  ↓
GeminiService.generateRecipeFromVideoAndText()
  ↓
Gemini API 호출
  ↓
응답 파싱
  ↓
SupabaseService.saveRecipe()
  ↓
Supabase DB 저장
  ↓
클라이언트에 결과 반환
```

### 2. 레시피 추천 플로우

```
클라이언트
  ↓ GET /api/recommendations/personalized
서버 (routes/recommendations.js)
  ↓
인증 확인 (requireAuth)
  ↓
사용자 프로필 조회 (favorite_cuisines, dietary_restrictions)
  ↓
카테고리 매핑 (recipe_categories)
  ↓
레시피 조회 (category_id 필터)
  ├─→ recipe_stats JOIN (조회수, 좋아요)
  ├─→ recipe_categories JOIN
  └─→ recipe_likes JOIN (좋아요 상태)
  ↓
dietary_restrictions 필터링
  ↓
좋아요 상태 추가
  ↓
클라이언트에 결과 반환
```

### 3. 조회수 증가 플로우

```
클라이언트
  ↓ POST /api/recipes/:id/view
서버 (routes/recipes.js)
  ↓
레시피 존재 확인
  ↓
recipe_stats 조회 (ANON_KEY 사용)
  ↓
없으면 생성 (view_count: 1)
있으면 증가 (view_count + 1)
  ↓
RLS 정책으로 업데이트
  ↓
클라이언트에 결과 반환
```

### 4. 영수증 OCR 플로우

```
클라이언트
  ↓ POST /api/receipt/ocr (이미지 파일)
서버 (routes/receiptOcr.js)
  ↓
Multer 파일 업로드
  ↓
OCR Handler.performOCR()
  ├─→ Tesseract.js OCR 실행 (kor+eng)
  ├─→ 텍스트 보정
  └─→ 상품명 및 수량 추출
  ↓
클라이언트에 결과 반환 (사용자 확인 후 저장)
```

---

## 기술 스택 및 의존성

### 핵심 의존성

```json
{
  "@google/generative-ai": "^0.24.1",    // Gemini API
  "@supabase/supabase-js": "^2.55.0",    // Supabase 클라이언트
  "express": "^4.21.2",                  // 웹 프레임워크
  "axios": "^1.13.1",                    // HTTP 클라이언트
  "cors": "^2.8.5",                      // CORS 설정
  "helmet": "^8.0.0",                    // 보안 미들웨어
  "morgan": "^1.10.0",                   // 로깅 미들웨어
  "multer": "^2.0.2",                    // 파일 업로드
  "tesseract.js": "^6.0.1",              // OCR 처리
  "sharp": "^0.34.3"                     // 이미지 처리
}
```

### 외부 도구
- **yt-dlp**: YouTube 영상/오디오 다운로드
- **ffmpeg**: 영상 오디오 추출
- **Python Whisper**: 음성 인식 (별도 스크립트)

---

## 주요 기능 상세

### 1. 추천 시스템 (4가지 알고리즘)

#### 1.1 개인화 추천 (`/api/recommendations/user`)
- **기준**: 사용자의 `favorite_cuisines` 기반
- **프로세스**:
  1. 사용자 프로필에서 선호 요리 조회
  2. `recipe_categories` 테이블과 매핑
  3. 해당 카테고리의 레시피 조회
  4. `dietary_restrictions` 필터링
- **대체**: 선호 요리 정보가 없으면 최신 레시피 반환

#### 1.2 인기 레시피 (`/api/recommendations/popular`)
- **기준**: `recipe_stats.view_count` 기준 정렬
- **특징**: 인증 없이도 접근 가능 (토큰이 있으면 좋아요 상태 포함)

#### 1.3 난이도 기반 추천 (`/api/recommendations/by-difficulty`)
- **기준**: 사용자의 `cooking_level` 매핑
  - `beginner` → `easy`
  - `intermediate` → `medium`
  - `advanced` → `hard`
- **대체**: 레벨 정보가 없으면 `easy` 추천

#### 1.4 유사 레시피 (`/api/recommendations/similar-to-cooked`)
- **기준**: 사용자가 완성한 요리의 카테고리 기반
- **프로세스**:
  1. `user_posts`에서 완성한 레시피 ID 조회
  2. 해당 레시피들의 카테고리 추출
  3. 빈도수 기반으로 카테고리 정렬
  4. 같은 카테고리의 레시피 추천 (완성한 것 제외)
- **대체**: 완성한 요리가 없으면 최신 레시피 반환

### 2. AI 파이프라인

#### 2.1 텍스트 추출 (3가지 소스)
- **OCR**: Tesseract.js로 영상 프레임에서 텍스트 추출
- **Whisper**: Python Whisper로 오디오 음성 인식
- **YouTube 자막**: yt-dlp로 자막 다운로드 (한국어)

#### 2.2 텍스트 통합
```javascript
[OCR 텍스트]
{OCR 결과}

[자막 텍스트]
{자막 내용}

[Whisper 텍스트]
{Whisper 결과}
```

#### 2.3 Gemini 분석
- **입력**: 영상 파일 + 통합 텍스트
- **출력**: 구조화된 JSON 레시피
- **특징**: 타임스탬프 포함 (HH:MM:SS 형식)

### 3. 조회수 관리

#### 3.1 RLS 정책
- `recipe_stats` 테이블에 RLS 활성화
- 모든 사용자 SELECT/INSERT/UPDATE 가능 (ANON_KEY 사용)
- 보안: RLS 정책으로 접근 제어

#### 3.2 조회수 증가 로직
1. 레시피 존재 확인
2. `recipe_stats` 레코드 확인
3. 없으면 생성 (`view_count: 1`)
4. 있으면 증가 (`view_count + 1`)
5. `updated_at` 타임스탬프 업데이트

### 4. 좋아요 시스템

#### 4.1 레시피 좋아요 (`routes/recipeLikes.js`)
- 좋아요 추가/삭제 시 `recipe_stats.favorite_count` 자동 업데이트
- 사용자별 좋아요 상태 관리

#### 4.2 게시글 좋아요 (`routes/postLikes.js`)
- 커뮤니티 게시글 좋아요 토글
- 중복 방지 로직 포함

### 5. 보안 및 인증

#### 5.1 CORS 설정
- 환경변수 `ALLOWED_ORIGINS` 기반
- 모바일 환경 지원 (origin이 undefined인 경우 허용)

#### 5.2 인증 미들웨어
- `requireAuth`: Bearer 토큰 기반 인증
- Supabase Auth로 토큰 검증
- 일부 엔드포인트는 선택적 인증 (비로그인 사용자 지원)

#### 5.3 보안 미들웨어
- `helmet`: 기본 보안 헤더 설정
- `morgan`: HTTP 요청 로깅

### 6. 파일 관리

#### 6.1 임시 파일
- `temp_frames/`: OCR용 프레임 파일
- `video_files/`: 다운로드된 영상 파일
- `whisper_sub/`: Whisper 자막 파일
- 처리 완료 후 자동 정리

#### 6.2 업로드 파일
- `uploads/receipts/`: 영수증 이미지
- Multer를 사용한 파일 업로드 처리

---

## 환경 변수 설정

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# 서버 설정
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,exp://localhost:8081
```

---

## 에러 처리

### 전역 에러 핸들러
- 모든 라우트에서 발생하는 에러를 캐치
- 개발 환경: 에러 메시지 포함
- 프로덕션 환경: 일반적인 에러 메시지

### 404 처리
- 정의되지 않은 경로 요청 시 404 응답
- 요청한 경로 정보 포함

---

## 로깅

### Morgan 미들웨어
- 모든 HTTP 요청 로깅
- `combined` 형식 사용

### 콘솔 로깅
- 주요 작업 단계별 로깅
- 이모지를 사용한 시각적 구분:
  - ✅ 성공
  - ❌ 오류
  - ⚠️ 경고
  - 📝 정보
  - 🔍 처리 중

---

## 성능 최적화

### 1. 병렬 처리
- OCR, Whisper, 자막 다운로드를 `Promise.allSettled`로 병렬 처리
- 실패한 작업도 다른 작업을 방해하지 않음

### 2. 데이터베이스 조회 최적화
- Supabase JOIN을 사용한 단일 쿼리
- `recipe_stats`, `recipe_categories`, `recipe_likes` 한 번에 조회

### 3. 파일 정리
- 처리 완료 후 임시 파일 자동 삭제
- 디스크 공간 관리

---

## 개선 가능한 부분

1. **캐싱**: 인기 레시피, 추천 결과에 Redis 캐싱 적용
2. **비동기 처리**: YouTube 분석을 큐 시스템으로 전환 (Celery, Bull 등)
3. **에러 복구**: Whisper, OCR 실패 시 재시도 로직
4. **로깅**: Winston 등 전문 로깅 라이브러리 도입
5. **API 문서**: Swagger/OpenAPI 문서화
6. **테스트**: Unit 테스트, Integration 테스트 추가
7. **모니터링**: APM 도구 연동 (New Relic, Datadog 등)

---

*이 문서는 Cookit 서버의 구조와 기능을 분석한 것입니다.*

