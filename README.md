# 🍳 Cookit - AI 기반 요리 레시피 플랫폼

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)

**AI가 분석한 YouTube 요리 영상을 레시피로 변환하고, 개인화된 추천을 제공하는 스마트 요리 앱**

[프로젝트 개요](#-프로젝트-개요) • [빠른 시작](#-빠른-시작) • [주요 기능](#-주요-기능) • [기술 스택](#-기술-스택) • [프로젝트 구조](#-프로젝트-구조)

</div>

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [프로젝트 구조](#-프로젝트-구조)
5. [빠른 시작](#-빠른-시작)
6. [개발 환경 설정](#-개발-환경-설정)
7. [문서](#-문서)
8. [문제 해결](#-문제-해결)

---

## 🎯 프로젝트 개요

**Cookit**은 AI 기술을 활용하여 YouTube 요리 영상을 자동으로 분석하고, 사용자 맞춤형 레시피를 추천하는 모바일 애플리케이션입니다. 

### 핵심 가치

- 🤖 **AI 기반 자동화**: YouTube 영상에서 레시피를 자동으로 추출하여 데이터베이스에 저장
- 🎯 **개인화 추천**: 사용자의 선호도, 요리 레벨, 냉장고 재료를 기반으로 한 맞춤형 레시피 추천
- 📱 **스마트 냉장고 관리**: 영수증 OCR을 통한 재료 자동 등록 및 유통기한 알림
- 🎤 **음성 제어**: 요리 중 음성 명령으로 조리 단계 제어
- 👥 **커뮤니티**: 레시피 공유 및 요리 경험 기록

---

## ✨ 주요 기능

### 1. 🤖 AI 레시피 분석
- **YouTube 영상 자동 분석**: URL만 입력하면 AI가 영상을 분석하여 레시피 추출
- **다중 AI 파이프라인**: OCR(영상 프레임 텍스트 추출) + Whisper(자막 추출) + Gemini(레시피 구조화)
- **실시간 분석 상태 확인**: 백그라운드 처리 및 진행 상황 폴링

### 2. 🎯 스마트 레시피 추천
- **개인화 추천**: 사용자 선호도 및 요리 레벨 기반
- **"또 만들고 싶어요"**: 완성한 요리의 카테고리를 분석하여 유사 레시피 추천
- **인기 레시피**: 조회수 및 좋아요 기반 인기 레시피
- **난이도별 추천**: 초급/중급/고급 난이도 필터링

### 3. 🥘 냉장고 관리
- **영수증 OCR**: 촬영한 영수증에서 재료 자동 인식 및 등록
- **유통기한 알림**: 재료 유통기한 당일 오전 9시 자동 알림
- **보관 방법 분류**: 냉장/냉동/실온별 자동 분류
- **수량 관리**: 재료 수량 추가/수정 및 삭제

### 4. 🎤 음성 제어 요리
- **Wake Word 감지**: "Hey Cookit" 등으로 음성 제어 시작
- **음성 명령 인식**: "다음", "이전", "반복", "일시정지" 등 조리 단계 제어
- **20초 음성 입력**: Wake Word 후 20초간 명령 대기

### 5. 👥 커뮤니티
- **레시피 기반 게시글**: 완성한 요리 사진과 후기 공유
- **좋아요 & 댓글**: 다른 사용자의 요리와 소통
- **공개/비공개 설정**: 게시글 공개 범위 설정
- **요리 기록**: 내가 완성한 요리와 별점/평점 관리

### 6. 📊 사용자 프로필
- **요리 레벨 설정**: 초급/중급/고급 선택
- **선호/비선호 재료**: 추천 시스템에 반영
- **요리 기록 통계**: 완성한 요리, 좋아요한 레시피, 작성한 게시글 관리

---

## 🛠 기술 스택

### 프론트엔드 (CookitMobile)
- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript / JavaScript
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **Database Client**: Supabase JS Client
- **Voice Control**: Picovoice (Porcupine + Rhino)
- **Notifications**: Expo Notifications
- **Image Processing**: Expo Image Picker
- **Video Player**: React Native Video

### 백엔드 (Server)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - Google Gemini API (레시피 구조화)
  - Whisper (음성 → 텍스트)
  - Tesseract.js (OCR)
- **File Processing**: Multer, Sharp
- **Security**: Helmet, CORS

### 인프라 & 서비스
- **Authentication**: Supabase Auth (Google OAuth)
- **Storage**: Supabase Storage
- **Push Notifications**: Expo Push Notifications (FCM 기반)
- **Video Download**: yt-dlp
- **Audio Processing**: FFmpeg

---

## 📁 프로젝트 구조

```
Cookit/
├── CookitMobile/              # React Native 모바일 앱
│   ├── features/              # 기능별 모듈
│   │   ├── auth/              # 인증 (Google OAuth)
│   │   ├── recipe/            # 레시피 (추천, 상세, 분석)
│   │   ├── refrigerator/      # 냉장고 관리 (재료, OCR)
│   │   ├── community/         # 커뮤니티 (게시글, 댓글)
│   │   ├── profile/           # 프로필 (설정, 기록)
│   │   └── navigation/        # 네비게이션
│   ├── shared/                # 공유 컴포넌트/서비스
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── services/          # 공통 서비스 (알림 등)
│   │   └── lib/               # 라이브러리 설정
│   ├── assets/                # 이미지, 폰트 등
│   ├── App.js                 # 앱 진입점
│   ├── app.config.js          # Expo 설정
│   └── package.json
│
├── Server/                    # Node.js 백엔드 서버
│   ├── routes/                # API 라우트
│   │   ├── ai.js              # AI 분석 API
│   │   ├── recipes.js         # 레시피 CRUD
│   │   ├── users.js           # 사용자 관리
│   │   ├── userPosts.js       # 게시글 관리
│   │   ├── recommendations.js # 추천 알고리즘
│   │   └── ...
│   ├── services/              # 비즈니스 로직
│   │   ├── aiPipelineService.js
│   │   ├── geminiService.js
│   │   ├── ocrHandler.js
│   │   └── supabaseClient.js
│   ├── scripts/               # 독립 실행 스크립트
│   │   ├── run_full_pipeline.cjs  # YouTube 분석 파이프라인
│   │   ├── ocr_analyze.cjs
│   │   ├── send_to_gemini.cjs
│   │   └── ...
│   ├── app.js                 # Express 서버 진입점
│   └── package.json
│
└── docs/                      # 프로젝트 문서
    ├── PROJECT_DOCUMENTATION.md
    └── ...
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js**: 18.x 이상
- **npm** 또는 **yarn**
- **Expo CLI**: `npm install -g expo-cli` (선택사항)
- **Supabase 계정**: [supabase.com](https://supabase.com)에서 프로젝트 생성
- **Google OAuth**: Google Cloud Console에서 OAuth 클라이언트 ID 생성
- **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급

### 1️⃣ 저장소 클론

```bash
git clone <repository-url>
cd Cookit
```

### 2️⃣ 모바일 앱 설정 (CookitMobile)

```bash
cd CookitMobile

# 의존성 설치
npm install

# 환경 변수 설정
# .env.example을 .env로 복사하고 실제 값 입력
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows

# .env 파일 편집 (아래 섹션 참고)
```

### 3️⃣ 서버 설정 (Server)

```bash
cd Server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows

# .env 파일 편집 (아래 섹션 참고)
```

### 4️⃣ 실행

**터미널 1 - 서버 실행:**
```bash
cd Server
npm start
# 서버가 http://localhost:3000 에서 실행됩니다
```

**터미널 2 - 모바일 앱 실행:**
```bash
cd CookitMobile
npm start
# 또는
npx expo start

# 플랫폼 선택:
# - 'a' 키: Android 에뮬레이터
# - 'i' 키: iOS 시뮬레이터
# - 'w' 키: 웹 브라우저
# - QR 코드 스캔: Expo Go 앱에서 실행
```

---

## ⚙️ 개발 환경 설정

### 환경 변수 상세 가이드

#### CookitMobile/.env

```env
# ==========================================
# Supabase 설정 (EXPO_PUBLIC_ 접두사 필수!)
# ==========================================
# Supabase 프로젝트 대시보드 > Settings > API에서 확인
EXPO_PUBLIC_SUPABASE_URL=''
EXPO_PUBLIC_SUPABASE_ANON_KEY=''

# ==========================================
# 개발 서버 설정
# ==========================================
# 로컬 개발: http://<당신의_PC_IP_주소>:3000/api
# ⚠️ 중요: 이더넷(유선) 연결 시 IP와 와이파이 연결 시 IP가 다를 수 있으니 확인 필요
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_BASE_URL=''

# ==========================================
# 개발/프로덕션 환경 구분
# ==========================================
EXPO_PUBLIC_ENV=development

# ==========================================
# 앱 버전 (선택사항)
# ==========================================
EXPO_PUBLIC_APP_VERSION=1.0.0

# ==========================================
# Picovoice Access Key (음성 제어용)
# ==========================================
# Picovoice Console (https://console.picovoice.ai/)에서 발급
EXPO_PUBLIC_PICOVOICE_ACCESS_KEY=''
```

**Supabase 키 찾는 방법:**
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **Settings** → **API**
3. **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
4. **anon public** 키 → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**API URL 설정 주의사항:**
- **이더넷(유선) 연결**: `ipconfig`로 확인한 이더넷 어댑터의 IPv4 주소 사용
- **와이파이 연결**: `ipconfig`로 확인한 무선 어댑터의 IPv4 주소 사용
- 연결 방식이 바뀌면 IP 주소도 변경되므로 `.env` 파일을 다시 확인하세요

#### Server/.env

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
SUPABASE_SERVICE_KEY=your_service_key_here  # service_role 키 (⚠️ 절대 클라이언트에 노출 금지!)
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

**Supabase Service Key 찾는 방법:**
1. Supabase Dashboard → **Settings** → **API**
2. **service_role** 키 (⚠️ 절대 클라이언트에 노출하지 마세요!)

**Gemini API Key 발급:**
1. [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key) 접속
2. **Create API Key** 클릭
3. 생성된 키를 `.env`에 입력

**Picovoice Access Key 발급 (음성 제어 기능 사용 시):**
1. [Picovoice Console](https://console.picovoice.ai/) 접속
2. 계정 생성 또는 로그인
3. **Access Key** 생성
4. 생성된 키를 `CookitMobile/.env`의 `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY`에 입력
5. ⚠️ 음성 제어 기능을 사용하지 않는다면 이 변수는 비워둬도 됩니다

### 네트워크 설정 (모바일 앱 ↔ 서버 통신)

모바일 앱이 서버에 접근하려면:

1. **PC와 모바일 기기가 같은 네트워크에 연결** (Wi-Fi 또는 이더넷)
2. **PC의 로컬 IP 주소 확인:**
   ```bash
   # Windows
   ipconfig
   # 연결된 어댑터의 IPv4 주소 확인
   # - 이더넷 어댑터: 유선 연결 시 IP
   # - 무선 LAN 어댑터: Wi-Fi 연결 시 IP
   
   # Mac/Linux
   ifconfig
   # 또는
   ip addr show
   ```
3. **Server/.env의 `ALLOWED_ORIGINS`에 모바일 IP 추가:**
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://192.168.1.100:8081
   ```
4. **CookitMobile/.env의 `EXPO_PUBLIC_API_URL`을 PC IP로 설정:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```
   
   ⚠️ **중요**: 이더넷(유선) 연결과 Wi-Fi 연결의 IP 주소가 다를 수 있습니다. 연결 방식을 변경하면 `.env` 파일의 IP 주소도 함께 변경해야 합니다.

### 데이터베이스 설정

Supabase 프로젝트를 생성한 후, 다음 테이블들이 필요합니다:

- `recipes` - 레시피 정보
- `recipe_steps` - 레시피 단계별 조리법
- `recipe_ingredients` - 레시피 재료
- `users` - 사용자 정보
- `user_posts` - 커뮤니티 게시글
- `recipe_comments` - 레시피 댓글/평점
- `recipe_likes` - 레시피 좋아요
- `receipt_items` - 냉장고 재료

자세한 스키마는 `docs/Setup_Guide_Recipe_DB.md`를 참고하세요.

---

## 📚 문서

### 주요 문서

- **[CookitMobile/README.md](./CookitMobile/README.md)**: 모바일 앱 상세 가이드
- **[Server/README.md](./Server/README.md)**: 서버 API 상세 가이드
- **[docs/PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md)**: 프로젝트 통합 문서

### 기능별 문서

- **음성 제어**: `CookitMobile/docs/PICOVOICE_SETUP.md`
- **네트워크 설정**: `CookitMobile/docs/README_Network_Setup.md`
- **FCM 알림**: `CookitMobile/docs/FCM_TEST_GUIDE.md`

---

## 🔧 문제 해결

### 일반적인 문제

#### 1. 모바일 앱이 서버에 연결되지 않음

**증상**: API 호출 실패, 네트워크 오류

**해결책**:
- PC와 모바일 기기가 같은 Wi-Fi에 연결되어 있는지 확인
- 방화벽이 포트 3000을 차단하지 않는지 확인
- `EXPO_PUBLIC_API_BASE_URL`이 올바른 IP 주소인지 확인
- 서버가 실행 중인지 확인 (`http://localhost:3000` 접속 테스트)

#### 2. Supabase 연결 오류

**증상**: 인증 실패, 데이터 조회 실패

**해결책**:
- `.env` 파일의 Supabase URL과 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS (Row Level Security) 정책이 올바르게 설정되어 있는지 확인

#### 3. YouTube 분석이 작동하지 않음

**증상**: 분석 요청 후 결과가 나오지 않음

**해결책**:
- `Server/.env`에 `GEMINI_API_KEY`가 설정되어 있는지 확인
- `Server/logs/` 폴더의 로그 파일 확인
- Python 및 FFmpeg가 설치되어 있는지 확인 (Whisper 사용 시)

#### 4. 알림이 작동하지 않음

**증상**: 유통기한 알림이 오지 않음

**해결책**:
- 실제 기기에서 테스트 (에뮬레이터에서는 제한적)
- 앱 설정에서 알림 권한이 허용되어 있는지 확인
- `expo-notifications` 패키지가 올바르게 설치되어 있는지 확인

### 로그 확인

**서버 로그:**
```bash
# Server/logs/ 폴더에서 최근 로그 확인
cd Server/logs
tail -f <video_id>.log
```

**모바일 앱 로그:**
- Expo 개발 서버 터미널에서 확인
- 또는 `npx react-native log-android` / `npx react-native log-ios`

---

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 이 저장소를 Fork
2. 새로운 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📄 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

<div align="center">

**Made with ❤️ by Cookit Team**

</div>
