# 🧠 Cookit Server

<div align="center">

**Node.js + Express + Supabase + AI 기반 백엔드 서버**

Cookit 프로젝트의 백엔드 서버로, AI 레시피 분석, 사용자 관리, 커뮤니티 기능, 냉장고 관리 등을 제공합니다.

[빠른 시작](#-빠른-시작) • [API 문서](#-api-문서) • [프로젝트 구조](#-프로젝트-구조) • [문제 해결](#-문제-해결)

</div>

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [빠른 시작](#-빠른-시작)
4. [환경 변수 설정](#-환경-변수-설정)
5. [프로젝트 구조](#-프로젝트-구조)
6. [API 문서](#-api-문서)
7. [AI 파이프라인](#-ai-파이프라인)
8. [문제 해결](#-문제-해결)

---

## 🎯 프로젝트 개요

Cookit Server는 Cookit 모바일 앱의 백엔드 API를 제공하는 Express.js 서버입니다. 주요 기능:

- 🤖 **AI 레시피 분석**: YouTube 영상을 자동으로 분석하여 레시피 추출
- 👥 **사용자 관리**: 인증, 프로필, 요리 기록 관리
- 🍳 **레시피 관리**: 레시피 CRUD, 카테고리, 좋아요, 추천 알고리즘
- 👥 **커뮤니티**: 게시글, 댓글, 좋아요 기능
- 🥘 **냉장고 관리**: 영수증 OCR, 재료 관리
- 📊 **추천 시스템**: 사용자 맞춤형 레시피 추천

---

## 🛠 기술 스택

### 핵심 기술
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Supabase (PostgreSQL)
- **Module System**: ES Modules (ESM)

### AI & ML
- **Google Gemini API**: 레시피 구조화 및 분석
- **Whisper**: 음성 → 텍스트 변환 (Python 스크립트)
- **Tesseract.js**: OCR (영수증 텍스트 추출)

### 보안 & 미들웨어
- **Helmet**: 보안 헤더 설정
- **CORS**: Cross-Origin Resource Sharing
- **Morgan**: HTTP 요청 로깅
- **Multer**: 파일 업로드 처리
- **Sharp**: 이미지 처리

### 외부 도구
- **yt-dlp**: YouTube 영상 다운로드
- **FFmpeg**: 오디오/비디오 처리

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: 18.x 이상
- **npm** 또는 **yarn**
- **Supabase 계정**: [supabase.com](https://supabase.com)
- **Gemini API Key**: [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
- **Python 3.x** (Whisper 사용 시)
- **FFmpeg** (비디오/오디오 처리 시)

### 1️⃣ 저장소 클론 및 이동

```bash
git clone <repository-url>
cd Cookit/Server
```

### 2️⃣ 의존성 설치

```bash
npm install
```

### 3️⃣ 환경 변수 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

`.env` 파일을 열어 실제 값으로 수정하세요. 자세한 내용은 [환경 변수 설정](#-환경-변수-설정) 섹션을 참고하세요.

### 4️⃣ 서버 실행

```bash
# 개발 모드 (nodemon 사용, 파일 변경 시 자동 재시작)
npm start
# 또는
npm run dev

# 프로덕션 모드
npm run prod
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 5️⃣ 서버 확인

브라우저에서 `http://localhost:3000`에 접속하거나, 다음 명령으로 확인:

```bash
curl http://localhost:3000
```

---

## ⚙️ 환경 변수 설정

### .env 파일 구조

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```env
# ==========================================
# 🚀 서버 기본 설정
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# 🤖 AI 서비스 (Google Gemini)
# ==========================================
# Gemini API 키 (https://ai.google.dev/gemini-api/docs/api-key)
GEMINI_API_KEY=your_gemini_api_key_here

# ==========================================
# 🗄️ Supabase 설정
# ==========================================
# Supabase 프로젝트 대시보드 > Settings > API 에서 확인 가능
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# ==========================================
# 📁 파일 업로드 관련 설정
# ==========================================
MAX_FILE_SIZE=100mb
UPLOAD_DIR=./uploads

# ==========================================
# 🧾 로깅 및 네트워크 설정
# ==========================================
LOG_LEVEL=info
# CORS 설정: 모바일 앱이 접근할 수 있는 Origin 목록
# 로컬 개발 시: http://localhost:3000,http://localhost:8081
# 모바일 기기 IP 추가: http://192.168.1.100:8081 (예시)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### 환경 변수 설명

#### 서버 기본 설정
- `PORT`: 서버가 실행될 포트 번호 (기본값: 3000)
- `NODE_ENV`: 실행 환경 (`development` / `production`)

#### Supabase 설정
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. 다음 값들을 복사:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** 키 → `SUPABASE_SERVICE_KEY` (⚠️ 절대 클라이언트에 노출 금지!)
   - **anon public** 키 → `SUPABASE_ANON_KEY`

#### Gemini API Key
1. [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key) 접속
2. **Create API Key** 클릭
3. 생성된 키를 `GEMINI_API_KEY`에 입력

#### CORS 설정
모바일 앱이 서버에 접근하려면 `ALLOWED_ORIGINS`에 모바일 앱의 Origin을 추가해야 합니다:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://192.168.1.100:8081
```

---

## 📁 프로젝트 구조

```
Server/
├── app.js                    # Express 서버 진입점
├── package.json              # 의존성 및 스크립트
├── .env.example              # 환경 변수 템플릿
├── .gitignore               # Git 제외 파일 목록
│
├── routes/                   # API 라우트
│   ├── ai.js                 # AI 분석 API
│   ├── auth.js               # 인증 API
│   ├── users.js              # 사용자 관리 API
│   ├── recipes.js            # 레시피 CRUD API
│   ├── userRecipes.js        # 사용자 레시피 API
│   ├── recipeLikes.js        # 레시피 좋아요 API
│   ├── recipeCategories.js   # 레시피 카테고리 API
│   ├── recommendations.js    # 추천 알고리즘 API
│   ├── userPosts.js          # 커뮤니티 게시글 API
│   ├── comments.js           # 댓글 API
│   ├── postLikes.js          # 게시글 좋아요 API
│   ├── receiptItems.js       # 냉장고 재료 API
│   ├── receiptList.js        # 영수증 목록 API
│   ├── receiptOcr.js         # 영수증 OCR API
│   └── youtube.js            # YouTube 관련 API
│
├── services/                 # 비즈니스 로직
│   ├── supabaseClient.js     # Supabase 클라이언트 설정
│   ├── supabaseService.js    # Supabase 유틸리티 함수
│   ├── aiPipelineService.js   # AI 파이프라인 서비스 (클래스)
│   ├── geminiService.js      # Gemini API 서비스
│   └── ocrHandler.js         # OCR 처리 서비스
│
├── scripts/                   # 독립 실행 스크립트
│   ├── run_full_pipeline.cjs  # YouTube 분석 전체 파이프라인
│   ├── ocr_analyze.cjs        # OCR 분석 스크립트
│   ├── generate_combined_text.cjs  # 텍스트 통합 스크립트
│   ├── generate_prompt.cjs    # 프롬프트 생성 스크립트
│   ├── send_to_gemini.cjs     # Gemini API 호출 스크립트
│   ├── generate_parsed_output.cjs  # 파싱 결과 생성 스크립트
│   ├── upload_to_supabase.cjs # Supabase 업로드 스크립트
│   └── test_whisper.py        # Whisper 음성 인식 스크립트
│
├── logs/                      # 로그 파일 (자동 생성)
├── uploads/                   # 업로드된 파일 (gitignore)
├── tessdata/                  # Tesseract OCR 언어 데이터 (gitignore)
│   ├── kor.traineddata        # 한국어 (수동 다운로드 필요)
│   └── eng.traineddata        # 영어 (수동 다운로드 필요)
│
└── (임시 파일 디렉토리들 - gitignore)
    ├── video_files/           # 다운로드된 YouTube 영상
    ├── temp_frames/          # 추출된 프레임
    ├── whisper_sub/           # Whisper 자막
    ├── ocr_frames/            # OCR 처리 프레임
    ├── combined_sub/          # 통합 텍스트
    ├── prompt_out/            # 생성된 프롬프트
    ├── parsed_out/             # 파싱된 결과
    └── result_out/             # 최종 결과
```

---

## 📚 API 문서

### 인증 (Authentication)

#### `POST /api/auth/login`
Google OAuth 토큰으로 로그인

**Request:**
```json
{
  "idToken": "google_id_token"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token"
}
```

---

### AI 분석 (AI Analysis)

#### `POST /api/ai/analyze-youtube`
YouTube 영상 분석 요청

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response (새 분석 시작):**
```json
{
  "success": true,
  "status": "processing",
  "message": "AI 분석이 백그라운드에서 실행 중입니다.",
  "videoId": "VIDEO_ID"
}
```

**Response (이미 분석됨):**
```json
{
  "success": true,
  "status": "completed",
  "message": "이미 분석된 영상입니다.",
  "videoId": "VIDEO_ID",
  "recipe": { ... }
}
```

#### `GET /api/ai/status/:id`
분석 상태 확인 (Polling)

**Response:**
```json
{
  "success": true,
  "status": "processing" | "completed",
  "videoId": "VIDEO_ID",
  "recipe": { ... }  // completed일 때만 포함
}
```

---

### 레시피 (Recipes)

#### `GET /api/recipes`
레시피 목록 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `category_id`: 카테고리 필터
- `difficulty`: 난이도 필터 (`easy` / `medium` / `hard`)
- `search`: 검색어

**Response:**
```json
{
  "success": true,
  "recipes": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### `GET /api/recipes/:id`
레시피 상세 조회

#### `POST /api/recipes`
레시피 생성 (관리자용)

#### `PUT /api/recipes/:id`
레시피 수정 (관리자용)

#### `DELETE /api/recipes/:id`
레시피 삭제 (관리자용)

---

### 추천 (Recommendations)

#### `GET /api/recommendations`
사용자 맞춤형 레시피 추천

**Query Parameters:**
- `user_id`: 사용자 ID (필수)
- `type`: 추천 타입 (`personalized` / `popular` / `similar`)

**Response:**
```json
{
  "success": true,
  "recommendations": [ ... ]
}
```

**추천 알고리즘:**
- **personalized**: 사용자 선호도 기반
- **popular**: 조회수 및 좋아요 기반 인기 레시피
- **similar**: "또 만들고 싶어요" - 완성한 요리의 카테고리 기반 유사 레시피

---

### 사용자 (Users)

#### `GET /api/users/:id`
사용자 정보 조회

#### `PUT /api/users/:id`
사용자 정보 수정

#### `GET /api/users/my-posts`
내 게시글 조회

#### `GET /api/users/my-ratings`
내 레시피 평점/댓글 조회

---

### 커뮤니티 (Community)

#### `GET /api/user-posts`
게시글 목록 조회

**Query Parameters:**
- `tags`: 필터 태그 (`공개` / `비공개`)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

#### `POST /api/user-posts`
게시글 생성

**Request:**
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "recipe_id": "recipe_id",
  "images": ["image_url1", "image_url2"],
  "user_id": "user_id",
  "tags": ["공개"]
}
```

#### `GET /api/user-posts/:id`
게시글 상세 조회

#### `PUT /api/user-posts/:id`
게시글 수정

#### `DELETE /api/user-posts/:id`
게시글 삭제

#### `POST /api/post-likes`
게시글 좋아요 추가/제거

#### `GET /api/comments`
댓글 목록 조회

#### `POST /api/comments`
댓글 생성

---

### 냉장고 (Refrigerator)

#### `GET /api/receipt-items`
냉장고 재료 목록 조회

#### `POST /api/receipt-items`
재료 추가

**Request:**
```json
{
  "name": "재료명",
  "quantity": 1,
  "expiry_date": "2024-12-31",
  "storage_method": "냉장",
  "user_id": "user_id"
}
```

#### `PUT /api/receipt-items/:id`
재료 수정

#### `DELETE /api/receipt-items/:id`
재료 삭제

#### `POST /api/receipt-ocr`
영수증 OCR 처리

**Request:**
```multipart/form-data
file: (이미지 파일)
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "name": "재료명",
      "quantity": 1
    }
  ]
}
```

---

## 🤖 AI 파이프라인

### YouTube 영상 분석 프로세스

1. **영상 다운로드** (`yt-dlp`)
   - YouTube URL에서 영상 다운로드
   - 오디오 분리

2. **병렬 처리**:
   - **OCR**: 영상 프레임에서 텍스트 추출 (Tesseract.js)
   - **Whisper**: 오디오에서 자막 추출 (Python Whisper)
   - **자막 다운로드**: YouTube 자막 다운로드 (yt-dlp)

3. **텍스트 통합**: OCR + Whisper + 자막을 하나의 텍스트로 통합

4. **프롬프트 생성**: 통합 텍스트를 기반으로 Gemini 프롬프트 생성

5. **Gemini API 호출**: 구조화된 레시피 생성

6. **파싱 및 저장**: 결과를 파싱하여 Supabase에 저장

### 파이프라인 실행

파이프라인은 `scripts/run_full_pipeline.cjs` 스크립트로 실행됩니다:

```bash
node scripts/run_full_pipeline.cjs "https://www.youtube.com/watch?v=VIDEO_ID"
```

서버에서는 `/api/ai/analyze-youtube` 엔드포인트를 통해 백그라운드로 실행됩니다.

### 로그 확인

분석 진행 상황은 `Server/logs/<video_id>.log` 파일에서 확인할 수 있습니다:

```bash
tail -f Server/logs/VIDEO_ID.log
```

---

## 🧾 OCR 설정 (Tesseract.js)

### 언어 데이터 다운로드

Cookit Server는 영수증 OCR을 위해 Tesseract.js를 사용합니다. 한국어와 영어 언어 데이터가 필요합니다:

1. **다운로드 링크:**
   - [kor.traineddata](https://github.com/tesseract-ocr/tessdata/raw/main/kor.traineddata)
   - [eng.traineddata](https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata)

2. **설치 위치:**
   ```
   Server/tessdata/
   ├── kor.traineddata
   └── eng.traineddata
   ```

3. **주의사항:**
   - 이 파일들은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다
   - OCR 기능을 사용하지 않는다면 다운로드하지 않아도 서버는 정상 실행됩니다
   - OCR 기능만 비활성화됩니다

---

## 🔧 문제 해결

### 일반적인 문제

#### 1. 서버가 시작되지 않음

**증상**: `npm start` 실행 시 오류

**해결책:**
- Node.js 버전 확인: `node --version` (18.x 이상 필요)
- 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`
- `.env` 파일이 올바르게 설정되었는지 확인

#### 2. Supabase 연결 오류

**증상**: `Supabase connection error`

**해결책:**
- `.env` 파일의 `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 확인

#### 3. AI 분석이 작동하지 않음

**증상**: YouTube 분석 요청 후 결과가 나오지 않음

**해결책:**
- `GEMINI_API_KEY`가 올바르게 설정되었는지 확인
- `Server/logs/<video_id>.log` 파일 확인
- Python 및 FFmpeg가 설치되어 있는지 확인 (Whisper 사용 시)
- `yt-dlp`가 설치되어 있는지 확인

#### 4. CORS 오류

**증상**: 모바일 앱에서 API 호출 시 CORS 오류

**해결책:**
- `Server/.env`의 `ALLOWED_ORIGINS`에 모바일 앱 Origin 추가
- 서버 재시작

#### 5. OCR이 작동하지 않음

**증상**: 영수증 OCR 결과가 나오지 않음

**해결책:**
- `Server/tessdata/` 폴더에 `kor.traineddata`, `eng.traineddata` 파일이 있는지 확인
- 이미지 파일 형식 확인 (JPG, PNG 지원)

### 로그 확인

**서버 로그:**
- 콘솔에 직접 출력 (Morgan 미들웨어)
- `Server/logs/` 폴더의 로그 파일

**AI 분석 로그:**
```bash
# 특정 영상의 분석 로그 확인
tail -f Server/logs/VIDEO_ID.log

# 최근 로그 파일 목록
ls -lt Server/logs/ | head -10
```

---

## 🔐 보안 주의사항

### ⚠️ 중요 보안 규칙

1. **`.env` 파일은 절대 Git에 커밋하지 마세요**
   - `.env.example`만 커밋
   - `.gitignore`에 `.env` 포함 확인

2. **`SUPABASE_SERVICE_KEY`는 절대 클라이언트에 노출하지 마세요**
   - 서버 사이드에서만 사용
   - 클라이언트는 `SUPABASE_ANON_KEY`만 사용

3. **민감한 정보 보호**
   - API 키는 환경 변수로만 관리
   - 로그에 민감한 정보 출력 금지

4. **CORS 설정**
   - 프로덕션 환경에서는 `ALLOWED_ORIGINS`를 명확히 지정
   - 와일드카드(`*`) 사용 지양

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">

**Made with ❤️ by Cookit Team**

</div>
